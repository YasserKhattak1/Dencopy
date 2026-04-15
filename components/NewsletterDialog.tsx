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

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setErrors({});
    setStatus({ kind: 'idle' });
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger after the dialog closes.
    setTimeout(() => {
      triggerRef.current?.focus();
      resetForm();
    }, 220);
  }, [resetForm]);

  // Open handling: focus first field, lock scroll, ESC + focus trap.
  useEffect(() => {
    if (!open) return;

    const previouslyActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyActive?.focus?.();
    };
  }, [open, closeDialog]);

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
    <>
      <button
        type="button"
        ref={triggerRef}
        className="btn btn-primary"
        aria-haspopup="dialog"
        aria-controls="newsletter-dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Sign up to newsletter
      </button>

      {open && (
        <div
          id="newsletter-dialog"
          className="dialog-backdrop is-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          ref={dialogRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div className="dialog" role="document">
            <button
              type="button"
              className="dialog-close"
              aria-label="Close"
              onClick={closeDialog}
            >
              <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>

            <h3 id="dialog-title" className="dialog-title">
              Sign up to newsletter
            </h3>
            <p id="dialog-desc" className="dialog-desc">
              Be the first to hear when the future of switches arrives.
            </p>

            <form
              className={`form${isSuccess ? ' is-success' : ''}`}
              onSubmit={onSubmit}
              noValidate
            >
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

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up…' : 'Sign up'}
              </button>

              <p
                className={
                  'form-status' +
                  (status.kind === 'success' ? ' is-success' : '') +
                  (status.kind === 'error' ? ' is-error' : '')
                }
                role="status"
                aria-live="polite"
              >
                {status.kind === 'success' || status.kind === 'error' ? status.message : ''}
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
