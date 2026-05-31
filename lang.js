const toggle = document.getElementById('lang-toggle');
let lang = localStorage.getItem('lang') || 'en';

function applyLang() {
  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerHTML = el.getAttribute('data-' + lang);
  });
  if (toggle) toggle.textContent = lang === 'en' ? 'NL' : 'EN';
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
}

if (toggle) {
  toggle.addEventListener('click', () => {
    lang = lang === 'en' ? 'nl' : 'en';
    applyLang();
  });
}

applyLang();
