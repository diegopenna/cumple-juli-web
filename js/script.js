'use strict';

const EVENT_DATE = new Date('2026-12-05T21:00:00-03:00');
const WHATSAPP_NUMBER = '5491135577619';
const music = document.getElementById('music');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');

function reflectMusic() {
  const playing = !music.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Activar música');
}
async function playMusic() {
  try { music.volume = .35; await music.play(); musicStatus.textContent = ''; }
  catch { musicStatus.textContent = 'No se pudo reproducir la música. Podés intentar con el botón ♫.'; }
  reflectMusic();
}
function enterInvitation(withMusic) {
  if (withMusic) playMusic();
  document.getElementById('invitation').inert = false;
  document.getElementById('welcome').classList.add('dismissed');
  document.getElementById('welcome').inert = true;
  document.body.classList.remove('welcome-open');
  document.getElementById('hero-title').setAttribute('tabindex', '-1');
  document.getElementById('hero-title').focus({ preventScroll: true });
}
document.getElementById('enter-music').addEventListener('click', () => enterInvitation(true));
document.getElementById('enter-silent').addEventListener('click', () => enterInvitation(false));
musicToggle.addEventListener('click', () => { if (music.paused) playMusic(); else music.pause(); });
music.addEventListener('play', reflectMusic);
music.addEventListener('pause', reflectMusic);

function updateCountdown() {
  const seconds = Math.max(0, Math.floor((EVENT_DATE - Date.now()) / 1000));
  const values = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
  for (const [id, value] of Object.entries(values)) document.getElementById(id).textContent = String(value).padStart(2, '0');
  if (seconds === 0) document.getElementById('countdown-note').textContent = '¡Llegó el gran día!';
}
updateCountdown();
setInterval(updateCountdown, 1000);

const form = document.getElementById('rsvp-form');
const peopleField = document.getElementById('people-field');
const guestCount = document.getElementById('guest-count');
form.addEventListener('change', () => {
  const attending = form.elements.attendance.value === 'yes';
  peopleField.hidden = !attending;
  guestCount.disabled = !attending;
  guestCount.required = attending;
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const nameInput = document.getElementById('guest-name');
  const name = nameInput.value.trim().replace(/\s+/g, ' ');
  if (!name) { nameInput.setCustomValidity('Escribí tu nombre y apellido.'); nameInput.reportValidity(); return; }
  nameInput.setCustomValidity('');
  if (!form.reportValidity()) return;
  const attending = form.elements.attendance.value === 'yes';
  const count = Number(guestCount.value);
  const message = attending
    ? `¡Hola! Soy ${name}. 🦋 Confirmo mi asistencia a los XV de Julieta el 5 de diciembre. ${count === 1 ? 'Voy a asistir yo.' : `Vamos a ser ${count} personas en total, incluyéndome.`} ¡Nos vemos para celebrar! 💚`
    : `¡Hola! Soy ${name}. Gracias por invitarme a los XV de Julieta. Lamentablemente no voy a poder asistir. ¡Te deseo una noche hermosa! 🦋💚`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  document.getElementById('form-feedback').textContent = 'Recordá enviar el mensaje en WhatsApp para confirmar tu respuesta.';
});
document.getElementById('guest-name').addEventListener('input', (event) => event.target.setCustomValidity(''));

document.getElementById('copy-alias').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('julieta-md'); document.getElementById('copy-feedback').textContent = '¡Alias copiado!'; }
  catch { document.getElementById('copy-feedback').textContent = 'Podés copiar el alias: julieta-md'; }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(section => observer.observe(section));
  document.body.classList.add('motion-ready');
}

// La bienvenida conserva el foco dentro de sus dos opciones hasta ingresar.
document.getElementById('welcome').addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const first = document.getElementById('enter-music');
  const last = document.getElementById('enter-silent');
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
document.getElementById('enter-music').focus({ preventScroll: true });
