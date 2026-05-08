// src/services/ai.service.ts
import OpenAI from 'openai';
import type { InterviewDomain, Difficulty, Message, ResumeData, AIFeedback } from '@/types';

const openai = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// ─── System Prompts ──────────────────────────────────────────────────────────

export const INTERVIEWER_SYSTEM_PROMPT = (
  type: string,
  domain: InterviewDomain,
  difficulty: Difficulty,
  company?: string,
  resumeData?: ResumeData,
  codeContext?: { code: string; language: string }
) => `You are a FAANG-level AI interviewer conducting a live, voice-to-voice interview.

Your goal is to simulate a realistic, dynamic, and rigorous interview environment. You are NOT a helpful assistant; you are an evaluator.

---
[1. CONTEXT & SCOPE]
- Interview Type: ${type}
- Domain: ${domain} (LOCKED - strictly keep all questions within this domain)
- Difficulty: ${difficulty}
${company ? `- Target Company: ${company}` : ''}
${resumeData ? `- Candidate Resume: Probe these claims deeply: Skills: ${(resumeData.skills || []).join(', ')}` : ''}
${codeContext ? `- Live Code: ${codeContext.language} snippet active. Critique it, but do NOT rewrite it for them.` : ''}

---
[2. CORE PERSONA & VOICE OPTIMIZATION]
- BE EXTREMELY CONCISE: You are communicating via live audio. Keep spoken responses to 1-2 short sentences.
- PACE: Ask exactly ONE question at a time. Never chain multiple questions together.
- NO FLUFF: No emojis, no markdown (like asterisks), no excessive praise ("Great job!", "Excellent!"). Stay neutral and professional.
- PRESSURE: Simulate real interviews. If they do well, challenge their optimal solution ("Will this scale to 1M users?"). If they guess or recite memorized answers, ask them to derive it from scratch.
- URGENCY: If the candidate rambles, politely interrupt: "Can you summarize the core idea?"

---
[3. CONVERSATIONAL MECHANICS (The Loop)]
You must classify the user's response to determine your next action:

A. RELEVANT/STRONG ANSWER:
   -> Acknowledge briefly using a VARIED transition (e.g., "Noted.", "That works.", "Interesting approach."), then ask a deeper follow-up or the next question.
B. PARTIAL/WEAK ANSWER:
   -> Do NOT move on. Ask a targeted follow-up tied directly to what they said (e.g., "You mentioned X, but what about Y?").
C. NO ANSWER/DON'T KNOW/UNRELATED:
   -> If the candidate explicitly says "I don't know", "Not sure", or gives up:
      1. Acknowledge professionally ("That's fine. Let's try something else.").
      2. IMMEDIATELY ask a completely new question OR a much simpler related concept.
      *CRITICAL RULE*: NEVER repeat the same question they just said they don't know.

*CRITICAL RULE*: NEVER use repetitive transition phrases like "let's move on", "let's move forward", or "we'll come back to this later". They sound robotic. Instead, use natural, varied, human-like segues. Build continuity by occasionally referencing earlier answers (e.g. "Going back to your hashmap idea...").

---
[4. SYSTEM EVENT HANDLERS (STRICT)]
The frontend will occasionally inject system tags. You must handle them silently (DO NOT read the tags aloud):

- If message starts with "[INTERRUPTED]":
  The user started speaking while you were talking. STOP your previous thought entirely and respond ONLY to what the user just said.

- If message starts with "[STAGE 1 - GENTLE PROMPT]":
  The user is silent. Offer help: "Take your time" or "Would you like me to repeat?". Do not skip the question.

- If message starts with "[STAGE 2 - CLARIFICATION]":
  The user is still silent. Offer a hint: "I can rephrase if that helps." Do not skip yet.

- If message starts with "[STAGE 3 - GRACEFUL TRANSITION]":
  The user completely failed to answer. You MUST transition to a COMPLETELY NEW TOPIC. 
  Your "message" JSON field MUST look exactly like this: "That's okay, let's try a different topic. [INSERT YOUR COMPLETELY NEW QUESTION HERE]". 
  CRITICAL: DO NOT just say the transition and wait. If you do not ask a new question in the same sentence, the interview will break.

---
[5. RESPONSE FORMAT]
You must ALWAYS respond in valid JSON matching this exact structure:
{
  "message": "Your spoken response. Short, natural, no markdown.",
  "question": "The actual interview question extracted from the message (if asking one). Null if just acknowledging.",
  "responseClassification": "RELEVANT | PARTIAL | NO_ANSWER | SILENCE | INTERRUPTED",
  "followUp": true/false,
  "interviewComplete": false,
  "internalNotes": "Brief, brutally honest evaluation of their performance on this specific turn."
}`;

