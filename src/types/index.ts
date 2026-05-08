// src/types/index.ts

export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED' | 'CODING';
export type InterviewDomain = 
  | 'DSA' | 'SYSTEM_DESIGN' | 'OS' | 'DBMS' | 'CN' 
  | 'HR_BEHAVIORAL' | 'FULL_STACK' | 'FRONTEND' | 'BACKEND' | 'MACHINE_LEARNING';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type MessageRole = 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  profile?: Profile;
  createdAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  targetRole?: string;
  experience?: string;
  preferredStack: string[];
  totalSessions: number;
  avgScore: number;
  streakDays: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: InterviewType;
  domain: InterviewDomain;
  difficulty: Difficulty;
  company?: string;
  duration?: number;
  status: SessionStatus;
  messages: Message[];
  evaluation?: Evaluation;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  audioUrl?: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  fillerWordCount?: number;
  hesitationCount?: number;
  wordCount?: number;
  speakingDuration?: number;
  realtimeFeedback?: string;
}

export interface Evaluation {
  id: string;
  sessionId: string;
  overallScore: number;
  technicalScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  clarityScore?: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  detailedReport?: QuestionReport[];
}

export interface QuestionReport {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  idealAnswer?: string;
}

export interface CodeSubmission {
  id: string;
  sessionId: string;
  language: string;
  code: string;
  problem: string;
  testResults?: TestResult[];
  analysis?: CodeAnalysis;
  score?: number;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  executionTime?: number;
}

export interface CodeAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: number;
  edgeCasesHandled: boolean;
  suggestions: string[];
}

export interface Analytics {
  totalSessions: number;
  completedSessions: number;
  avgOverallScore: number;
  avgTechnicalScore: number;
  avgCommunicationScore: number;
  scoreHistory: ScorePoint[];
  domainScores: Record<string, number>;
  weeklyActivity: ActivityPoint[];
  topStrengths: string[];
  topWeaknesses: string[];
}

export interface ScorePoint {
  date: string;
  score: number;
  domain?: string;
}

export interface ActivityPoint {
  date: string;
  count: number;
}

export interface ResumeData {
  skills: string[];
  projects: ProjectData[];
  experience: ExperienceData[];
  education: EducationData[];
  summary?: string;
}

export interface ProjectData {
  name: string;
  description: string;
  technologies: string[];
}

export interface ExperienceData {
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
}

export interface EducationData {
  institution: string;
  degree: string;
  year: string;
}

export interface InterviewConfig {
  type: InterviewType;
  domain: InterviewDomain;
  difficulty: Difficulty;
  company?: string;
  resumeId?: string;
  duration: number;
}

export interface AIFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
  followUpQuestion?: string;
}

export const COMPANY_LIST = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Netflix', 'Uber', 'Airbnb', 'Flipkart', 'Swiggy',
  'Zomato', 'FAANG', 'Startup', 'MNC'
] as const;

export const DOMAIN_CONFIG: Record<InterviewDomain, { label: string; icon: string; color: string }> = {
  DSA: { label: 'Data Structures & Algorithms', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  SYSTEM_DESIGN: { label: 'System Design', icon: '🏗️', color: 'from-blue-500 to-cyan-500' },
  OS: { label: 'Operating Systems', icon: '💻', color: 'from-purple-500 to-pink-500' },
  DBMS: { label: 'Database Management', icon: '🗄️', color: 'from-green-500 to-teal-500' },
  CN: { label: 'Computer Networks', icon: '🌐', color: 'from-indigo-500 to-blue-500' },
  HR_BEHAVIORAL: { label: 'HR & Behavioral', icon: '🤝', color: 'from-rose-500 to-pink-500' },
  FULL_STACK: { label: 'Full Stack Dev', icon: '🔥', color: 'from-orange-500 to-red-500' },
  FRONTEND: { label: 'Frontend Dev', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  BACKEND: { label: 'Backend Dev', icon: '⚙️', color: 'from-slate-500 to-gray-500' },
  MACHINE_LEARNING: { label: 'Machine Learning', icon: '🧠', color: 'from-violet-500 to-purple-500' },
};
