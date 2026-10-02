(function () {
  'use strict';
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let preference;
  try { preference = localStorage.getItem('tr_reduce_motion') === 'true'; } catch { preference = false; }
  const isReduced = () => preference || media.matches;
  function syncMotion(notify = true) {
    document.documentElement.dataset.reducedMotion = String(isReduced());
    const button = document.getElementById('motion-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(isReduced()));
      button.textContent = isReduced() ? 'Motion off' : 'Reduce motion';
    }
    if (notify) window.dispatchEvent(new Event('motionchange'));
  }
  window.MotionPreferences = { isReduced, toggle() {
    preference = !isReduced();
    try { localStorage.setItem('tr_reduce_motion', String(preference)); } catch {}
    syncMotion();
  } };
  document.documentElement.dataset.reducedMotion = String(isReduced());
  media.addEventListener('change', syncMotion);

  let previousFocus = null;
  function syncControls() {
    document.querySelectorAll('button.cat-btn, button.theme-btn, button.sprite-btn, button.modifier-card').forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
    ['ai-toggle', 'tt-ai-toggle'].forEach(id => {
      const button = document.getElementById(id);
      if (button) button.setAttribute('aria-checked', String(button.classList.contains('active')));
    });
    const input = document.getElementById('typing-input');
    const invalid = input.classList.contains('has-error');
    input.setAttribute('aria-invalid', String(invalid));
    input.setAttribute('aria-describedby', invalid ? 'typing-hint current-word typing-error' : 'typing-hint current-word');
    document.getElementById('typing-error').hidden = !invalid;
  }

  function syncDialog() {
    const dialog = document.getElementById('connection-overlay');
    const open = !dialog.hidden;
    document.querySelectorAll('.screen, .app-header, #race-hud, #background-credit').forEach(element => {
      element.inert = open || (element.classList.contains('screen') && !element.classList.contains('active'));
    });
    if (open && !dialog.contains(document.activeElement)) {
      previousFocus = document.activeElement;
      dialog.querySelector('button').focus();
    } else if (!open && previousFocus) {
      if (previousFocus.isConnected && !previousFocus.closest('[inert]') && !previousFocus.disabled) previousFocus.focus();
      previousFocus = null;
    }
  }

  window.AccessibilityUI = {
    screenChanged(id, changed) {
      document.body.dataset.screen = id;
      document.querySelectorAll('.screen').forEach(screen => {
        screen.setAttribute('aria-hidden', String(screen.id !== id));
        screen.inert = screen.id !== id;
      });
      document.querySelectorAll('.app-nav [data-screen]').forEach(button => {
        if (button.dataset.screen === id) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      if (changed) {
        const screen = document.getElementById(id);
        screen.scrollTop = 0;
        const heading = screen.querySelector('h1, h2');
        if (heading && id !== 'screen-race') heading.focus({ preventScroll: true });
      }
      syncDialog();
    },
    chartDescription(canvas, timings) {
      canvas.setAttribute('role', 'img');
      const recorded = timings.filter(t => Number.isFinite(t.ms) && t.ms > 0 && typeof t.word === 'string');
      const average = recorded.length ? Math.round(recorded.reduce((sum, t) => sum + Math.round((t.word.length / 5) / (t.ms / 60000)), 0) / recorded.length) : 0;
      canvas.setAttribute('aria-label', `Typing speed by word. ${timings.length} ${timings.length === 1 ? 'word' : 'words'} recorded; average word speed ${average} words per minute. Race totals are shown above.`);
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.setAttribute('role', 'region');
      const heading = screen.querySelector('h1, h2');
      if (heading) {
        if (!heading.id) heading.id = `${screen.id}-heading`;
        heading.tabIndex = -1;
        screen.setAttribute('aria-labelledby', heading.id);
      }
    });
    document.querySelectorAll('button').forEach(button => button.type = 'button');
    document.querySelectorAll('.category-grid').forEach(grid => { grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', 'Passage category'); });
    document.querySelectorAll('.theme-grid').forEach(grid => { grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', 'Background theme'); });
    document.querySelectorAll('.sprite-grid').forEach(grid => { grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', 'Runner character'); });
    syncControls();
    syncMotion(false);
    window.AccessibilityUI.screenChanged(document.querySelector('.screen.active').id, false);
    new MutationObserver(syncControls).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    new MutationObserver(syncDialog).observe(document.getElementById('connection-overlay'), { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('keydown', event => {
      const dialog = document.getElementById('connection-overlay');
      if (dialog.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); window.goLobby(); return; }
      if (event.key !== 'Tab') return;
      const buttons = Array.from(dialog.querySelectorAll('button:not(:disabled)'));
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.getElementById('typing-input').addEventListener('input', syncControls);
  });
})();
