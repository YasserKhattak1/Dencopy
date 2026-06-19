import { NextResponse } from 'next/server';
import { getSQL } from '@/lib/neon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();

  if (!name || name.length > 80) {
    return NextResponse.json(
      { error: 'Name is required (max 80 characters).' },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: 'A valid email is required.' },
      { status: 400 }
    );
  }

  try {
    const sql = getSQL();
    await sql`
      INSERT INTO newsletter_signups (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO NOTHING
    `;

    // Fire-and-forget email notification to the team via FormSubmit.
    fetch('https://formsubmit.co/ajax/Yasser@getden.co.uk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name,
        email,
        _subject: `New Den newsletter signup: ${name}`,
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (/duplicate|unique_violation|23505/i.test(msg)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error('Newsletter insert failed:', msg);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
