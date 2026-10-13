/* Lógica do portfólio. Os dados dos projetos e das habilidades ficam em projetos.js e habilidades.js.
   Partes deste arquivo, em ordem: desenhos dos painéis animados (canvas), primeira e segunda tela (menu),
   seções e abas, galeria de projetos, habilidades e eventos de teclado. */
(function () {
  var cv = document.getElementById('stage');
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = { violet: '#9d6bff', pink: '#ff5fb0', cyan: '#3fe0f0', amber: '#ffc857', fg: '#f6f1ff' };
  var W = 0, H = 0, DPR = 1, mx = 0, my = 0, tx = 0, ty = 0;
  /* Desempenho: em computadores mais fracos o site entra no modo leve (sem desfoque e sombras no canvas, resolução 1x e 30 quadros por segundo).
     O modo leve liga sozinho se o aparelho for modesto ou se os quadros ficarem lentos. */
  var lite = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4) || false;
  var raf = 0, paused = false, lastDraw = 0, slowSum = 0, slowN = 0, checked = false;

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function label(txt, x, y, col, size) {
    ctx.fillStyle = col || 'rgba(246,241,255,.6)';
    ctx.font = '500 ' + (size || 10) + 'px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(txt, x, y);
  }

  /* Cada painel desenha dentro de uma área w x h. t = tempo em segundos. */
  var draw = {
    bars: function (w, h, t, p) {
      label(p.title, 14, 12);
      var n = p.vals.length, gx = 14, bw = (w - 28 - (n - 1) * 8) / n, base = h - 16, top = 40;
      for (var i = 0; i < n; i++) {
        var v = p.vals[i] * (0.82 + 0.18 * Math.sin(t * 0.9 + i * 0.9 + p.ph));
        var bh = (base - top) * v;
        var g = ctx.createLinearGradient(0, base - bh, 0, base);
        g.addColorStop(0, p.cols[i % p.cols.length]);
        g.addColorStop(1, 'rgba(157,107,255,.25)');
        ctx.fillStyle = g;
        rr(gx + i * (bw + 8), base - bh, bw, bh, 4); ctx.fill();
      }
    },
    donut: function (w, h, t, p) {
      label(p.title, 14, 12);
      var cx = w / 2, cy = h / 2 + 12, R = Math.min(w, h) * 0.32, a = -Math.PI / 2 + t * 0.15 + p.ph;
      var tot = p.vals.reduce(function (s, v) { return s + v; }, 0);
      for (var i = 0; i < p.vals.length; i++) {
        var da = (p.vals[i] / tot) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(cx, cy, R, a, a + da - 0.06);
        ctx.strokeStyle = p.cols[i % p.cols.length]; ctx.lineWidth = R * 0.42; ctx.lineCap = 'butt'; ctx.stroke();
        a += da;
      }
      ctx.fillStyle = C.fg; ctx.font = '700 ' + Math.round(R * 0.5) + 'px "Bricolage Grotesque", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.center, cx, cy); ctx.textAlign = 'left';
    },
    pie: function (w, h, t, p) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38, a = t * 0.12 + p.ph;
      var tot = p.vals.reduce(function (s, v) { return s + v; }, 0);
      for (var i = 0; i < p.vals.length; i++) {
        var da = (p.vals[i] / tot) * Math.PI * 2, r = R + (i === 1 ? 6 + 4 * Math.sin(t) : 0);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a + da); ctx.closePath();
        ctx.fillStyle = p.cols[i % p.cols.length]; ctx.fill();
        a += da;
      }
    },
    line: function (w, h, t, p) {
      label(p.title, 14, 12);
      var n = p.vals.length, x0 = 14, x1 = w - 14, y0 = 44, y1 = h - 18;
      ctx.strokeStyle = 'rgba(190,160,255,.15)'; ctx.lineWidth = 1;
      for (var g = 0; g < 4; g++) { var gy = y0 + (y1 - y0) * g / 3; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); }
      var pts = p.vals.map(function (v, i) {
        var vv = v + 0.06 * Math.sin(t * 1.1 + i + p.ph);
        return [x0 + (x1 - x0) * i / (n - 1), y1 - (y1 - y0) * vv];
      });
      ctx.beginPath(); ctx.moveTo(pts[0][0], y1);
      pts.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
      ctx.lineTo(x1, y1); ctx.closePath();
      var f = ctx.createLinearGradient(0, y0, 0, y1); f.addColorStop(0, p.col + '66'); f.addColorStop(1, p.col + '00');
      ctx.fillStyle = f; ctx.fill();
      ctx.beginPath(); pts.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
      ctx.strokeStyle = p.col; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke();
      var e = pts[n - 1]; ctx.beginPath(); ctx.arc(e[0], e[1], 4.5, 0, 7); ctx.fillStyle = C.fg; ctx.fill();
    },
    kpi: function (w, h, t, p) {
      label(p.title, 14, 14);
      var val = p.base + p.amp * Math.sin(t * 0.5 + p.ph);
      ctx.fillStyle = C.fg; ctx.font = '700 ' + Math.round(h * 0.34) + 'px "Bricolage Grotesque", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(p.fmt(val), 14, h * 0.64);
      ctx.fillStyle = p.col; ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText((p.delta >= 0 ? '▲ +' : '▼ ') + p.delta.toFixed(1).replace('.', ',') + '%', 14, h * 0.64 + 22);
      var n = 12, x0 = w * 0.55, x1 = w - 14, yb = h - 16, yt = h * 0.62;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var x = x0 + (x1 - x0) * i / (n - 1), y = yb - (yb - yt) * (0.3 + 0.5 * Math.abs(Math.sin(i * 1.3 + p.ph + t * 0.4)));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = p.col; ctx.lineWidth = 1.8; ctx.stroke();
    }
  };


  /* Versões temáticas dos painéis: aparecem quando os grupos se formam no menu. */
  var mdraw = {
    avatar: function (w, h, t) {
      label('SOBRE', 14, 12);
      var cx = w / 2, cy = h / 2 + 8, r = Math.min(w, h) * 0.27;
      var g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, C.violet); g.addColorStop(1, C.pink);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.3); ctx.setLineDash([3, 6]); ctx.strokeStyle = 'rgba(63,224,240,.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r + 9, 0, 7); ctx.stroke(); ctx.restore();
      ctx.fillStyle = C.fg; ctx.font = '800 ' + Math.round(r * 0.8) + 'px "Bricolage Grotesque", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MO', cx, cy + 1); ctx.textAlign = 'left';
    },
    profile: function (w, h, t) {
      label('PERFIL', 14, 12);
      var ws = [1, 0.78, 0.55];
      for (var i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(246,241,255,.28)'; rr(14, 32 + i * 13, (w - 28) * ws[i], 6, 3); ctx.fill(); }
      var ch = ['BI', 'IA', 'KPI'], x = 14;
      ctx.font = '500 9px "JetBrains Mono", monospace'; ctx.textBaseline = 'middle';
      for (var k = 0; k < 3; k++) {
        var cw = ctx.measureText(ch[k]).width + 14;
        ctx.strokeStyle = 'rgba(190,160,255,.5)'; ctx.lineWidth = 1; rr(x, h - 28, cw, 17, 8.5); ctx.stroke();
        ctx.fillStyle = C.cyan; ctx.fillText(ch[k], x + 7, h - 19); x += cw + 6;
      }
    },
    timeline: function (w, h, t) {
      label('LINHA DO TEMPO', 14, 12);
      var y = h * 0.58, x0 = 20, x1 = w - 20, xs = [0, 0.34, 0.67, 1], prog = 0.5 + 0.5 * Math.sin(t * 0.6 - 1);
      ctx.strokeStyle = 'rgba(190,160,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.strokeStyle = C.cyan; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * prog, y); ctx.stroke();
      ctx.font = '500 8px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      xs.forEach(function (f) {
        var x = x0 + (x1 - x0) * f, on = f <= prog + 0.02;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = on ? C.cyan : '#1a0b33'; ctx.fill(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = 'rgba(246,241,255,.55)'; ctx.fillText('20XX', x, y + 12);
      });
      ctx.textAlign = 'left';
    },
    steps: function (w, h, t) {
      label('EVOLUÇÃO', 14, 12);
      var v = [0.25, 0.42, 0.6, 0.8, 1], n = v.length, bw = (w - 28 - (n - 1) * 6) / n, base = h - 14, top = 36;
      for (var i = 0; i < n; i++) {
        var bh = (base - top) * v[i] * (0.94 + 0.06 * Math.sin(t * 0.8 + i));
        var g = ctx.createLinearGradient(0, base - bh, 0, base); g.addColorStop(0, i === n - 1 ? C.pink : C.violet); g.addColorStop(1, 'rgba(157,107,255,.25)');
        ctx.fillStyle = g; rr(14 + i * (bw + 6), base - bh, bw, bh, 3); ctx.fill();
      }
    },
    meters: function (w, h, t) {
      label('SKILLS', 14, 10);
      var nm = ['SQL', 'BI', 'IA'], v = [0.85, 0.72, 0.58];
      ctx.font = '500 9px "JetBrains Mono", monospace'; ctx.textBaseline = 'middle';
      for (var i = 0; i < 3; i++) {
        var y = 36 + i * 17, f = v[i] * (0.96 + 0.04 * Math.sin(t * 0.9 + i));
        ctx.fillStyle = 'rgba(246,241,255,.6)'; ctx.fillText(nm[i], 14, y);
        ctx.fillStyle = 'rgba(190,160,255,.2)'; rr(42, y - 3, w - 56, 6, 3); ctx.fill();
        var g = ctx.createLinearGradient(42, 0, w - 14, 0); g.addColorStop(0, C.violet); g.addColorStop(1, C.cyan);
        ctx.fillStyle = g; rr(42, y - 3, (w - 56) * f, 6, 3); ctx.fill();
      }
    },
    radar: function (w, h, t) {
      label('SKILLS', 14, 12);
      var cx = w / 2, cy = h / 2 + 12, R = Math.min(w, h) * 0.34, n = 5, val = [0.9, 0.68, 0.85, 0.6, 0.78];
      function pt(i, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }
      ctx.strokeStyle = 'rgba(190,160,255,.25)'; ctx.lineWidth = 1;
      [1, 0.66, 0.33].forEach(function (k) { ctx.beginPath(); for (var i = 0; i < n; i++) { var p = pt(i, R * k); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath(); ctx.stroke(); });
      ctx.beginPath();
      var pts = val.map(function (v, i) { return pt(i, R * v * (0.94 + 0.06 * Math.sin(t * 0.8 + i * 1.3))); });
      pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      ctx.fillStyle = 'rgba(63,224,240,.25)'; ctx.fill(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.stroke();
      pts.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 2.8, 0, 7); ctx.fillStyle = C.fg; ctx.fill(); });
    },
    mail: function (w, h, t) {
      var x = w * 0.16, y = h * 0.3, ww = w * 0.68, hh = h * 0.44;
      ctx.strokeStyle = 'rgba(246,241,255,.85)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; rr(x, y, ww, hh, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + ww / 2, y + hh * 0.58); ctx.lineTo(x + ww - 2, y + 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + ww, y, 5 + 1.5 * Math.sin(t * 2), 0, 7); ctx.fillStyle = C.pink; ctx.fill();
    },
    chat: function (w, h, t) {
      var x = w * 0.14, y = h * 0.24, ww = w * 0.72, hh = h * 0.4;
      ctx.fillStyle = 'rgba(157,107,255,.55)'; rr(x, y, ww, hh, 9); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + ww * 0.2, y + hh - 1); ctx.lineTo(x + ww * 0.12, y + hh + 11); ctx.lineTo(x + ww * 0.38, y + hh - 1); ctx.closePath(); ctx.fill();
      for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + ww * (0.28 + i * 0.22), y + hh / 2 + 2 * Math.sin(t * 3 - i), 3.2, 0, 7); ctx.fillStyle = C.fg; ctx.fill(); }
    }
  };

  var mk = function (type, x, y, z, w, h, p, g, off, mv) { p.ph = p.ph || Math.random() * 6; return { type: type, x: x, y: y, z: z, w: w, h: h, p: p, g: g || null, off: off || [0, 0], sp: 0.15 + Math.random() * 0.2, sh: Math.random() * 6, mv: mv || null }; };
  var cols = [C.violet, C.pink, C.cyan, C.amber];
  var P = [
    mk('bars', 0.07, 0.2, 1.0, 230, 150, { title: 'VENDAS POR MÊS', vals: [.45, .7, .55, .85, .65, .95], cols: [C.pink, C.violet] }, 'projetos', [-120, 10]),
    mk('kpi', 0.78, 0.14, 0.9, 210, 130, { title: 'TAXA DE ACERTO', base: 87.4, amp: 3, fmt: function (v) { return v.toFixed(1).replace('.', ',') + '%'; }, delta: 4.2, col: C.cyan }, null, [0, 0]),
    mk('donut', 0.82, 0.58, 1.1, 190, 190, { title: 'ORIGEM', vals: [38, 27, 21, 14], cols: cols, center: '4' }, 'habilidades', [70, -15], 'radar'),
    mk('line', 0.1, 0.62, 1.05, 260, 150, { title: 'TENDÊNCIA', vals: [.25, .4, .33, .55, .5, .72, .66, .88], col: C.cyan }, 'projetos', [115, 30]),
    mk('pie', 0.3, 0.07, 0.6, 120, 120, { vals: [40, 25, 20, 15], cols: cols }, 'contato', [-60, 0], 'mail'),
    mk('kpi', 0.62, 0.7, 0.8, 200, 120, { title: 'ATENDIMENTOS', base: 12840, amp: 380, fmt: function (v) { return Math.round(v).toLocaleString('pt-BR'); }, delta: 12.6, col: C.amber }, 'projetos', [-5, -75]),
    mk('bars', 0.66, 0.06, 0.55, 170, 110, { title: 'META', vals: [.5, .8, .6, .9], cols: [C.cyan, C.violet] }, 'trajetoria', [75, 55], 'steps'),
    mk('line', 0.34, 0.72, 0.6, 190, 110, { title: 'CRESCIMENTO', vals: [.3, .35, .5, .45, .62, .8], col: C.pink }, 'trajetoria', [-70, -38], 'timeline'),
    mk('donut', 0.05, 0.42, 0.5, 130, 130, { title: 'CANAIS', vals: [50, 30, 20], cols: [C.violet, C.cyan, C.pink], center: '3' }, 'sobre', [-55, -20], 'avatar'),
    mk('pie', 0.9, 0.34, 0.5, 100, 100, { vals: [30, 45, 25], cols: [C.pink, C.violet, C.cyan] }, 'contato', [55, 15], 'chat'),
    mk('kpi', 0.2, 0.36, 0.45, 160, 100, { title: 'NPS', base: 72, amp: 4, fmt: function (v) { return Math.round(v) + ''; }, delta: 2.1, col: C.pink }, 'sobre', [55, 40], 'profile'),
    mk('bars', 0.48, 0.8, 0.45, 150, 90, { title: 'SEMANA', vals: [.4, .6, .5, .75, .55, .8, .7], cols: [C.amber, C.pink] }, 'habilidades', [-85, 32], 'meters')
  ];
  P.sort(function (a, b) { return a.z - b.z; });
  P.forEach(function (o, i) { o.st = ((i * 5) % 12) * 0.03; });

  /* Constelações: centro de cada grupo (fração da tela) em tela larga e em tela estreita. */
  var ORDER = ['sobre', 'projetos', 'trajetoria', 'contato', 'habilidades'];
  var CENTERS = {
    wide:   { sobre: [0.17, 0.47], projetos: [0.5, 0.5], trajetoria: [0.83, 0.43], habilidades: [0.3, 0.8], contato: [0.7, 0.8] },
    narrow: {}
  };
  var segs = {};
  [].forEach.call(document.querySelectorAll('.seg'), function (b) { segs[b.dataset.g] = b; });
  var hv = {}, hover = null;
  ORDER.forEach(function (g) { hv[g] = 0; });

  var ui = document.getElementById('menuUi'), scrollBox = document.getElementById('menuScroll');
  var menu = false, m = 0, last = 0, narrow = false, sm = 1, layout = CENTERS.wide;
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }

  function resize() {
    if (typeof P !== 'undefined') P.forEach(function (o) { o.spr = null; });
    DPR = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    narrow = W < 820;
    layout = CENTERS.wide;
    if (narrow) {
      /* Uma constelação por linha, uma embaixo da outra; a lista rola. */
      var top = 150, gap = 36, y = top, lblH = 52;
      ORDER.forEach(function (g) {
        var mem = P.filter(function (o) { return o.g === g; }), n = mem.length, slot = (W - 32) / n, boxH = 0;
        mem.forEach(function (o, i) {
          o.nsc = Math.min(0.8, (slot * 0.92) / o.w);
          o.tx = 16 + slot * (i + 0.5);
          boxH = Math.max(boxH, o.h * o.nsc);
        });
        boxH += 14;
        mem.forEach(function (o) { o.ty = y + boxH / 2; });
        var b = segs[g];
        b.style.left = W / 2 + 'px'; b.style.top = (y + boxH / 2) + 'px';
        b.style.width = (W - 24) + 'px'; b.style.height = boxH + 'px';
        y += boxH + lblH + gap;
      });
      scrollBox.style.height = (y + 56) + 'px';
      sm = Math.max(0.5, Math.min(W / 640, 0.9));
    } else {
      sm = Math.max(0.6, Math.min(W / 1400, H / 820));
      scrollBox.style.height = '100%';
      var boxH0 = 200 * sm, yb = Math.max(0.62, Math.min(0.75, (H - 64 - 52 - boxH0 / 2) / H));
      layout = { sobre: CENTERS.wide.sobre, projetos: CENTERS.wide.projetos, trajetoria: CENTERS.wide.trajetoria, habilidades: [CENTERS.wide.habilidades[0], yb], contato: [CENTERS.wide.contato[0], yb] };
      ORDER.forEach(function (g) {
        var b = segs[g], c = layout[g];
        b.style.left = c[0] * W + 'px'; b.style.top = c[1] * H + 'px';
        b.style.width = 250 * sm + 'px'; b.style.height = 200 * sm + 'px';
      });
    }
  }

  /* Cache dos painéis: cada painel é desenhado em uma imagem à parte e essa imagem é só movida na tela.
     Painéis distantes (desfocados) usam uma imagem de resolução menor, o que dá o efeito de desfoque sem custo. */
  var SPAD = 40, frameNo = 0, transit = false;
  function paintPanel(o, tt, glow, ee, cardA, em) {
    var w = o.w, h = o.h;
    if (cardA > 0.01) {
      ctx.globalAlpha = cardA;
      if (!lite) { ctx.shadowColor = glow > 0.3 ? 'rgba(63,224,240,.55)' : 'rgba(157,107,255,.35)'; ctx.shadowBlur = 30 * o.z * (1 - em) + (14 + 22 * glow) * em; }
      rr(0, 0, w, h, 14);
      ctx.fillStyle = 'rgba(32,14,62,.72)'; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = glow > 0.3 ? 'rgba(63,224,240,.7)' : 'rgba(190,160,255,.28)'; ctx.lineWidth = 1; ctx.stroke();
    }
    if (ee < 0.99) { ctx.globalAlpha = o.mv ? 1 - ee : 1; draw[o.type](w, h, tt, o.p); }
    if (ee > 0.01) { ctx.globalAlpha = ee; mdraw[o.mv](w, h, tt); }
  }
  function refreshSprite(o, tt, glow, ee, cardA, em) {
    var w = o.w, h = o.h, sp = o.spr;
    if (!sp || sp.q < DPR * o.sc * 0.85) {
      var q = Math.min(2.2, Math.max(1, DPR * Math.max(1, o.sc)));
      var c = document.createElement('canvas');
      c.width = Math.ceil((w + 2 * SPAD) * q); c.height = Math.ceil((h + 2 * SPAD) * q);
      sp = o.spr = { c: c, x: c.getContext('2d'), q: q, f: 1 };
    }
    var f = o.bl > 0.5 ? 1 / (1 + o.bl * 0.45) : 1;
    sp.f = f;
    var main = ctx; ctx = sp.x;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, sp.c.width, sp.c.height);
    var k = sp.q * f; ctx.setTransform(k, 0, 0, k, SPAD * k, SPAD * k);
    paintPanel(o, tt, glow, ee, cardA, em);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx = main;
    return sp;
  }

  function start() { if (!reduce && !raf && !paused) raf = requestAnimationFrame(frame); }
  function frame(ms) {
    raf = 0;
    if (paused && !reduce) return; /* parado enquanto uma seção está aberta */
    if (!reduce) {
      var gap = ms - lastDraw;
      if (!transit && gap < 30) { start(); return; } /* 30 quadros por segundo quando nada está em transição */
      if (!checked && lastDraw) {
        slowN++; if (slowN > 20) slowSum += gap;
        if (slowN === 80) { checked = true; if (!lite && slowSum / 60 > 42) { lite = true; resize(); } }
      }
      lastDraw = ms;
    }
    var t = reduce ? 3 : ms / 1000, dt = Math.min(0.05, Math.max(0, t - last)); last = t;
    if (reduce) m = menu ? 1 : 0; else m = Math.max(0, Math.min(1, m + (menu ? dt : -dt) / 1.7));
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    ORDER.forEach(function (g) { hv[g] = lerp(hv[g], hover === g ? 1 : 0, 0.12); });
    ctx.clearRect(0, 0, W, H);
    var s = Math.max(0.55, Math.min(W, H * 1.4) / 900);
    var em = ease(m), scr = menu || m > 0 ? ui.scrollTop : 0;

    /* 1) posição de cada painel: mistura entre o fundo solto e a constelação */
    P.forEach(function (o) {
      var scH = s * (0.55 + o.z * 0.55);
      var hx = o.x * W + Math.sin(t * o.sp + o.sh) * 14 * o.z - mx * 38 * o.z + (o.w * scH) / 2;
      var hy = o.y * H + Math.cos(t * o.sp * 0.8 + o.sh) * 18 * o.z - my * 28 * o.z + (o.h * scH) / 2;
      var e = ease((m - o.st) / 0.64);
      var k = o.g ? 1 : 0, mxp, myp, scM, alM;
      if (o.g && narrow) {
        var hN = hv[o.g];
        mxp = o.tx - mx * 6; myp = o.ty - scr + Math.cos(t * o.sp * 0.8 + o.sh) * 3;
        scM = o.nsc * (1 + 0.06 * hN);
        alM = (hover && hover !== o.g ? 0.5 : 0.96);
      } else if (o.g) {
        var c = layout[o.g], h = hv[o.g];
        mxp = c[0] * W + o.off[0] * sm + Math.sin(t * o.sp + o.sh) * 5 - mx * 8;
        myp = c[1] * H + o.off[1] * sm + Math.cos(t * o.sp * 0.8 + o.sh) * 6 - my * 6;
        scM = sm * 0.78 * (1 + 0.1 * h);
        alM = (hover && hover !== o.g ? 0.5 : 0.96);
      } else {
        mxp = W * 0.93 - mx * 20; myp = H * 0.17 - my * 14 - scr; scM = sm * 0.5; alM = 0.18;
      }
      o.e = e;
      o.cx = lerp(hx, mxp, e); o.cy = lerp(hy, myp, e); o.sc = lerp(scH, scM, e);
      o.al = lerp(Math.min(1, 0.35 + o.z * 0.6), alM, e);
      o.bl = lerp(o.z < 0.7 ? (0.7 - o.z) * 5 : 0, o.g ? 0 : 3, e);
      o.rot = Math.sin(t * o.sp * 0.6 + o.sh) * 0.04 * (1 - e);
    });

    /* 2) linhas e estrelas das constelações */
    if (em > 0.01) {
      ctx.save();
      var cen = {};
      ORDER.forEach(function (g) {
        var sx = 0, sy = 0, n = 0;
        P.forEach(function (o) { if (o.g === g) { sx += o.cx; sy += o.cy; n++; } });
        cen[g] = [sx / n, sy / n];
      });
      ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
      ctx.strokeStyle = 'rgba(190,160,255,' + (0.35 * em) + ')';
      ctx.beginPath();
      ORDER.forEach(function (g, i) { var c = cen[g]; i ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]); });
      ctx.lineTo(cen[ORDER[0]][0], cen[ORDER[0]][1]);
      ctx.stroke();
      ctx.setLineDash([]);
      P.forEach(function (o) {
        if (!o.g) return;
        var c = cen[o.g], h = hv[o.g];
        ctx.strokeStyle = 'rgba(' + (h > 0.3 ? '63,224,240' : '190,160,255') + ',' + ((0.3 + 0.5 * h) * em) + ')';
        ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(o.cx, o.cy); ctx.stroke();
      });
      ORDER.forEach(function (g) {
        var c = cen[g], h = hv[g];
        ctx.beginPath(); ctx.arc(c[0], c[1], 3.5 + 3 * h, 0, 7);
        ctx.fillStyle = h > 0.3 ? C.cyan : C.fg; if (!lite) { ctx.shadowColor = C.cyan; ctx.shadowBlur = 10 + 14 * h; } ctx.globalAlpha = em; ctx.fill();
      });
      ctx.restore();
    }

    /* 3) painéis: cada um é uma imagem guardada, que é refeita só de vez em quando (e a cada quadro durante as transições) */
    frameNo++;
    var settledAll = !(m > 0.001 && m < 0.999);
    P.forEach(function (o, idx) {
      if (o.al < 0.01) return;
      var w = o.w, h = o.h;
      var glow = o.g ? hv[o.g] : 0, ee = o.mv ? o.e : 0, cardA = o.type === 'pie' ? ee : 1;
      var hoverBusy = o.g && hv[o.g] > 0.01 && hv[o.g] < 0.99;
      var sp = o.spr;
      var need = reduce || !sp || !settledAll || hoverBusy || (frameNo + idx) % 3 === 0 || sp.q < DPR * o.sc * 0.85 || (o.e > 0.001 && o.e < 0.999);
      if (need) sp = refreshSprite(o, t, glow, ee, cardA, em);
      var f = sp.f;
      ctx.save();
      ctx.translate(o.cx, o.cy); ctx.rotate(o.rot); ctx.scale(o.sc, o.sc); ctx.translate(-w / 2, -h / 2);
      ctx.globalAlpha = o.al;
      ctx.drawImage(sp.c, 0, 0, (w + 2 * SPAD) * sp.q * f, (h + 2 * SPAD) * sp.q * f, -SPAD, -SPAD, w + 2 * SPAD, h + 2 * SPAD);
      ctx.restore();
    });
    transit = !settledAll || ORDER.some(function (g) { return Math.abs(hv[g] - (hover === g ? 1 : 0)) > 0.02; });
    start();
  }

  function setMenu(on) {
    menu = on;
    document.body.classList.toggle('menu', on);
    document.querySelector('main').inert = on;
    if (!on) { ui.scrollTop = 0; hover = null; msg.classList.remove('on'); }
    if (reduce) frame(0);
    if (on) { var first = segs[ORDER[0]]; setTimeout(function () { if (menu) first.focus({ preventScroll: true }); }, 1800); }
  }


  /* ---------- Seções ---------- */
  var secEl = document.getElementById('sec'), panes = [].slice.call(secEl.querySelectorAll('.pane')), tabBtns = [].slice.call(document.querySelectorAll('.tab'));
  var detail = document.getElementById('detail'), curSec = null, lastDetailBtn = null, backBtn = document.getElementById('back');
  function chartSvg(type, col, w, h) {
    var o = '<svg class="svg-fill" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">', i;
    if (type === 'bars') {
      var v = [.4, .62, .5, .78, .66, .92, .74], bw = (w - 20) / v.length;
      for (i = 0; i < v.length; i++) o += '<rect x="' + (10 + i * bw + 3) + '" y="' + (h - 10 - (h - 24) * v[i]) + '" width="' + (bw - 6) + '" height="' + ((h - 24) * v[i]) + '" rx="4" style="fill:' + (i % 2 ? '#9d6bff' : col) + '"/>';
    } else if (type === 'line') {
      var y = [.25, .4, .32, .55, .5, .72, .66, .88], pts = y.map(function (a, k) { return (10 + (w - 20) * k / (y.length - 1)) + ',' + (h - 12 - (h - 28) * a); });
      o += '<polygon points="10,' + (h - 12) + ' ' + pts.join(' ') + ' ' + (w - 10) + ',' + (h - 12) + '" style="fill:rgba(63,224,240,.16)"/>';
      o += '<polyline points="' + pts.join(' ') + '" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke:' + col + '"/>';
    } else {
      var seg = [38, 27, 21, 14], cs = ['#9d6bff', '#ff5fb0', '#3fe0f0', '#ffc857'], R = Math.min(w, h) * 0.34, C2 = 2 * Math.PI * R, off = 0;
      for (i = 0; i < seg.length; i++) { var L = C2 * seg[i] / 100; o += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + R + '" fill="none" stroke-width="' + (R * 0.42) + '" stroke-dasharray="' + (L - 3) + ' ' + (C2 - L + 3) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 ' + (w / 2) + ' ' + (h / 2) + ')" style="stroke:' + cs[i] + '"/>'; off += L; }
    }
    return o + '</svg>';
  }
  function esc(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var shotEl = document.getElementById('shot'), pinfoEl = document.getElementById('pinfo'), thumbsEl = document.getElementById('thumbs'), pfEl = document.getElementById('pfilters');
  var pFilter = 'all', pCur = null;
  function pList() { return PROJ.filter(function (p) { return pFilter === 'all' || p.cat === pFilter; }); }
  function phHtml(p, big) { return '<div class="ph">' + chartSvg(p.ph, '#ff5fb0', 240, 130) + '</div>' + (big ? '<div class="soon">Captura de tela em breve</div>' : ''); }
  window.__phFix = function (img) { var host = img.parentNode, i = +img.getAttribute('data-i'), big = img.getAttribute('data-big') === '1'; img.remove(); if (host) host.insertAdjacentHTML('beforeend', phHtml(PROJ[i], big)); };
  function pImgs(p) { return p.imgs || []; }
  function thumbSrc(p) { var l = pImgs(p); return l.length ? l[Math.min(p.thumb || 0, l.length - 1)].src : null; }
  var sIdx = 0;
  function viewHtml(p) {
    var l = pImgs(p);
    if (p.list) return '<ul class="others">' + p.list.map(function (x) { return '<li><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></li>'; }).join('') + '</ul>';
    if (!l.length) return phHtml(p, true);
    var m = l[sIdx], multi = l.length > 1;
    return '<img src="' + m.src + '" alt="' + esc(p.t + ': ' + m.cap) + '" data-i="' + PROJ.indexOf(p) + '" data-big="1" onerror="__phFix(this)">' +
      (multi ? '<button type="button" class="sl prev" id="slPrev" aria-label="Captura anterior">‹</button><button type="button" class="sl next" id="slNext" aria-label="Próxima captura">›</button>' : '');
  }
  function barHtml(p) {
    var l = pImgs(p); if (!l.length) return '';
    return '<div class="fbar"><span id="cap">' + esc(l[sIdx].cap) + '</span>' + (l.length > 1 ? '<span class="dotsnav" role="group" aria-label="Escolher captura">' + l.map(function (x, i) { return '<button type="button" data-s="' + i + '" aria-label="Captura ' + (i + 1) + ': ' + esc(x.cap) + '"' + (i === sIdx ? ' aria-current="true"' : '') + '></button>'; }).join('') + '<em>' + (sIdx + 1) + '/' + l.length + '</em></span>' : '') + '</div>';
  }
  var shotEl = document.getElementById('shot'), pinfoEl = document.getElementById('pinfo'), thumbsEl = document.getElementById('thumbs'), pfEl = document.getElementById('pfilters');
  var pFilter = 'all', pCur = null;
  function pList() { return PROJ.filter(function (p) { return pFilter === 'all' || p.cat === pFilter; }); }
  function drawShot() {
    var p = pCur, l = pImgs(p);
    shotEl.innerHTML = '<div class="dots"><i></i><i></i><i></i></div><div class="view' + (l.length ? ' has' : '') + '" id="view">' + viewHtml(p) + '</div>' + barHtml(p);
    var v = document.getElementById('view');
    if (l.length) {
      v.addEventListener('click', function (e) { if (e.target.closest('.sl')) return; openDetail(p, v); });
      var x0 = null;
      v.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
      v.addEventListener('pointerup', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 50) { stepSlide(e.clientX < x0 ? 1 : -1); } x0 = null; });
      var pv = document.getElementById('slPrev'), nx = document.getElementById('slNext');
      if (pv) pv.addEventListener('click', function () { stepSlide(-1); });
      if (nx) nx.addEventListener('click', function () { stepSlide(1); });
      [].forEach.call(shotEl.querySelectorAll('.dotsnav button'), function (b) { b.addEventListener('click', function () { sIdx = +b.dataset.s; drawShot(); }); });
    }
  }
  function stepSlide(d) { var n = pImgs(pCur).length; if (n < 2) return; sIdx = (sIdx + d + n) % n; drawShot(); if (!detail.hidden) lbShow(); }
  function renderProj() {
    var list = pList(); if (!list.length) return;
    if (!pCur || list.indexOf(pCur) < 0) { pCur = list[0]; sIdx = 0; }
    var i = list.indexOf(pCur), p = pCur, l = pImgs(p);
    drawShot();
    pinfoEl.style.animation = 'none'; void pinfoEl.offsetWidth; pinfoEl.style.animation = '';
    pinfoEl.innerHTML = '<div class="tagrow"><span class="tag">' + p.tag + '</span></div><h3>' + esc(p.t) + '</h3><p>' + esc(p.p) + '</p>' +
      '<ul class="chips">' + p.tools.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      (p.res ? '<div class="hl res"><b>Resultado</b><span>' + esc(p.res) + '</span></div>' : '') + (p.hl ? '<div class="hl"><b>Destaque</b><span>' + esc(p.hl) + '</span></div>' : '') +
      '<div class="acts">' + (p.link ? '<a class="btn" href="' + p.link + '" target="_blank" rel="noopener noreferrer">Abrir painel interativo →</a>' : '') + (l.length ? '<button class="btn ghost" type="button" id="zoomBtn">Ampliar captura</button>' : '') + (p.story ? '<button class="btn ghost" type="button" id="storyBtn">Sobre o projeto</button>' : '') + '</div>' +
      '<div class="nav"><button type="button" id="pPrev" aria-label="Projeto anterior">←</button><button type="button" id="pNext" aria-label="Próximo projeto">→</button><span>PROJETO ' + (i + 1) + ' DE ' + list.length + '</span></div>';
    var sb = document.getElementById('storyBtn'); if (sb) sb.addEventListener('click', function () { openStory(sb); });
    var z = document.getElementById('zoomBtn'); if (z) z.addEventListener('click', function () { openDetail(p, z); });
    document.getElementById('pPrev').addEventListener('click', function () { stepProj(-1); });
    document.getElementById('pNext').addEventListener('click', function () { stepProj(1); });
    thumbsEl.innerHTML = '';
    list.forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'thumb'; b.setAttribute('role', 'listitem');
      b.setAttribute('aria-current', q === pCur ? 'true' : 'false');
      var ts = thumbSrc(q);
      b.innerHTML = '<span class="tv">' + (ts ? '<img src="' + ts + '" alt="" loading="lazy" data-i="' + PROJ.indexOf(q) + '" data-big="0" onerror="__phFix(this)">' : chartSvg(q.ph, '#ff5fb0', 240, 150)) + '</span><span>' + esc(q.t) + '</span>';
      b.addEventListener('click', function () { pCur = q; sIdx = 0; renderProj(); });
      thumbsEl.appendChild(b);
    });
    var act = thumbsEl.querySelector('[aria-current="true"]'); if (act) thumbsEl.scrollLeft = act.offsetLeft - (thumbsEl.clientWidth - act.offsetWidth) / 2;
  }
  function stepProj(d) { var list = pList(), i = list.indexOf(pCur); pCur = list[(i + d + list.length) % list.length]; sIdx = 0; renderProj(); }
  [{ k: 'all', n: 'Todos' }, { k: 'tre', n: 'TRE-RR' }, { k: 'pessoal', n: 'Pessoais' }].forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fbtn'; b.dataset.k = c.k; b.textContent = c.n;
    b.setAttribute('aria-pressed', c.k === 'all' ? 'true' : 'false');
    b.addEventListener('click', function () {
      pFilter = c.k; [].forEach.call(pfEl.children, function (x) { x.setAttribute('aria-pressed', x.dataset.k === c.k ? 'true' : 'false'); });
      renderProj();
    });
    pfEl.appendChild(b);
  });
  renderProj();
  function lbShow() {
    var m = pImgs(pCur)[sIdx], n = pImgs(pCur).length;
    document.getElementById('lbBody').innerHTML = '<img src="' + m.src + '" alt="' + esc(pCur.t + ': ' + m.cap) + '"><div class="lbcap">' + esc(m.cap) + (n > 1 ? ' (' + (sIdx + 1) + '/' + n + ')' : '') + '</div>' +
      (n > 1 ? '<button type="button" class="sl prev" id="lbPrev" aria-label="Captura anterior">‹</button><button type="button" class="sl next" id="lbNext" aria-label="Próxima captura">›</button>' : '');
    var pv = document.getElementById('lbPrev'), nx = document.getElementById('lbNext');
    if (pv) pv.addEventListener('click', function () { stepSlide(-1); });
    if (nx) nx.addEventListener('click', function () { stepSlide(1); });
  }
  function openDetail(p, btn) {
    lastDetailBtn = btn; lbShow();
    detail.hidden = false; document.getElementById('dClose').focus();
  }
  function closeDetail() { detail.hidden = true; if (lastDetailBtn && document.body.contains(lastDetailBtn)) lastDetailBtn.focus(); }
  var storyEl = document.getElementById('story'), storyBtn0 = null;
  function openStory(b) { storyBtn0 = b; storyEl.hidden = false; document.getElementById('sClose').focus(); }
  function closeStory() { storyEl.hidden = true; if (storyBtn0 && document.body.contains(storyBtn0)) storyBtn0.focus(); }
  document.getElementById('sClose').addEventListener('click', closeStory);
  document.getElementById('sClose2').addEventListener('click', closeStory);
  storyEl.addEventListener('click', function (e) { if (e.target === storyEl) closeStory(); });
  document.getElementById('dClose').addEventListener('click', closeDetail);
  detail.addEventListener('click', function (e) { if (e.target === detail) closeDetail(); });

  [].forEach.call(document.querySelectorAll('.meter'), function (m) {
    var lv = +m.dataset.lv, h = '';
    for (var i = 0; i < 5; i++) h += '<i class="' + (i < lv ? 'on' : '') + '" style="animation-delay:' + (0.25 + i * 0.07) + 's"></i>';
    m.innerHTML = h; m.setAttribute('role', 'img'); m.setAttribute('aria-label', 'Nível ' + lv + ' de 5');
  });

  [].forEach.call(document.querySelectorAll('.copy'), function (b) {
    b.addEventListener('click', function () {
      var v = b.parentNode.querySelector('.v'), txt = v.textContent;
      function sel() { var r = document.createRange(); r.selectNodeContents(v); var s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(r); }
      function done(ok) { if (!ok) sel(); b.textContent = ok ? 'Copiado' : 'Selecionado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1800); }
      try { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
    });
  });


  /* ---------- Habilidades ---------- */
  var catBy = {}; CATS.forEach(function (c) { catBy[c.k] = c; });
  var tilesEl = document.getElementById('tiles'), filtersEl = document.getElementById('filters'), cntEl = document.getElementById('cnt');
  SK.forEach(function (r, i) {
    var c = catBy[r[0]], d = document.createElement('div');
    d.className = 'tile'; d.dataset.cat = r[0]; d.style.setProperty('--c', c.c); d.style.animationDelay = (0.05 + i * 0.03) + 's';
    d.innerHTML = '<span class="badge" aria-hidden="true">' + r[1] + '</span><div class="t"><b>' + r[2] + (r[5] ? '<em>uso pontual</em>' : '') + '</b>' + (r[3] ? '<small>' + r[3] + '</small>' : '') + '</div>';
    tilesEl.appendChild(d);
  });
  function setFilter(k) {
    var n = 0;
    [].forEach.call(tilesEl.children, function (t) { var on = k === 'all' || t.dataset.cat === k; t.classList.toggle('dim', !on); if (on) n++; });
    [].forEach.call(filtersEl.children, function (b) { b.setAttribute('aria-pressed', b.dataset.k === k ? 'true' : 'false'); });
    cntEl.textContent = (k === 'all' ? SK.length + ' habilidades' : n + ' de ' + SK.length + ' habilidades');
  }
  [{ k: 'all', n: 'Tudo', c: '' }].concat(CATS).forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fbtn'; b.dataset.k = c.k;
    if (c.c) b.style.setProperty('--c', c.c);
    b.innerHTML = (c.c ? '<i></i>' : '') + c.n;
    b.addEventListener('click', function () { setFilter(c.k); });
    filtersEl.appendChild(b);
  });
  setFilter('all');

  function showPane(g) {
    curSec = g;
    panes.forEach(function (p) { p.hidden = p.dataset.p !== g; });
    tabBtns.forEach(function (t) { if (t.dataset.p === g) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    secEl.scrollTop = 0;
    var h = secEl.querySelector('.pane:not([hidden]) h2'); if (h) h.focus({ preventScroll: true });
  }
  function openSection(g) {
    document.body.classList.add('insec'); ui.inert = true;
    paused = true;
    showPane(g);
  }
  function closeSection() {
    var g = curSec; curSec = null;
    document.body.classList.remove('insec'); ui.inert = false;
    paused = false; lastDraw = 0; start();
    panes.forEach(function (p) { p.hidden = true; });
    if (g && segs[g]) segs[g].focus({ preventScroll: true });
  }
  tabBtns.forEach(function (t) { t.addEventListener('click', function () { if (t.dataset.p !== curSec) showPane(t.dataset.p); }); });
  window.addEventListener('keydown', function (e) {
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && curSec === 'projetos') { var dd = e.key === 'ArrowRight' ? 1 : -1; if (pImgs(pCur).length > 1) stepSlide(dd); else if (detail.hidden && storyEl.hidden) stepProj(dd); return; }
    if (e.key !== 'Escape') return;
    if (!storyEl.hidden) closeStory(); else if (!detail.hidden) closeDetail(); else if (curSec) closeSection();
  });

  window.addEventListener('resize', function () { resize(); if (reduce) frame(0); });
  ui.addEventListener('scroll', function () { if (reduce) frame(0); });
  window.addEventListener('pointermove', function (e) { tx = e.clientX / W - 0.5; ty = e.clientY / H - 0.5; });
  resize();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { start(); });

  var msg = document.getElementById('msg'), msgT;
  document.getElementById('cta').addEventListener('click', function () { setMenu(true); });
  document.getElementById('home').addEventListener('click', function () {
    if (!storyEl.hidden) closeStory();
    if (!detail.hidden) closeDetail();
    if (curSec) closeSection();
    if (document.body.classList.contains('menu')) setMenu(false);
    document.getElementById('cta').focus({ preventScroll: true });
  });
  backBtn.addEventListener('click', function () { if (curSec) { closeSection(); return; } setMenu(false); document.getElementById('cta').focus({ preventScroll: true }); });
  ORDER.forEach(function (g) {
    var b = segs[g], name = b.querySelector('b').textContent;
    b.addEventListener('pointerenter', function () { hover = g; });
    b.addEventListener('pointerleave', function () { if (hover === g) hover = null; });
    b.addEventListener('focus', function () { hover = g; });
    b.addEventListener('blur', function () { if (hover === g) hover = null; });
    b.addEventListener('click', function () { openSection(g); });
  });
})();
