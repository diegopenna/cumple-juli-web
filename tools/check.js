// Behavioral checks with DOM doubles; never opens WhatsApp or sends a message.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = {};
function node(id) {
  return nodes[id] ||= { textContent: '', value: '', disabled: false, required: true, paused: true,
    handlers: {}, attrs: {}, classList: { add() {}, remove() {} },
    addEventListener(type, fn) { this.handlers[type] = fn; },
    setAttribute(key, value) { this.attrs[key] = value; }, focus() {},
    setCustomValidity(value) { this.validityMessage = value; }, reportValidity() { return !this.validityMessage; },
    async play() { this.paused = false; this.handlers.play?.(); }, pause() { this.paused = true; this.handlers.pause?.(); }
  };
}
const opened = [];
node('rsvp-form').elements = { attendance: { value: 'yes' } };
const context = { document: { getElementById: node, body: node('body'), activeElement: null }, navigator: { clipboard: { writeText: async text => assert.equal(text, 'julieta-md') } }, URLSearchParams, AbortSignal, window: { location: { search: '' }, open: url => opened.push(new URL(url)) }, setInterval() {}, Date, console };
vm.runInNewContext(fs.readFileSync('js/script.js', 'utf8'), context);
const submit = () => node('rsvp-form').handlers.submit({ preventDefault() {} });
node('guest-name').value = ' Ana   Pérez ';
submit();
assert.equal(opened[0].pathname, '/5491135577619');
assert.match(opened[0].searchParams.get('text'), /Ana Pérez/);
assert.doesNotMatch(opened[0].searchParams.get('text'), /personas|incluyéndome/);
node('rsvp-form').elements.attendance.value = 'no';
submit();
assert.match(opened[1].searchParams.get('text'), /no voy a poder asistir/);
assert.doesNotMatch(opened[1].searchParams.get('text'), /personas/);
node('guest-name').value = '   ';
submit();
assert.equal(opened.length, 2);
assert.ok(node('guest-name').validityMessage);
node('enter-silent').handlers.click();
assert.equal(node('music').paused, true);
assert.equal(node('invitation').inert, false);
node('enter-music').handlers.click();
assert.equal(node('music').paused, false);
const html = fs.readFileSync('index.html', 'utf8');
for (const [, path] of html.matchAll(/(?:src|href)="((?:assets|css|js)\/[^\"]+)"/g)) assert.ok(fs.existsSync(path), path);
assert.equal(new Date('2026-12-05T21:00:00-03:00').toISOString(), '2026-12-06T00:00:00.000Z');
console.log('OK: RSVP yes/no, recipient and message, blank-name rejection, music choices, local assets, event timezone.');

(async () => {
  for (const [search, matches] of [['?cod=Ale', true], ['?cod=ale', true], ['?cod=ALE', true], ['?other=1&cod=Ale', true], ['?cod=missing', false], ['?cod=', false], ['/cumple-juli-web/Ale', true], ['/cumple-juli-web/ale', true], ['/cumple-juli-web/ALE/', true], ['/cumple-juli-web/', false], ['/cumple-juli-web/index.html', false]]) {
    for (const key of Object.keys(nodes)) delete nodes[key];
    node('rsvp-form').elements = { attendance: { value: 'yes' } };
    const urls = [];
    const env = { ...context, window: { location: { search: search.startsWith('/') ? '' : search, pathname: search.startsWith('/') ? search : '/' }, open: url => urls.push(new URL(url)) }, fetch: async () => ({ ok: true, text: async () => 'codigo,personas\nale,Alejandro y Alejandra', json: async () => JSON.parse(fs.readFileSync('invitados.json', 'utf8')) }) };
    const sandbox = vm.createContext(env);
    vm.runInContext(fs.readFileSync('js/script.js', 'utf8'), sandbox);
    await vm.runInContext('invitationReady', sandbox);
    if (matches) {
      assert.equal(node('guest-name').disabled, true);
      assert.equal(node('guest-name-field').hidden, true);
      assert.equal(node('invitees-title').textContent, 'Alejandro y Alejandra');
    } else node('guest-name').value = 'Ana Pérez';
    node('rsvp-form').handlers.submit({ preventDefault() {} });
    assert.equal(urls.length, 1);
    assert.match(urls[0].searchParams.get('text'), matches ? /Alejandro y Alejandra/ : /Ana Pérez/);
    node('rsvp-form').elements.attendance.value = 'no';
    node('rsvp-form').handlers.submit({ preventDefault() {} });
    assert.match(urls[1].searchParams.get('text'), matches ? /no podremos asistir/ : /no voy a poder asistir/);
  }
const parserBox = vm.createContext({ ...context, window: { ...context.window, location: { search: '' } } });
vm.runInContext(fs.readFileSync('js/script.js', 'utf8'), parserBox);
const parsed = vm.runInContext('parseGuestCSV', parserBox)('\uFEFFcodigo,personas\r\nAle,"Alejandro, Alejandra y Sofía"\r\n\r\nGaby,"Gaby y ""Diego"""');
assert.equal(parsed[0].descripcion, 'Alejandro, Alejandra y Sofía');
assert.equal(parsed[1].descripcion, 'Gaby y "Diego"');
assert.throws(() => vm.runInContext('parseGuestCSV', parserBox)('codigo,personas\na,Ana\nA,Otra'));
assert.throws(() => vm.runInContext('parseGuestCSV', parserBox)('<html>Acceso denegado</html>'));
console.log('OK: CSV quoted cells, accents, blank rows, BOM, duplicate codes and invalid responses.');

  console.log('OK: personalized code, extra parameters, unknown/empty code, automatic recipient description in yes/no messages.');
})().catch(error => { console.error(error); process.exitCode = 1; });