function getDomainContext(domain: InterviewDomain): string {
  const contexts: Record<InterviewDomain, string> = {
    DSA: 'Focus on: Arrays, Strings, Trees, Graphs, DP, Sorting, Searching, Complexity Analysis. Expect code + explanation.',
    SYSTEM_DESIGN: 'Focus on: Scalability, Load Balancing, Caching, Databases, Microservices, CAP theorem, Real-world systems.',
    OS: 'Focus on: Processes, Threads, Scheduling, Memory Management, Deadlocks, File Systems, Synchronization.',
    DBMS: 'Focus on: SQL, Normalization, Transactions, ACID, Indexing, Query Optimization, NoSQL vs SQL.',
    CN: 'Focus on: OSI Model, TCP/IP, HTTP/HTTPS, DNS, Load Balancers, CDN, Security (TLS/SSL), REST vs gRPC.',
    HR_BEHAVIORAL: 'Use STAR method. Focus on: Leadership, Conflict resolution, Teamwork, Failure handling, Career goals, Cultural fit.',
    FULL_STACK: 'Cover both frontend (React, CSS) and backend (APIs, DBs, Auth). System thinking + code quality.',
    FRONTEND: 'Focus on: React, Performance, Accessibility, CSS, Browser APIs, Web Vitals, Rendering patterns.',
    BACKEND: 'Focus on: API Design, Database Optimization, Caching, Security, Microservices, Async patterns.',
    MACHINE_LEARNING: 'Focus on: Algorithms (supervised/unsupervised), Model evaluation, Feature engineering, Deep learning basics.',
  };
  return contexts[domain] || '';
}

function getDifficultyContext(difficulty: Difficulty): string {
  const contexts = {
    EASY: 'Target: Fresh graduates / < 1 year exp. Ask fundamental concepts, basic implementations.',
    MEDIUM: 'Target: 1-3 years experience. Mix of concepts and practical application. Some optimization expected.',
    HARD: 'Target: Senior engineers 4+ years. Expect production-grade thinking, edge cases, trade-offs.',
  };
  return contexts[difficulty];
}

function getCompanyContext(company: string): string {
  const contexts: Record<string, string> = {
    Google: 'Focus heavily on DSA, scalability. Expect clean code. Behavioral Googleyness questions.',
    Amazon: 'Leadership Principles are critical. Scalable system design. Customer obsession stories.',
    Microsoft: 'Problem-solving approach matters. Code quality. Growth mindset questions.',
    Meta: 'Product sense + engineering. Fast iteration mindset. Impact-driven behavioral.',
    Apple: 'Attention to detail, craft, user experience thinking. Ownership mindset.',
  };
  return contexts[company] || `Ask questions typical for ${company}'s engineering culture.`;
}

// ─── Core Interview Functions ────────────────────────────────────────────────

