(function (root) {
  'use strict';
  function normalizeTypingText(text) {
    return text.normalize('NFKC')
      .replace(/[\u2018\u2019\u201b\u02bc`]/g, "'")
      .replace(/[\u201c\u201d\u201f]/g, '"')
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
      .replace(/\s+/g, ' ');
  }
  if (typeof module === 'object' && module.exports) module.exports = { normalizeTypingText };
  else root.normalizeTypingText = normalizeTypingText;
})(typeof globalThis === 'object' ? globalThis : this);
