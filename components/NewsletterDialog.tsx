'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase, NEWSLETTER_TABLE } from '@/lib/supabase';

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setErrors({});
    setStatus({ kind: 'idle' });
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    // Let the collapse animation run, then reset the form state.
    setTimeout(resetForm, 260);
  }, [resetForm]);

  // When the panel opens, move focus into the first field.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [open]);

  function validate(): boolean {
    const next: { name?: string; email?: string } = {};
    const n = name.trim();
    const em = email.trim();
    if (!n) next.name = 'Please enter your name.';
    if (!em) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(em)) next.email = 'Please enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      setStatus({ kind: 'error', message: 'Please fix the errors above.' });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setStatus({
        kind: 'error',
        message:
          'Newsletter is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      });
      return;
    }

    setStatus({ kind: 'loading' });

    const { error } = await supabase
      .from(NEWSLETTER_TABLE)
      .insert({ name: name.trim(), email: email.trim() });

    if (error) {
      // Postgres unique_violation on email
      if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
        setStatus({ kind: 'success', message: "You're already signed up — thanks!" });
        return;
      }
      setStatus({
        kind: 'error',
        message: error.message || 'Something went wrong. Please try again.',
      });
      return;
    }

    setStatus({ kind: 'success', message: "Thanks — you're on the list." });
  }

  const isLoading = status.kind === 'loading';
  const isSuccess = status.kind === 'success';

  return (
    <div className="newsletter-stack">
      {!open && (
        <button
          type="button"
          className="btn btn-primary"
          aria-expanded={open}
          aria-controls="newsletter-panel"
          onClick={() => setOpen(true)}
        >
          Sign up to newsletter
        </button>
      )}

      <div
        id="newsletter-panel"
        ref={panelRef}
        className={`newsletter-panel${open ? ' is-open' : ''}`}
        role="region"
        aria-label="Newsletter signup form"
        hidden={!open}
      >
        <div className="newsletter-panel-inner">
          {isSuccess ? (
            <div className="newsletter-thankyou" role="status" aria-live="polite">
              <span className="thankyou-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width={22} height={22} focusable="false">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
              <span className="thankyou-pill">Thanks for joining.</span>
            </div>
          ) : (
            <>
              <h3 className="newsletter-title">Sign up to newsletter</h3>
              <p className="newsletter-desc">
                Be the first to hear when the future of switches arrives.
              </p>

              <form className="form" onSubmit={onSubmit} noValidate>
                <div className={`field${errors.name ? ' has-error' : ''}`}>
                  <label htmlFor="name">Name</label>
                  <input
                    ref={firstFieldRef}
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    required
                    maxLength={80}
                    aria-invalid={errors.name ? true : undefined}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="field-error" role="alert">{errors.name}</p>}
                </div>

                <div className={`field${errors.email ? ' has-error' : ''}`}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                    maxLength={254}
                    aria-invalid={errors.email ? true : undefined}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="field-error" role="alert">{errors.email}</p>}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing up…' : 'Sign up'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closePanel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>

                <p
                  className={
                    'form-status' +
                    (status.kind === 'error' ? ' is-error' : '')
                  }
                  role="status"
                  aria-live="polite"
                >
                  {status.kind === 'error' ? status.message : ''}
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