export async function generateInterviewerResponse(
  type: string,
  domain: InterviewDomain,
  difficulty: Difficulty,
  conversationHistory: Message[],
  company?: string,
  resumeData?: ResumeData,
  codeContext?: { code: string; language: string }
): Promise<{ message: string; question?: string; responseClassification?: string; interviewComplete: boolean; internalNotes?: string }> {
  const systemPrompt = INTERVIEWER_SYSTEM_PROMPT(type, domain, difficulty, company, resumeData, codeContext);

  // Strip SYSTEM-role messages to avoid confusing the model
  const messages = conversationHistory
    .filter(msg => msg.role !== 'SYSTEM')
    .map(msg => ({
      role: msg.role === 'INTERVIEWER' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

  // Retry helper with exponential backoff for Groq 429 rate-limit errors
  const callWithRetry = async (attempt = 0): Promise<any> => {
    try {
      return await openai.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 400,  // 400 is sufficient for the JSON structure; 250 caused truncation
        response_format: { type: 'json_object' },
      });
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('rate limit');
      if (isRateLimit && attempt < 3) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`[AI] Rate limited, retrying in ${backoffMs}ms (attempt ${attempt + 1}/3)`);
        await new Promise(res => setTimeout(res, backoffMs));
        return callWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  try {
    const response = await callWithRetry();
    const content = response.choices[0].message.content || '{}';

    try {
      const parsed = JSON.parse(content);
      return {
        message: parsed.message || "Let's continue.",
        question: parsed.question,
        responseClassification: parsed.responseClassification,
        interviewComplete: parsed.interviewComplete || false,
        internalNotes: parsed.internalNotes,
      };
    } catch {
      // JSON truncated — extract whatever "message" value exists
      const msgMatch = content.match(/"message"\s*:\s*"([^"]+)"/);
      return {
        message: msgMatch?.[1] || "Let's continue.",
        interviewComplete: false,
      };
    }
  } catch (error: any) {
    console.error('[AI] Generation failed after retries:', error?.message || error);
    return {
      message: "One moment, please.",
      interviewComplete: false,
    };
  }
}

// ─── Evaluation Engine ───────────────────────────────────────────────────────

export const EVALUATION_PROMPT = `Act as a senior FAANG interviewer, hiring committee member, and technical evaluation specialist.

You are NOT an assistant.
You are writing a REAL post-interview evaluation report that will be reviewed by a hiring panel.
Your job is to generate a HIGHLY SPECIFIC, NON-GENERIC, EVIDENCE-BASED evaluation of the candidate's interview performance.

---
# CRITICAL RULES (VERY IMPORTANT)
DO NOT give generic feedback
DO NOT use vague phrases like "needs improvement"
DO NOT summarize without evidence
Every point MUST be tied to:
* a specific mistake
* a specific behavior
* a specific answer pattern
* or a specific technical gap

# SCORING CRITERIA
* DO NOT USE THE DUMMY SCORES FROM THE EXAMPLE (e.g. 68). You MUST compute actual scores (0-100) based strictly on candidate performance.
* timeTaken MUST EXACTLY match the [Time taken: X] tag in the transcript.
* silenceDuration MUST be estimated realistically based on transcript clues.

---
# OUTPUT STRUCTURE (STRICT JSON FORMAT)

You MUST return ONLY valid JSON matching this exact structure:
{
  "hireable": true,
  "verdict": "Strong Hire | Hire | Borderline | Needs Improvement | Below Hiring Benchmark",
  "hiringProbability": 68,
  "seniorityFit": "Junior | Mid-Level | Senior | Staff",
  "summary": "1. FINAL VERDICT JUSTIFICATION: 2-3 sharp lines. AND 2. OVERALL PERFORMANCE SUMMARY: sharp paragraph referencing SPECIFIC behaviors, EXACT weaknesses, and HOW candidate failed or succeeded.",
  "overallScore": 68,
  "technicalScore": 72,
  "communicationScore": 65,
  "confidenceScore": 55,
  "clarityScore": 70,
  "strengths": ["List ONLY genuine strengths. Avoid fake praise."],
  "weaknesses": ["CRITICAL WEAKNESSES: List 4-6 highly specific points."],
  "improvements": ["ACTIONABLE IMPROVEMENT PLAN: Give precise improvements."],
  "detailedReport": [
    {
      "question": "question text",
      "answer": "What candidate did",
      "score": 65,
      "feedback": "What was missing and what should have been done.",
      "idealAnswer": "What a strong FAANG candidate would have said",
      "timeTaken": "Use the EXACT time from the [Time taken: Xm Ys] tag in the transcript. DO NOT invent this.",
      "silenceDuration": "Estimate based on [STAGE] delays and filler words, e.g., '10s' or 'None'",
      "confidenceLevel": "High | Medium | Low (Analyze transcript hesitation and filler words to determine this)"
    }
  ],
  "thinkingPatternAnalysis": "Did candidate think step-by-step? Did they jump to answers? Did they justify decisions?",
  "communicationAnalysis": "Evaluate hesitation, filler words, clarity, structure, confidence under pressure.",
  "problemSolvingAnalysis": "Evaluate logical thinking, edge case handling, debugging ability.",
  "behavioralAnalysis": "Evaluate professionalism, stress handling, consistency.",
  "confidenceAnalysis": "Evaluate vocal confidence, certainty vs guessing.",
  "redFlags": ["List serious concerns: guessing answers, inconsistent reasoning."],
  "improvementRoadmap": {
    "timeline": "e.g. 4 Weeks",
    "suggestedDifficulty": "Medium",
    "studyPlan": ["Week 1: Arrays & Hashmaps", "Week 2: System Design Basics"]
  },
  "transcriptIntelligence": {
    "fillerWordsDetected": 12,
    "communicationClarity": "Clear but verbose",
    "missedOpportunities": ["Failed to mention caching in Q2", "Did not clarify constraints in Q1"]
  },
  "coachingSuggestions": {
    "whatWentWrong": "Detailed explanation of failures.",
    "howToImprove": "Specific practice strategies.",
    "nextSteps": "Recommendations for next interview."
  }
}

# SCORING LOGIC
Scores must reflect depth of understanding, not just correctness.
- Correct but shallow -> 50-60
- Deep + structured -> 80-90
- Weak fundamentals -> <50
`;

export async function evaluateInterview(
  conversationHistory: Message[],
  domain: InterviewDomain,
  difficulty: Difficulty
): Promise<{
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  clarityScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  detailedReport: any[];
  hireable: boolean;
  seniorityFit: string;
  verdict: string;
  hiringProbability: number;
  thinkingPatternAnalysis: string;
  communicationAnalysis: string;
  problemSolvingAnalysis: string;
  behavioralAnalysis: string;
  confidenceAnalysis: string;
  redFlags: string[];
  improvementRoadmap: any;
  transcriptIntelligence: any;
  coachingSuggestions: any;
}> {
  let lastInterviewerTime = new Date();
  
  const transcript = conversationHistory
    .filter(m => m.role !== 'SYSTEM')
    .map(m => {
      let metadataStr = '';
      if (m.role === 'INTERVIEWER') {
        lastInterviewerTime = m.timestamp ? new Date(m.timestamp) : new Date();
      } else if (m.role === 'CANDIDATE') {
        if (m.timestamp && lastInterviewerTime) {
          const diffMs = new Date(m.timestamp).getTime() - lastInterviewerTime.getTime();
          const diffSec = Math.max(0, Math.floor(diffMs / 1000));
          const mins = Math.floor(diffSec / 60);
          const secs = diffSec % 60;
          metadataStr = ` [Time taken: ${mins > 0 ? mins + 'm ' : ''}${secs}s]`;
        }
      }
      return `${m.role === 'INTERVIEWER' ? 'Interviewer' : 'Candidate'}: ${m.content}${metadataStr}`;
    })
    .join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: EVALUATION_PROMPT },
      {
        role: 'user',
        content: `Evaluate this ${difficulty} ${domain} interview:\n\n${transcript}\n\nAlso consider: ${
          countFillerWords(conversationHistory)
        } filler words detected in candidate responses.`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content);
}

