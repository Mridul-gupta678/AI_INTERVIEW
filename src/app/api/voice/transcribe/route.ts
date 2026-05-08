// src/app/api/voice/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI, { toFile } from 'openai';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const openai = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileObj = await toFile(buffer, 'speech.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: fileObj,
      model: 'whisper-large-v3',
      language: 'en',
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (error: any) {
    console.error('Transcription error:', error.message || error);
    return NextResponse.json({ error: 'Transcription failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
