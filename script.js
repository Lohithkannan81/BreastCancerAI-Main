/**
 * ╔════════════════════════════════════════════╗
 * ║  MediBot Mascot — Interaction Script       ║
 * ║  Pure HTML/CSS mascot with JS reactions    ║
 * ╚════════════════════════════════════════════╝
 *
 * Interactions handled here:
 *  1. Pupil tracking  — follows mouse cursor via element-relative offset
 *  2. Email focus     — mascot looks toward the form (curious)
 *  3. Password focus  — mascot looks away slightly (shy)
 *  4. Show password   — arms sweep over eyes (.cover-eyes class)
 *  5. Hide password   — arms return, eyes open
 *  6. Submit click    — playful ripple animation on button
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Element references ──────────────────────────────────── */
  const mascot      = document.getElementById("mascot");
  const pupilL      = document.getElementById("pupilL");
  const pupilR      = document.getElementById("pupilR");
  const eyebrowL    = document.getElementById("ebL");
  const eyebrowR    = document.getElementById("ebR");
  const emailInput  = document.getElementById("email");
  const passInput   = document.getElementById("password");
  const toggleBtn   = document.getElementById("toggle-pass");
  const eyeGlyph    = document.getElementById("eye-glyph");
  const submitBtn   = document.getElementById("submit-btn");
  const loginForm   = document.getElementById("login-form");

  /* ── State ───────────────────────────────────────────────── */
  let pupilsLocked = false;   // true when mascot is in a fixed-gaze state
  let passwordVisible = false;
  let blinkInterval;

  /* ── 1. PUPIL TRACKING
   *
   *  On every mousemove, we find the center of each eye socket,
   *  compute the angle to the cursor, and move the pupil div
   *  up to MAX_OFFSET pixels in that direction.
   *  This gives a realistic "eyes follow cursor" effect using
   *  only CSS transform: translate().
   * ──────────────────────────────────────────────────────── */
  const MAX_OFFSET = 10; // px — how far a pupil can travel inside the socket

  function trackPupil(pupilEl, cursorX, cursorY) {
    const socket = pupilEl.closest(".eye-socket");
    const rect   = socket.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;

    const angle  = Math.atan2(cursorY - cy, cursorX - cx);
    const dist   = Math.min(
      MAX_OFFSET,
      Math.hypot(cursorX - cx, cursorY - cy) / 10
    );

    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    // We keep the base translate(-50%, -50%) centering via CSS,
    // and add our offset on top
    pupilEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  document.addEventListener("mousemove", (e) => {
    if (pupilsLocked) return;
    trackPupil(pupilL, e.clientX, e.clientY);
    trackPupil(pupilR, e.clientX, e.clientY);
  });

  /* Helper: lock pupils to a fixed offset instantly */
  function lockGaze(dx, dy) {
    pupilsLocked = true;
    const t = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    // Use smooth transition when locking
    pupilL.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
    pupilR.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
    pupilL.style.transform = t;
    pupilR.style.transform = t;
  }

  function unlockGaze() {
    pupilsLocked = false;
    // Restore fast tracking transition
    pupilL.style.transition = "transform 0.07s ease-out";
    pupilR.style.transition = "transform 0.07s ease-out";
  }

  /* ── 2. EMAIL FIELD FOCUS
   *
   *  Mascot becomes "curious" — eyebrows raise, mouth opens,
   *  and pupils shift right toward the form.
   * ──────────────────────────────────────────────────────── */
  emailInput.addEventListener("focus", () => {
    mascot.classList.remove("shy", "cover-eyes");
    mascot.classList.add("curious");
    lockGaze(6, 3);
  });

  emailInput.addEventListener("blur", () => {
    mascot.classList.remove("curious");
    unlockGaze();
  });

  /* ── 3. PASSWORD FIELD FOCUS
   *
   *  Mascot becomes "shy" — pupils look away (up-left),
   *  blush intensifies, eyebrows droop.
   * ──────────────────────────────────────────────────────── */
  passInput.addEventListener("focus", () => {
    mascot.classList.remove("curious");
    mascot.classList.add("shy");
    lockGaze(-8, -5); // look subtly away
  });

  passInput.addEventListener("blur", () => {
    // Only remove shy if password isn't being shown
    if (!passwordVisible) {
      mascot.classList.remove("shy");
      unlockGaze();
    }
  });

  /* ── 4 & 5. SHOW / HIDE PASSWORD TOGGLE
   *
   *  SHOW: adds .cover-eyes → CSS slides eyelids down (eyes closed)
   *         and rotates arms up to cover the face.
   *  HIDE: removes .cover-eyes → eyelids slide back up, arms return.
   * ──────────────────────────────────────────────────────── */
  toggleBtn.addEventListener("click", () => {
    passwordVisible = !passwordVisible;

    if (passwordVisible) {
      /* ── SHOW password ─────────────────────── */
      passInput.type = "text";
      eyeGlyph.textContent = "🙈"; // closed-eyes emoji on button
      mascot.classList.add("cover-eyes", "shy");
      lockGaze(0, 0);              // pupils centered before being hidden
      toggleBtn.setAttribute("aria-label", "Hide password");

    } else {
      /* ── HIDE password ─────────────────────── */
      passInput.type = "password";
      eyeGlyph.textContent = "👁";
      mascot.classList.remove("cover-eyes");
      // Keep shy state if password field is still focused
      if (document.activeElement !== passInput) {
        mascot.classList.remove("shy");
        unlockGaze();
      } else {
        lockGaze(-8, -5); // return to shy gaze
      }
      toggleBtn.setAttribute("aria-label", "Show password");
    }
  });

  /* ── 6. SUBMIT BUTTON — playful ripple ────────── */
  submitBtn.addEventListener("click", () => {
    submitBtn.classList.remove("ripple-anim");

    // Trigger re-flow so animation restarts even on repeated clicks
    void submitBtn.offsetWidth;
    submitBtn.classList.add("ripple-anim");

    // Mascot reacts with a happy curious bounce
    mascot.classList.add("curious");
    setTimeout(() => mascot.classList.remove("curious"), 700);
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // showcase only
  });

});
