// src/emails/InterviewResultEmail.tsx
import * as React from 'react';

interface Props {
  userName: string;
  resultsUrl: string;
  domain: string;
  difficulty: string;
  evaluation: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    clarityScore: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
    hireable: boolean;
    seniorityFit: string;
  };
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function scoreGrade(score: number): string {
  if (score >= 85) return 'Excellent 🏆';
  if (score >= 70) return 'Good 👍';
  if (score >= 55) return 'Average 📈';
  return 'Needs Work 💪';
}

export function InterviewResultEmail({ userName, resultsUrl, evaluation, domain, difficulty }: Props) {
  const mainColor = scoreColor(evaluation.overallScore);
  const grade = scoreGrade(evaluation.overallScore);
  const firstName = userName?.split(' ')[0] || 'there';
  const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const subScores = [
    { label: 'Technical', score: evaluation.technicalScore },
    { label: 'Communication', score: evaluation.communicationScore },
    { label: 'Confidence', score: evaluation.confidenceScore },
    { label: 'Clarity', score: evaluation.clarityScore },
  ];

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Interview Results</title>
      </head>
      <body style={{ backgroundColor: '#0f172a', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '16px', padding: '10px 24px',
            }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>🧠 InterviewAI</span>
            </div>
          </div>

          {/* Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #1e293b)',
            borderRadius: '20px', padding: '36px', marginBottom: '24px',
            border: '1px solid #312e81',
          }}>
            <h1 style={{ color: '#e2e8f0', fontSize: '22px', margin: '0 0 8px 0', textAlign: 'center' }}>
              Hi {firstName}, your results are ready! 🎉
            </h1>
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '0 0 32px 0', fontSize: '14px' }}>
              {domainLabel} · {difficulty} difficulty
            </p>

            {/* Overall Score */}
            <div style={{
              background: '#0f172a', borderRadius: '16px', padding: '28px',
              textAlign: 'center', marginBottom: '24px', border: `2px solid ${mainColor}44`,
            }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px 0' }}>
                Overall Score
              </p>
              <p style={{ color: mainColor, fontSize: '60px', fontWeight: '800', margin: '0', lineHeight: '1' }}>
                {evaluation.overallScore}
              </p>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 16px 0' }}>/100</p>
              <span style={{
                background: `${mainColor}20`, border: `1px solid ${mainColor}40`,
                borderRadius: '999px', padding: '6px 20px',
                color: mainColor, fontSize: '14px', fontWeight: '600',
              }}>
                {grade}
              </span>
              {evaluation.hireable && (
                <div style={{ marginTop: '16px' }}>
                  <span style={{
                    background: '#10b98120', border: '1px solid #10b98140',
                    borderRadius: '999px', padding: '4px 16px',
                    color: '#10b981', fontSize: '13px',
                  }}>✓ Hireable</span>
                </div>
              )}
            </div>

            {/* Sub Scores */}
            <table width="100%" cellPadding="4" cellSpacing="0">
              <tbody>
                <tr>
                  {subScores.map(({ label, score }) => (
                    <td key={label} style={{ textAlign: 'center', padding: '0 4px' }}>
                      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '12px 6px' }}>
                        <p style={{ color: scoreColor(score), fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' }}>
                          {Math.round(score)}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{label}</p>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #334155' }}>
            <p style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>
              AI SUMMARY
            </p>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
              {evaluation.summary}
            </p>
          </div>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <div style={{ background: '#0d2e1f', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #10b98130' }}>
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>
                ✅ YOUR STRENGTHS
              </p>
              {evaluation.strengths.slice(0, 3).map((s, i) => (
                <p key={i} style={{ color: '#a7f3d0', fontSize: '14px', margin: '0 0 6px 0' }}>• {s}</p>
              ))}
            </div>
          )}

          {/* Improvements */}
          {evaluation.improvements.length > 0 && (
            <div style={{ background: '#1c1a0e', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #f59e0b30' }}>
              <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>
                🔧 TOP IMPROVEMENTS
              </p>
              {evaluation.improvements.slice(0, 3).map((imp, i) => (
                <p key={i} style={{ color: '#fde68a', fontSize: '14px', margin: '0 0 6px 0' }}>
                  {i + 1}. {imp}
                </p>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <a
              href={resultsUrl}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', borderRadius: '12px', padding: '14px 36px',
                fontWeight: '700', fontSize: '15px', textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              View Full Report →
            </a>
          </div>

          {/* Footer */}
          <hr style={{ borderColor: '#1e293b', borderStyle: 'solid', marginBottom: '24px' }} />
          <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', margin: '0 0 4px 0' }}>
            InterviewAI · AI-Powered Interview Practice Platform
          </p>
          <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', margin: 0 }}>
            You received this email because you completed an interview on InterviewAI.
          </p>
        </div>
      </body>
    </html>
  );
}
