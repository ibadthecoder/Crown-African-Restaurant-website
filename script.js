(function () {
  'use strict';
  var WA = '18622202740';
  var NAME = 'Crown African Restaurant';

  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  document.getElementById('yr').textContent = new Date().getFullYear();

  /* header gets a border once the page scrolls */
  var bar = document.getElementById('top-bar');
  function onScroll() { bar.classList.toggle('stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- order builder ---------- */
  var order = {};          // item name -> quantity
  var rows = [];           // menu rows: { name, ctl }
  var dock = document.getElementById('dock');
  var countEl = document.getElementById('count');
  var dlg = document.getElementById('orderDlg');
  var list = document.getElementById('orderList');
  var send = document.getElementById('sendOrder');
  var oname = document.getElementById('oname');
  var onotes = document.getElementById('onotes');

  function total() { var n = 0; for (var k in order) n += order[k]; return n; }

  function stepper(name) {
    var wrap = el('span', 'step');
    var minus = el('button', null, '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Remove one ' + name);
    var out = el('output', null, String(order[name])); out.setAttribute('aria-live', 'polite');
    var plus = el('button', null, '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Add one ' + name);
    minus.addEventListener('click', function () { change(name, -1); });
    plus.addEventListener('click', function () { change(name, 1); });
    wrap.appendChild(minus); wrap.appendChild(out); wrap.appendChild(plus);
    return wrap;
  }

  function change(name, d) {
    var q = (order[name] || 0) + d;
    if (q <= 0) delete order[name]; else order[name] = q;
    render();
  }

  function buildMessage() {
    var lines = ['Hello ' + NAME + ', I would like to order:'];
    Object.keys(order).forEach(function (k) { lines.push('- ' + order[k] + ' x ' + k); });
    if (oname.value.trim()) lines.push('Name: ' + oname.value.trim());
    if (onotes.value.trim()) lines.push('Notes: ' + onotes.value.trim());
    return lines.join('\n');
  }

  function render() {
    rows.forEach(function (r) {
      r.ctl.innerHTML = '';
      if (order[r.name]) {
        r.ctl.appendChild(stepper(r.name));
      } else {
        var b = el('button', 'add', 'Add'); b.type = 'button';
        b.setAttribute('aria-label', 'Add ' + r.name + ' to your order');
        b.addEventListener('click', function () { change(r.name, 1); });
        r.ctl.appendChild(b);
      }
    });
    var n = total();
    countEl.textContent = n;
    dock.classList.toggle('has-order', n > 0);

    list.innerHTML = '';
    Object.keys(order).forEach(function (k) {
      var li = el('li'); li.appendChild(el('span', 'n', k)); li.appendChild(stepper(k)); list.appendChild(li);
    });
    send.href = n ? waLink(buildMessage()) : '#';
    if (!n && dlg.open) dlg.close();
  }

  document.querySelectorAll('.group li[data-item]').forEach(function (li) {
    var ctl = el('span', 'ctl'); li.appendChild(ctl);
    rows.push({ name: li.getAttribute('data-item'), ctl: ctl });
  });
  render();

  document.getElementById('openOrder').addEventListener('click', function () {
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  document.getElementById('closeOrder').addEventListener('click', function () { dlg.close(); });
  document.getElementById('clearOrder').addEventListener('click', function () { order = {}; render(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  [oname, onotes].forEach(function (i) { i.addEventListener('input', function () { send.href = total() ? waLink(buildMessage()) : '#'; }); });

  /* ---------- catering form ---------- */
  var form = document.getElementById('cform');
  var out = document.getElementById('out');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { return (document.getElementById(id).value || '').trim(); };
    var lines = ['Hello ' + NAME + ', I would like to request catering.',
      'Name: ' + v('name'),
      v('phone') ? 'Phone: ' + v('phone') : '',
      v('date') ? 'Event date: ' + v('date') : '',
      v('guests') ? 'Guests: ' + v('guests') : '',
      v('notes') ? 'Order: ' + v('notes') : ''].filter(Boolean);
    var url = waLink(lines.join('\n'));
    out.hidden = false; out.textContent = '';
    var a = el('a', null, 'Open WhatsApp with this request');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.style.color = 'var(--gold)'; a.style.fontWeight = '600';
    out.appendChild(a);
    out.appendChild(document.createElement('br'));
    out.appendChild(document.createTextNode('If WhatsApp did not open, tap the link.'));
    window.open(url, '_blank', 'noopener');
  });

  /* ---------- photo viewer ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.gallery button img'));
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var cur = 0, opener = null;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    lbImg.src = shots[cur].getAttribute('src'); lbImg.alt = shots[cur].alt;
  }
  function openLb(i, btn) { opener = btn; show(i); lb.hidden = false; document.getElementById('lbX').focus(); document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  document.querySelectorAll('.gallery button').forEach(function (b) {
    b.addEventListener('click', function () { openLb(parseInt(b.getAttribute('data-i'), 10), b); });
  });
  document.getElementById('lbX').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { show(cur - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
