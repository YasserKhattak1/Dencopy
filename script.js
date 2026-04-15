/* Den — landing page
   Newsletter dialog + Supabase submission
   Replace the placeholders below with your project values.
*/

const SUPABASE_URL = "YOUR_SUPABASE_URL";       // e.g. https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const SUPABASE_TABLE = "newsletter_signups";

(function () {
  "use strict";

  const openBtn   = document.getElementById("openNewsletter");
  const closeBtn  = document.getElementById("closeNewsletter");
  const dialog    = document.getElementById("newsletterDialog");
  const form      = document.getElementById("newsletterForm");
  const statusEl  = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");

  let lastFocused = null;

  /* ----- Dialog ----- */
  function openDialog() {
    lastFocused = document.activeElement;
    dialog.hidden = false;
    // force reflow so transition plays
    void dialog.offsetWidth;
    dialog.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown);
    setTimeout(() => nameInput.focus(), 50);
  }

  function closeDialog() {
    dialog.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    setTimeout(() => {
      dialog.hidden = true;
      resetForm();
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }, 200);
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog();
    } else if (e.key === "Tab") {
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    const focusables = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  openBtn.addEventListener("click", openDialog);
  closeBtn.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeDialog();
  });

  /* ----- Validation ----- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, message) {
    const field = input.closest(".field");
    const errEl = field.querySelector(".field-error");
    if (message) {
      field.classList.add("has-error");
      errEl.textContent = message;
      input.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("has-error");
      errEl.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  function validate() {
    let ok = true;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
      setFieldError(nameInput, "Please enter your name.");
      ok = false;
    } else {
      setFieldError(nameInput, "");
    }

    if (!email) {
      setFieldError(emailInput, "Please enter your email.");
      ok = false;
    } else if (!EMAIL_RE.test(email)) {
      setFieldError(emailInput, "Please enter a valid email address.");
      ok = false;
    } else {
      setFieldError(emailInput, "");
    }

    return { ok, name, email };
  }

  nameInput.addEventListener("input", () => {
    if (nameInput.closest(".field").classList.contains("has-error")) {
      setFieldError(nameInput, nameInput.value.trim() ? "" : "Please enter your name.");
    }
  });
  emailInput.addEventListener("input", () => {
    if (emailInput.closest(".field").classList.contains("has-error")) {
      const v = emailInput.value.trim();
      if (!v) setFieldError(emailInput, "Please enter your email.");
      else if (!EMAIL_RE.test(v)) setFieldError(emailInput, "Please enter a valid email address.");
      else setFieldError(emailInput, "");
    }
  });

  /* ----- Status ----- */
  function setStatus(message, kind) {
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-success", "is-error");
    if (kind) statusEl.classList.add(kind);
  }

  function resetForm() {
    form.reset();
    form.classList.remove("is-success");
    setFieldError(nameInput, "");
    setFieldError(emailInput, "");
    setStatus("", null);
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign up";
  }

  /* ----- Submit to Supabase ----- */
  async function submitToSupabase(name, email) {
    if (!SUPABASE_URL || SUPABASE_URL.startsWith("YOUR_") ||
        !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
      throw new Error("Supabase is not configured.");
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ name, email })
    });

    if (!res.ok) {
      let detail = "";
      try {
        const data = await res.json();
        detail = data && (data.message || data.error_description || data.error) || "";
      } catch (_) { /* ignore */ }

      // 23505 = unique_violation (duplicate email)
      if (res.status === 409 || /duplicate|unique/i.test(detail)) {
        const err = new Error("You're already signed up — thanks!");
        err.code = "duplicate";
        throw err;
      }
      throw new Error(detail || `Request failed (${res.status}).`);
    }
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { ok, name, email } = validate();
    if (!ok) {
      setStatus("Please fix the errors above.", "is-error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing up…";
    setStatus("", null);

    try {
      await submitToSupabase(name, email);
      form.classList.add("is-success");
      setStatus("Thanks — you're on the list.", "is-success");
    } catch (err) {
      if (err && err.code === "duplicate") {
        form.classList.add("is-success");
        setStatus(err.message, "is-success");
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign up";
        setStatus(
          (err && err.message) ? err.message : "Something went wrong. Please try again.",
          "is-error"
        );
      }
    }
  });
})();
