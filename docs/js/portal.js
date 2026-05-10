/**
 * InterIQ Enterprise Portal — Shared JS utilities
 * Auth guard, nav setup, logout, SHA-1 helper
 */

/* ── AUTH ─────────────────────────────────────────────────── */

/**
 * Load the stored password from the repo config file.
 */
async function loadStoredHash() {
  try {
    const resp = await fetch('config/auth.json?t=' + new Date().getTime());
    if (!resp.ok) throw new Error('config fetch failed');
    const cfg = await resp.json();
    return cfg.password || '';
  } catch (e) {
    console.error('Auth config load error:', e);
    return '';
  }
}

/** Verify a password against the stored password. Returns true/false. */
async function verifyPassword(enteredPassword) {
  const storedPass = await loadStoredHash();
  if (!storedPass) return false;
  return enteredPassword === storedPass;
}

/** Set session as authenticated. */
function setLoggedIn() {
  sessionStorage.setItem('iq_auth', '1');
}

/** Check if user is authenticated. */
function isLoggedIn() {
  return sessionStorage.getItem('iq_auth') === '1';
}

/** Log out: clear session and redirect to login. */
function logout() {
  sessionStorage.removeItem('iq_auth');
  window.location.href = 'index.html';
}

/** Guard a page: if not logged in, redirect to login. */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.replace('index.html');
  }
}

/* ── NAVIGATION ───────────────────────────────────────────── */

/**
 * Initialise the top nav links: sets the active class based on
 * the current page filename, and wires the Logout link.
 */
function initNav(activePage) {
  // Mark active
  const links = document.querySelectorAll('#main-nav a[data-page]');
  links.forEach(a => {
    if (a.dataset.page === activePage) {
      a.classList.add('active');
    }
  });

  // Logout
  const logoutLink = document.getElementById('nav-logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
    });
  }
}

/* ── PAGINATION ───────────────────────────────────────────── */

const ROWS_PER_PAGE = 100;

/**
 * Render paginated rows from `allRows` into `tbody`.
 * `renderRow(row, index)` is a callback that returns a <tr> element.
 * `totalCounter` is the element id for "Results X-Y of Z".
 * `paginationId` is the element id for pagination controls.
 */
function renderPage(allRows, page, tbody, renderRow, paginationId, totalCounterId) {
  tbody.innerHTML = '';
  const start = (page - 1) * ROWS_PER_PAGE;
  const end = Math.min(start + ROWS_PER_PAGE, allRows.length);
  for (let i = start; i < end; i++) {
    tbody.appendChild(renderRow(allRows[i], i));
  }

  // Update counter
  const counter = document.getElementById(totalCounterId);
  if (counter) {
    counter.innerHTML = `Results <strong>${start + 1}-${end}</strong> of <strong>${allRows.length}</strong>`;
  }

  // Update pagination
  buildPagination(allRows.length, page, paginationId, (p) => {
    renderPage(allRows, p, tbody, renderRow, paginationId, totalCounterId);
  });
}

function buildPagination(total, currentPage, containerId, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const totalPages = Math.ceil(total / ROWS_PER_PAGE);
  container.innerHTML = '';

  // Numbered pages (up to 6 visible)
  const maxVisible = 6;
  for (let p = 1; p <= Math.min(totalPages, maxVisible); p++) {
    const btn = document.createElement('button');
    btn.className = 'page-link' + (p === currentPage ? ' active' : '');
    btn.textContent = p;
    btn.setAttribute('data-testid', `page-btn-${p}`);
    btn.addEventListener('click', () => onPageChange(p));
    container.appendChild(btn);
  }

  // >> button
  if (totalPages > maxVisible) {
    const more = document.createElement('button');
    more.className = 'page-link';
    more.textContent = '>>';
    more.setAttribute('data-testid', 'page-btn-more');
    more.addEventListener('click', () => {
      const next = Math.min(currentPage + 1, totalPages);
      onPageChange(next);
    });
    container.appendChild(more);
  }

  // Next button
  if (currentPage < totalPages) {
    const next = document.createElement('button');
    next.className = 'page-link';
    next.textContent = 'Next';
    next.setAttribute('data-testid', 'page-btn-next');
    next.addEventListener('click', () => onPageChange(currentPage + 1));
    container.appendChild(next);
  }
}

/* ── CSV EXPORT ───────────────────────────────────────────── */

/**
 * Download the full dataset as a CSV file.
 * @param {string[]} headers  - Column header strings
 * @param {string[][]} rows   - Array of row arrays
 * @param {string} filename   - Suggested download filename
 */
function exportCSV(headers, rows, filename) {
  if (!rows || rows.length === 0) {
    alert('No data to export.');
    return;
  }

  function escapeCell(val) {
    var s = (val === null || val === undefined) ? '' : String(val);
    if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  var lines = [];
  if (headers && headers.length > 0) {
    lines.push(headers.map(escapeCell).join(','));
  }
  for (var i = 0; i < rows.length; i++) {
    lines.push(rows[i].map(escapeCell).join(','));
  }

  var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename || 'export.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
