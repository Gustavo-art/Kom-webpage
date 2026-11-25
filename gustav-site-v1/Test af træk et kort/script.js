// Lille, almindelig JavaScript – ingen frameworks eller eksterne dependencies.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Åbn menu' : 'Luk menu');
    mainNav.classList.toggle('is-open', !isOpen);
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Åbn menu');
    mainNav.classList.remove('is-open');
  }));
}

document.querySelectorAll('.year').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Før vi kobler en rigtig formularservice på: åbner brugerens eget mailprogram.
// Der bliver IKKE sendt eller gemt noget af denne kode.
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const navn = String(fields.get('navn') || '').trim();
    const email = String(fields.get('email') || '').trim();
    const besked = String(fields.get('besked') || '').trim();
    const subject = encodeURIComponent(`Henvendelse fra ${navn} via hjemmesiden`);
    const body = encodeURIComponent(`Hej Gustav,\n\n${besked}\n\nHilsen\n${navn}\n${email}`);
    window.location.href = `mailto:gustavhooeg@gmail.com?subject=${subject}&body=${body}`;
  });
}
