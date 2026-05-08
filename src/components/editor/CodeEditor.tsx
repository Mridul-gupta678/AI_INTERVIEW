// src/components/editor/CodeEditor.tsx
'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, RotateCcw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: `def solution(nums: list[int]) -> int:
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    print(solution([1, 2, 3]))
`,
  javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function solution(nums) {
    // Write your solution here
}

// Test
console.log(solution([1, 2, 3]));
`,
  java: `import java.util.*;

class Solution {
    public int solve(int[] nums) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solve(new int[]{1, 2, 3}));
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int solve(vector<int>& nums) {
        // Write your solution here
        return 0;
    }
};

int main() {
    Solution sol;
    vector<int> nums = {1, 2, 3};
    cout << sol.solve(nums) << endl;
    return 0;
}
`,
};

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
}

interface CodeAnalysis {
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: number;
  edgeCasesHandled: boolean;
  suggestions: string[];
  feedback: string;
}

interface CodeEditorProps {
  sessionId: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
}

export function CodeEditor({ sessionId, onCodeChange, onLanguageChange }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
  const [running, setRunning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'analysis'>('output');
  const editorRef = useRef<any>(null);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const newCode = LANGUAGE_TEMPLATES[lang] || '';
    setCode(newCode);
    onLanguageChange?.(lang);
    onCodeChange?.(newCode);
    setTestResults([]);
    setAnalysis(null);
  };

  const runCode = async () => {
    setRunning(true);
    try {
      // In production, send to a sandboxed code execution service (e.g. Judge0, Piston API)
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, sessionId }),
      });
      const data = await res.json();
      setTestResults(data.testResults || []);
      setActiveTab('output');
    } catch {
      toast.error('Code execution failed');
    } finally {
      setRunning(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/code/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, sessionId }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setActiveTab('analysis');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const submitCode = async () => {
    await analyzeCode();
    toast.success('Code submitted! Check the analysis tab.');
  };

  const languages = ['python', 'javascript', 'java', 'cpp'];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[var(--bg-secondary)] shrink-0">
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                language === lang
                  ? 'bg-brand-600 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newCode = LANGUAGE_TEMPLATES[language];
              setCode(newCode);
              onCodeChange?.(newCode);
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run
          </button>
          <button
            onClick={submitCode}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all"
          >
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={(val) => {
            setCode(val || '');
            onCodeChange?.(val || '');
          }}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
          onMount={(editor) => { editorRef.current = editor; }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 12 },
            fontFamily: 'var(--font-geist-mono)',
          }}
        />
      </div>

      {/* Output/Analysis Panel */}
      <div className="h-48 border-t bg-[var(--bg-secondary)] flex flex-col shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b">
          {(['output', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-brand-400 border-brand-500'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'output' && (
              <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {testResults.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Run your code to see test results...</p>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                          result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        {result.passed
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        }
                        <div>
                          <p className={result.passed ? 'text-green-400' : 'text-red-400'}>
                            Test {i + 1}: {result.passed ? 'Passed' : 'Failed'}
                          </p>
                          {!result.passed && (
                            <div className="text-[var(--text-muted)] mt-1 font-mono space-y-0.5">
                              <p>Input: {result.input}</p>
                              <p>Expected: {result.expected}</p>
                              <p>Got: {result.actual}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!analysis ? (
                  <p className="text-xs text-[var(--text-muted)]">Submit your code to see AI analysis...</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="text-xs">
                        <p className="text-[var(--text-muted)]">Time</p>
                        <p className="font-mono font-medium text-[var(--text-primary)]">{analysis.timeComplexity}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-[var(--text-muted)]">Space</p>
                        <p className="font-mono font-medium text-[var(--text-primary)]">{analysis.spaceComplexity}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-[var(--text-muted)]">Score</p>
                        <p className="font-medium text-brand-400">{analysis.score}/100</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-[var(--text-muted)]">Edge Cases</p>
                        <p className={analysis.edgeCasesHandled ? 'text-green-400' : 'text-red-400'}>
                          {analysis.edgeCasesHandled ? '✓ Yes' : '✗ No'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{analysis.feedback}</p>
                    {analysis.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Suggestions:</p>
                        <ul className="space-y-0.5">
                          {analysis.suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-yellow-400 flex gap-1.5">
                              <span>•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
