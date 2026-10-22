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
let invitationDescription = '';
let invitationLoading = false;

async function loadInvitation() {
  const pathMatch = (window.location.pathname || '').match(/^\/cumple-juli-web\/([^/]+)\/?$/);
  let pathCode = '';
  try { pathCode = pathMatch ? decodeURIComponent(pathMatch[1]) : ''; } catch { /* Un código mal formado conserva la versión genérica. */ }
  if (pathCode.toLowerCase() === 'index.html') pathCode = '';
  const code = (new URLSearchParams(window.location.search).get('cod') || pathCode).trim().toLowerCase();
  if (!code) return;
  invitationLoading = true;
  const submitButton = document.getElementById('rsvp-submit');
  submitButton.disabled = true;
  try {
    const response = await fetch('invitados.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('No se pudo cargar la lista.');
    const guests = await response.json();
    const guest = Array.isArray(guests) && guests.find(item => typeof item.codigo === 'string' && item.codigo.trim().toLowerCase() === code);
    if (!guest || typeof guest.descripcion !== 'string' || !guest.descripcion.trim()) throw new Error('Código desconocido.');
    invitationDescription = guest.descripcion.trim();
    document.getElementById('invitees-title').textContent = invitationDescription;
    document.getElementById('personal-invitation').hidden = false;
    document.getElementById('invitees-confirmation').textContent = `Invitación para: ${invitationDescription}`;
    document.getElementById('invitees-confirmation').hidden = false;
    document.getElementById('rsvp-intro').textContent = 'Indicá si van a asistir y enviame la respuesta por WhatsApp. La invitación incluye a las personas mencionadas arriba.';
    document.getElementById('guest-name-field').hidden = true;
    const input = document.getElementById('guest-name');
    input.required = false;
    input.disabled = true;
    input.setCustomValidity('');
  } catch {
    const error = document.getElementById('invitation-error');
    error.textContent = 'No pudimos encontrar tu invitación personalizada. Revisá el código del enlace. Podés confirmar escribiendo tu nombre.';
    error.hidden = false;
  } finally {
    invitationLoading = false;
    submitButton.disabled = false;
  }
}
const invitationReady = loadInvitation();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (invitationLoading) return;
  const nameInput = document.getElementById('guest-name');
  const name = invitationDescription || nameInput.value.trim().replace(/\s+/g, ' ');
  if (!name) { nameInput.setCustomValidity('Escribí tu nombre y apellido.'); nameInput.reportValidity(); return; }
  nameInput.setCustomValidity('');
  if (!form.reportValidity()) return;
  const attending = form.elements.attendance.value === 'yes';
  const message = invitationDescription
    ? (attending
      ? `¡Hola! 🦋 Confirmamos la asistencia a los XV de Julieta el 5 de diciembre. Invitación para: ${name}. ¡Nos vemos para celebrar! 💚`
      : `¡Hola! Gracias por la invitación a los XV de Julieta para: ${name}. Lamentablemente no podremos asistir. ¡Te deseamos una noche hermosa! 🦋💚`)
    : attending
    ? `¡Hola! Soy ${name}. 🦋 Confirmo mi asistencia a los XV de Julieta el 5 de diciembre. ¡Nos vemos para celebrar! 💚`
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
