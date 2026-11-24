/* Intro «El probador» de D'Sonia Boutique — ELIX Digital Services.
   La pluma escribe la firma real (logotipo vectorizado) trazo a trazo; la firma vuela al logo de la cabecera
   y la cortina se recoge. Un toque, una tecla o la rueda la adelantan. */
(function () {
  var d = document.documentElement;
  var el = document.getElementById('dsi');
  if (!el) return;
  if (!d.classList.contains('dsi-on')) { el.parentNode.removeChild(el); return; }
  try { sessionStorage.setItem('dsi-visto', '1'); } catch (e) {}
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  var INICIO = 0.3, ESCRITURA = 1.45, RESPIRO = 0.035;
  var BOUTIQUE = [1.5, 2.0], BRILLO = [1.95, 2.6], ABRE = 2.45, VUELO = 1.05, FIN = ABRE + 1.35;

  var firma = el.querySelector('.dsi-firma');
  var trazos = [].slice.call(el.querySelectorAll('.dsi-trazo'));
  var largos = trazos.map(function (p) { return p.getTotalLength(); });
  var suma = largos.reduce(function (a, b) { return a + b; }, 0);
  var util = 1 - RESPIRO * (trazos.length - 1);
  var tramos = [], acc = 0;
  largos.forEach(function (l) { var b = (l / suma) * util; tramos.push([acc, b]); acc += b + RESPIRO; });
  trazos.forEach(function (p, i) { p.style.strokeDasharray = largos[i] + ' ' + largos[i]; p.style.strokeDashoffset = largos[i]; p.style.opacity = 0; });

  var punta = el.querySelector('.dsi-punta');
  var bt1 = el.querySelector('#dsi-bt1'), bt2 = el.querySelector('#dsi-bt2'), btG = el.querySelector('.dsi-boutique');
  var brillo = el.querySelector('#dsi-brillo');

  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var ease = function (x) { return 1 - Math.pow(1 - x, 3); };
  var t0 = performance.now(), adelanto = 0, fase = 0;

  function cuadro(ahora) {
    var t = (ahora - t0) / 1000 + adelanto;
    // 1 · la pluma escribe
    var prog = clamp((t - INICIO) / ESCRITURA), activa = null;
    for (var i = 0; i < trazos.length; i++) {
      var k = clamp((prog - tramos[i][0]) / tramos[i][1]);
      trazos[i].style.strokeDashoffset = largos[i] * (1 - k);
      trazos[i].style.opacity = k > 0 ? 1 : 0;
      if (k > 0 && k < 1) activa = trazos[i].getPointAtLength(largos[i] * k);
    }
    if (activa) { punta.setAttribute('transform', 'translate(' + activa.x + ' ' + activa.y + ')'); punta.style.opacity = 1; }
    else punta.style.opacity = 0;
    // 2 · BOUTIQUE aparece de izquierda a derecha
    var b = clamp((t - BOUTIQUE[0]) / (BOUTIQUE[1] - BOUTIQUE[0]));
    bt1.setAttribute('offset', Math.max(0, b * 1.3 - 0.3));
    bt2.setAttribute('offset', Math.min(1, b * 1.3));
    btG.setAttribute('transform', 'translate(0 ' + ((1 - ease(b)) * 8).toFixed(2) + ')');
    if (fase < 1 && t > BOUTIQUE[0]) { fase = 1; el.classList.add('kicker'); }
    // 3 · un brillo de satén cruza la firma
    var br = clamp((t - BRILLO[0]) / (BRILLO[1] - BRILLO[0]));
    brillo.setAttribute('gradientTransform', 'translate(' + (-1 + 2 * br).toFixed(3) + ' 0)');
    // 4 · vuelo al logo de la cabecera y la cortina se recoge
    if (fase < 2 && t >= ABRE) { fase = 2; abrir(); }
    if (t < FIN) requestAnimationFrame(cuadro);
  }

  function abrir() {
    el.classList.add('abre');
    var destino = document.querySelector('.header .logo-img');
    if (destino) {
      var r1 = firma.getBoundingClientRect(), r2 = destino.getBoundingClientRect();
      var w2 = r2.width || r2.height * (476 / 174);
      var s = w2 / r1.width;
      var dx = (r2.left + w2 / 2) - (r1.left + r1.width / 2);
      var dy = (r2.top + r2.height / 2) - (r1.top + r1.height / 2);
      firma.style.transition = 'transform ' + VUELO + 's cubic-bezier(.7,0,.2,1)';
      firma.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
    } else {
      firma.style.transition = 'opacity .6s ease';
      firma.style.opacity = 0;
    }
    setTimeout(function () { d.classList.add('dsi-revela'); }, 300);
    setTimeout(function () { d.classList.add('dsi-aterriza'); firma.style.opacity = 0; }, VUELO * 1000);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      d.classList.remove('dsi-on');
    }, (FIN - ABRE) * 1000);
    setTimeout(function () { d.classList.remove('dsi-revela', 'dsi-aterriza'); }, (FIN - ABRE + 1.6) * 1000);
  }

  function saltar() {
    if (fase >= 2) return;
    var t = (performance.now() - t0) / 1000 + adelanto;
    if (t < ABRE) adelanto += ABRE - t;
  }
  el.addEventListener('click', saltar);
  window.addEventListener('keydown', saltar, { once: true });
  window.addEventListener('wheel', saltar, { once: true, passive: true });
  window.addEventListener('touchmove', saltar, { once: true, passive: true });

  requestAnimationFrame(cuadro);
})();
