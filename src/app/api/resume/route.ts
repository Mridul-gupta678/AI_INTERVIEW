// src/app/api/resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseResumeWithAI } from '@/services/ai.service';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    // Convert to buffer for text extraction
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    let resumeText = '';
    try {
      const pdfParse = await import('pdf-parse');
      const pdfData = await pdfParse.default(buffer);
      resumeText = pdfData.text;
    } catch {
      // Fallback: use filename + ask user to paste
      resumeText = `File: ${file.name}. PDF parsing failed, using basic extraction.`;
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
    }

    // Parse with AI
    const parsedData = await parseResumeWithAI(resumeText);

    // Deactivate previous resumes
    await prisma.resume.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Save to DB
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.name,
        fileUrl: '', // In production: upload to Cloudinary/S3 first
        parsedData: parsedData as any,
        isActive: true,
      },
    });

    return NextResponse.json({ resume, parsedData }, { status: 201 });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ resumes });
}
