/* D'Sonia · capa «wow» (nov-2026) — ELIX Digital Services.
   Textos que suben palabra a palabra, fotos con máscara, parallax, contadores, WhatsApp magnético, lunares en Flamenca,
   colecciones en pasarela, «Abierto ahora», mapa que se carga al pulsar, novedades del panel, el look con puntos y la cita con Sonia. */
(function () {
  'use strict';
  var d = document.documentElement;
  var calma = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ancho = function () { return window.innerWidth >= 900; };
  var WA = 'https://wa.me/34646048938?text=';
  var $$ = function (sel, raiz) { return [].slice.call((raiz || document).querySelectorAll(sel)); };
  var visible = function (el, fn, umbral) {
    if (!('IntersectionObserver' in window)) { fn(el); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } });
    }, { threshold: umbral || 0.2 });
    io.observe(el);
  };

  /* 1 · títulos que suben palabra a palabra (respeta <em> y <br>) */
  function partir(el) {
    var i = 0;
    (function recorre(nodo) {
      [].slice.call(nodo.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (trozo) {
            if (!trozo) return;
            if (/^\s+$/.test(trozo)) { frag.appendChild(document.createTextNode(trozo)); return; }
            var pal = document.createElement('span'); pal.className = 'pal';
            var dentro = document.createElement('span'); dentro.style.setProperty('--i', i++); dentro.textContent = trozo;
            pal.appendChild(dentro); frag.appendChild(pal);
          });
          nodo.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') recorre(n);
      });
    })(el);
  }
  if (!calma) {
    $$('.section-title, .cg-title, .flamenca-titulo, .page-title').forEach(function (el) {
      partir(el);
      visible(el, function (x) { x.classList.add('palabras-ver'); }, 0.4);
    });
  }

  /* 2 · fotos que se descubren con máscara */
  // se vigila el contenedor: el propio recorte (clip-path) hace que el navegador no vea nunca la foto «visible»
  var revelar = function (el) { visible(el.parentElement || el, function () { el.classList.add('revelada'); }, 0.12); };
  $$('[data-revela]').forEach(revelar);

  /* 3 · contadores (+15, 9…) */
  $$('[data-cuenta]').forEach(function (el) {
    var fin = +el.getAttribute('data-cuenta'), pre = el.getAttribute('data-prefijo') || '';
    if (calma) return;
    el.textContent = pre + '0';
    var contar = function () {
      var t0 = performance.now();
      (function paso(ahora) {
        var k = Math.min(1, (ahora - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(fin * e);
        if (k < 1) requestAnimationFrame(paso);
      })(t0);
    };
    visible(el, function () {
      // con la intro delante, espera a que se descorra la cortina
      var tras = function () { return !d.classList.contains('dsi-on') || d.classList.contains('dsi-revela'); };
      if (tras()) return contar();
      var mo = new MutationObserver(function () { if (tras()) { mo.disconnect(); setTimeout(contar, 350); } });
      mo.observe(d, { attributes: true, attributeFilter: ['class'] });
    }, 0.6);
  });

  /* 4 · scroll: parallax, pasarela y lunares, en un solo rAF */
  var paralajes = $$('[data-parallax]');
  var pasarela = document.getElementById('pasarela'), pista = document.getElementById('pasarelaPista');
  var flamenca = document.querySelector('.flamenca-section');
  var lunares = false;
  if (flamenca && !calma && flamenca.getBoundingClientRect().top > window.innerHeight * 0.9) { lunares = true; flamenca.classList.add('lunares'); }
  var pendiente = false;
  function alScroll() {
    pendiente = false;
    var vh = window.innerHeight;
    if (!calma && ancho()) {
      paralajes.forEach(function (el) {
        var f = +el.getAttribute('data-parallax') || 0.1;
        el.style.transform = 'translate3d(0,' + Math.min(window.scrollY, vh) * f + 'px,0)';
      });
    }
    if (pasarela && pista) {
      if (ancho() && !calma) {
        var r = pasarela.getBoundingClientRect();
        var k = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.6)));
        var recorrido = Math.max(0, pista.scrollWidth - window.innerWidth);
        pista.style.transform = 'translate3d(' + (-k * recorrido) + 'px,0,0)';
      } else pista.style.transform = '';
    }
    if (lunares) {
      var top = flamenca.getBoundingClientRect().top;
      var p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.7)));
      flamenca.style.setProperty('--r', (p * 52).toFixed(1) + 'px');
      if (p >= 1) { lunares = false; flamenca.classList.remove('lunares'); flamenca.style.removeProperty('--r'); }
    }
  }
  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(alScroll); } }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  alScroll();

  /* 5 · WhatsApp magnético (solo ratón) */
  var wa = document.querySelector('.wa-float');
  if (wa && !calma && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      var r = wa.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy, dist = Math.hypot(dx, dy);
      wa.style.transform = dist < 150 ? 'translate(' + dx * 0.28 + 'px,' + dy * 0.28 + 'px)' : '';
    }, { passive: true });
  }

  /* 6 · «Abierto ahora / Abrimos a las…» con el horario habitual (hora de Madrid) */
  var HORARIO = { 1: [[600, 840], [1080, 1260]], 2: [[600, 840], [1080, 1260]], 3: [[600, 840], [1080, 1260]], 4: [[600, 840], [1080, 1260]], 5: [[600, 840], [1080, 1260]], 6: [[630, 810]], 0: [] };
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var hhmm = function (m) { return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
  function estado() {
    var partes = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { partes[x.type] = x.value; });
    var dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday), min = (+partes.hour % 24) * 60 + +partes.minute;
    var hoy = HORARIO[dia];
    for (var i = 0; i < hoy.length; i++) if (min >= hoy[i][0] && min < hoy[i][1]) return { abierto: true, texto: 'Abierto ahora', resto: 'cierra a las ' + hhmm(hoy[i][1]) };
    for (i = 0; i < hoy.length; i++) if (min < hoy[i][0]) return { abierto: false, texto: 'Cerrado', resto: 'abrimos hoy a las ' + hhmm(hoy[i][0]) };
    for (var n = 1; n <= 7; n++) {
      var dd = (dia + n) % 7;
      if (HORARIO[dd].length) return { abierto: false, texto: 'Cerrado', resto: 'abrimos ' + (n === 1 ? 'mañana' : 'el ' + DIAS[dd]) + ' a las ' + hhmm(HORARIO[dd][0][0]) };
    }
  }
  $$('.abierto').forEach(function (el) {
    function pinta() {
      var e = estado(); if (!e) return;
      el.className = 'abierto' + (e.abierto ? '' : ' cerrado');
      el.innerHTML = '<i></i><b>' + e.texto + '</b> · ' + e.resto;
      el.hidden = false;
    }
    pinta(); setInterval(pinta, 60000);
  });

  /* 7 · mapa de Google que solo se carga al pulsar */
  $$('.mapa-diferido').forEach(function (caja) {
    var b = caja.querySelector('.mapa-ver');
    if (!b) return;
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = caja.getAttribute('data-src'); f.title = caja.getAttribute('data-titulo') || 'Mapa'; f.allowFullscreen = true; f.loading = 'eager';
      caja.innerHTML = ''; caja.appendChild(f);
    });
  });

  /* 8 · novedades que publica Sonia desde el panel */
  var nov = document.getElementById('novedades'), novPista = document.getElementById('novedadesPista');
  if (nov && novPista && window.fetch) {
    fetch('/api/novedades', { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (j) {
        var items = (j && j.items) || [];
        if (!items.length) return;
        novPista.innerHTML = items.map(function (it) {
          var t = String(it.titulo || 'Recién llegado').replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
          var msg = encodeURIComponent('Hola Sonia! Me gusta «' + (it.titulo || 'una novedad') + '» de la web. ¿Os queda?');
          return '<a class="nov" href="' + WA + msg + '" target="_blank" rel="noopener"><div class="nov-foto" data-revela><img src="' + it.url + '" alt="' + t + '" loading="lazy" decoding="async"><span class="nov-sello">Nuevo</span></div>' +
            '<div class="nov-titulo">' + t + '</div><span class="nov-pregunta">Pregúntanos →</span></a>';
        }).join('');
        nov.hidden = false;
        $$('[data-revela]', novPista).forEach(revelar);
        var titulo = nov.querySelector('.section-title');
        if (titulo && !calma && !titulo.querySelector('.pal')) { partir(titulo); visible(titulo, function (x) { x.classList.add('palabras-ver'); }, 0.4); }
      })
      .catch(function () {});
  }

  /* 9 · el look de la semana: cada punto abre su ficha */
  var foto = document.querySelector('.look-foto'), ficha = document.getElementById('lookFicha');
  if (foto && ficha) {
    var nombre = ficha.querySelector('.ficha-nombre'), enlace = ficha.querySelector('.ficha-wa');
    $$('.punto', foto).forEach(function (p) {
      p.addEventListener('click', function (e) {
        e.stopPropagation();
        var activo = p.classList.contains('activo');
        $$('.punto', foto).forEach(function (q) { q.classList.remove('activo'); });
        if (activo) { ficha.hidden = true; return; }
        p.classList.add('activo');
        var prenda = p.getAttribute('data-prenda');
        nombre.textContent = prenda;
        enlace.href = WA + encodeURIComponent('Hola Sonia! Me gusta el ' + prenda.toLowerCase() + ' del look de la semana de la web. ¿Os queda?');
        var x = parseFloat(p.style.getPropertyValue('--x')), y = parseFloat(p.style.getPropertyValue('--y'));
        ficha.style.left = Math.min(72, Math.max(28, x)) + '%';
        ficha.style.top = y + '%';
        ficha.classList.toggle('abajo', y < 30);
        ficha.hidden = false;
        ficha.style.animation = 'none'; void ficha.offsetWidth; ficha.style.animation = '';
      });
    });
    document.addEventListener('click', function (e) {
      if (!ficha.hidden && !ficha.contains(e.target)) { ficha.hidden = true; $$('.punto', foto).forEach(function (q) { q.classList.remove('activo'); }); }
    });
  }

  /* 10 · tu cita con Sonia: ocasión + cuándo → mensaje de WhatsApp hecho */
  var boton = document.getElementById('citaBoton'), vista = document.getElementById('citaMensaje');
  if (boton && vista) {
    var eleccion = {};
    var mensaje = function () {
      var o = eleccion.ocasion, c = eleccion.cuando;
      var txt = 'Hola Sonia! Me gustaría pedir cita para que me asesores' + (o ? (o === 'tallas grandes' ? ', busco algo en tallas grandes' : ' para ' + o) : '') + (c ? ' (' + c + ')' : '') + '.';
      vista.textContent = '«' + txt + '»';
      boton.href = WA + encodeURIComponent(txt);
      boton.classList.toggle('listo', Boolean(o));
    };
    $$('.chips').forEach(function (grupo) {
      var g = grupo.getAttribute('data-grupo');
      $$('.chip', grupo).forEach(function (chip) {
        chip.type = 'button';
        chip.addEventListener('click', function () {
          var ya = chip.classList.contains('activo');
          $$('.chip', grupo).forEach(function (c) { c.classList.remove('activo'); });
          if (ya) delete eleccion[g]; else { chip.classList.add('activo'); eleccion[g] = chip.getAttribute('data-valor'); }
          mensaje();
        });
      });
    });
    mensaje();
  }
})();
