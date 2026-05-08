// ============================================
// InterEQ — Shared JS Utilities
// ============================================

// ── Logo SVG (inline, reusable) ──────────────
const LOGO_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="InterEQ icon">
  <rect x="36" y="4"  width="28" height="28" rx="10" fill="#E84C1E"/>
  <rect x="4"  y="36" width="28" height="28" rx="10" fill="#E84C1E"/>
  <rect x="68" y="36" width="28" height="28" rx="10" fill="#E84C1E"/>
  <rect x="28" y="28" width="44" height="44" rx="8"  fill="#E84C1E"/>
  <polyline points="30,62 50,42 70,62" fill="white" stroke="white" stroke-width="1" stroke-linejoin="round"/>
  <ellipse cx="50" cy="76" rx="22" ry="20" fill="#1B5EA7"/>
  <rect    x="43" y="90"  width="14" height="8"  rx="4" fill="#1B5EA7"/>
  <ellipse cx="50" cy="97" rx="18"  ry="5"  fill="#1B5EA7"/>
  <path d="M 28 58 Q 50 68 72 58" fill="white" opacity="0.9"/>
</svg>`;

// ── Inject logo into .logo-wrap ───────────────
document.querySelectorAll('.logo-icon').forEach(el => el.innerHTML = LOGO_SVG);

// ── Password toggle ───────────────────────────
document.querySelectorAll('.password-toggle').forEach(btn => {
  const input = btn.closest('.password-wrapper').querySelector('input');
  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.querySelector('svg').innerHTML = show
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
});

// ── Form validation helpers ───────────────────
function showFieldError(inputEl, errorEl, msg) {
  inputEl.classList.add('error');
  if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
}
function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('error');
  if (errorEl) errorEl.style.display = 'none';
}
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

// ── OTP input auto-advance ────────────────────
document.querySelectorAll('.otp-group').forEach(group => {
  const inputs = [...group.querySelectorAll('.otp-input')];
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(-1);
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
    inp.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData.getData('text').replace(/\D/g, '')).split('');
      inputs.forEach((box, j) => { box.value = digits[j] || ''; });
      const next = inputs[Math.min(digits.length, inputs.length - 1)];
      if (next) next.focus();
    });
  });
});

// ── API helper ────────────────────────────────
async function apiCall(endpoint, payload) {
  const res = await fetch(`/api${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return res.json();
}
