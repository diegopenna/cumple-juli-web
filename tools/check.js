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
node('guest-count').value = '3';
const context = { document: { getElementById: node, body: node('body'), activeElement: null }, navigator: { clipboard: { writeText: async text => assert.equal(text, 'julieta-md') } }, window: { open: url => opened.push(new URL(url)) }, setInterval() {}, Date, console };
vm.runInNewContext(fs.readFileSync('js/script.js', 'utf8'), context);
const submit = () => node('rsvp-form').handlers.submit({ preventDefault() {} });
node('guest-name').value = ' Ana   Pérez ';
submit();
assert.equal(opened[0].pathname, '/5491135577619');
assert.match(opened[0].searchParams.get('text'), /Ana Pérez/);
assert.match(opened[0].searchParams.get('text'), /3 personas/);
node('rsvp-form').elements.attendance.value = 'no';
node('rsvp-form').handlers.change();
assert.equal(node('people-field').hidden, true);
assert.equal(node('guest-count').disabled, true);
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