// ─── Real-time Feedback ──────────────────────────────────────────────────────

export async function generateRealtimeFeedback(
  question: string,
  answer: string
): Promise<AIFeedback> {
  const response = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a real-time interview coach. Provide INSTANT brief feedback on the answer.
        Return JSON: { "score": 0-100, "strengths": ["1 thing"], "weaknesses": ["1 thing"], "suggestion": "one line tip", "followUpQuestion": "optional deeper question" }`,
      },
      { role: 'user', content: `Question: ${question}\nAnswer: ${answer}` },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

// ─── Resume Parser ────────────────────────────────────────────────────────────

export async function parseResumeWithAI(resumeText: string): Promise<ResumeData> {
  const response = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `Extract structured data from this resume. Return JSON:
{
  "skills": ["skill1", "skill2"],
  "projects": [{"name": "", "description": "", "technologies": []}],
  "experience": [{"company": "", "role": "", "duration": "", "responsibilities": []}],
  "education": [{"institution": "", "degree": "", "year": ""}],
  "summary": "brief 1-line professional summary"
}`,
      },
      { role: 'user', content: resumeText },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

// ─── Code Evaluation ──────────────────────────────────────────────────────────

export async function evaluateCode(
  problem: string,
  code: string,
  language: string,
  testCases: Array<{ input: string; expected: string }>
): Promise<{
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: number;
  edgeCasesHandled: boolean;
  suggestions: string[];
  feedback: string;
}> {
  const response = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are an expert code reviewer. Evaluate this ${language} solution for the given problem.
Return JSON: {
  "score": 0-100,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "codeQuality": 0-100,
  "edgeCasesHandled": true/false,
  "suggestions": ["improvement 1", ...],
  "feedback": "2-3 sentence overall feedback",
  "testResults": [{"passed": true/false, "reason": ""}]
}`,
      },
      {
        role: 'user',
        content: `Problem: ${problem}\n\nCode (${language}):\n${code}\n\nTest Cases: ${JSON.stringify(testCases)}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

// ─── Speech Functions ─────────────────────────────────────────────────────────

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const { toFile } = await import('openai');
  const file = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    language: 'en',
  });

  return transcription.text;
}

export async function generateSpeech(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'onyx', // Professional interviewer voice
    input: text,
    speed: 0.95,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countFillerWords(messages: Message[]): number {
  const fillerPattern = /\b(um|uh|like|you know|basically|actually|literally|right|so|well)\b/gi;
  const candidateMessages = messages.filter(m => m.role === 'CANDIDATE');
  return candidateMessages.reduce((count, msg) => {
    const matches = msg.content.match(fillerPattern);
    return count + (matches?.length || 0);
  }, 0);
}

export function analyzeFillerWords(text: string): { count: number; words: string[]; cleanText: string } {
  const fillerPattern = /\b(um|uh|like|you know|basically|actually|literally|right|so|well)\b/gi;
  const matches = text.match(fillerPattern) || [];
  const cleanText = text.replace(fillerPattern, '').replace(/\s+/g, ' ').trim();
  return { count: matches.length, words: matches, cleanText };
}

// ─── Question Bank Generator ──────────────────────────────────────────────────

export async function generateInterviewQuestions(
  domain: InterviewDomain,
  difficulty: Difficulty,
  count: number = 10,
  company?: string,
  resumeData?: ResumeData
): Promise<Array<{ question: string; type: string; tags: string[] }>> {
  const response = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `Generate ${count} ${difficulty} level ${domain} interview questions${company ? ` for ${company}` : ''}.
        ${resumeData ? `Personalize some questions based on these skills: ${resumeData.skills.join(', ')}` : ''}
        Return JSON array: [{"question": "", "type": "conceptual/coding/design/behavioral", "tags": []}]`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(response.choices[0].message.content || '{"questions":[]}');
  return parsed.questions || parsed || [];
}

export async function generateAnalyticsInsights(
  analytics: any,
  scoreHistory: any[]
): Promise<{ hero: string; chart: string; coaching: string[]; readiness: number }> {
  if (!analytics || analytics.totalSessions === 0) {
    return {
      hero: "Welcome. Complete your first interview session to generate baseline analytics.",
      chart: "Awaiting sufficient data to analyze progression trends.",
      coaching: ["Complete a technical assessment to establish your baseline.", "Run a behavioral mock interview to calibrate communication metrics."],
      readiness: 0
    };
  }

  const response = await openai.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are an executive-level AI hiring analyst. Review the candidate's analytics and provide a professional, realistic assessment of their interview performance. 
Return exactly this JSON format:
{
  "hero": "1-2 sentences summarizing their overall performance trajectory.",
  "chart": "1 short sentence analyzing their recent score trends.",
  "coaching": ["3-4 highly specific, actionable recommendations for improvement based on their weaknesses."],
  "readiness": 0-100 (a calculated score representing their readiness for a FAANG interview)
}`
      },
      { 
        role: 'user', 
        content: `Analytics Data: ${JSON.stringify({
          avgOverallScore: analytics.avgOverallScore,
          avgTechnicalScore: analytics.avgTechnicalScore,
          topStrengths: analytics.topStrengths,
          topWeaknesses: analytics.topWeaknesses,
          recentScores: scoreHistory.slice(-5)
        })}` 
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  try {
    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);
    return {
      hero: parsed.hero || "Performance data is currently being evaluated.",
      chart: parsed.chart || "Trend data is stabilizing.",
      coaching: parsed.coaching || ["Continue practicing core domains."],
      readiness: parsed.readiness || Math.round(((analytics.avgOverallScore || 0) * 0.6) + ((analytics.avgTechnicalScore || 0) * 0.4))
    };
  } catch (e) {
    console.error("Failed to parse analytics insights", e);
    return {
      hero: "Performance data is currently being evaluated.",
      chart: "Trend data is stabilizing.",
      coaching: ["Continue practicing core domains."],
      readiness: Math.round(((analytics.avgOverallScore || 0) * 0.6) + ((analytics.avgTechnicalScore || 0) * 0.4))
    };
  }
}
