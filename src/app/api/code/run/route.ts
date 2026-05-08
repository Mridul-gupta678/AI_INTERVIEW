// src/app/api/code/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Uses Piston API (free, open-source) for sandboxed execution
const PISTON_API = 'https://emkc.org/api/v2/piston';

const LANG_MAP: Record<string, { language: string; version: string }> = {
  python:     { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java', version: '15.0.2' },
  cpp:        { language: 'c++', version: '10.2.0' },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, language } = await req.json();
  const langConfig = LANG_MAP[language];

  if (!langConfig) return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });

  try {
    const res = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ name: `main.${language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language}`, content: code }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    const data = await res.json();
    const output = data.run?.stdout || data.run?.stderr || data.compile?.stderr || 'No output';
    const hasError = !!(data.run?.stderr || data.compile?.stderr);

    // Basic test result simulation
    const testResults = [
      {
        passed: !hasError,
        input: 'Sample input',
        expected: 'Expected output',
        actual: output.slice(0, 200),
      }
    ];

    return NextResponse.json({ output, testResults, error: hasError ? output : null });
  } catch {
    return NextResponse.json({ error: 'Execution service unavailable' }, { status: 503 });
  }
}
