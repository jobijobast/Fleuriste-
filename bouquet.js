/* =========================================================
   MAISON VERVEINE - catalogue, calcul du prix et rendu du bouquet.
   Exposé sur window.MV, utilisé par atelier.js, devis.js et chatbot.js.
   Repère de dessin : 420 x 560, point de liage à (210, 368).
   ========================================================= */

window.MV = (function () {
  'use strict';

  var U = 'https://images.unsplash.com/photo-';
  var Q = '?w=440&h=440&fit=crop&q=72&auto=format';

  /* `phrase` sert aux tournures du conseiller : la langue française
     ne pardonne pas « du eucalyptus » ni « en taille moyen ». */
  var PRINCIPALES = [
    { id:'renoncule',  nom:'Renoncule',        prix:4.50, photo:'1541166227079-140bd2c23b03', phrase:'des renoncules' },
    { id:'pivoine',    nom:'Pivoine',          prix:7.00, photo:'1604632426910-3abd2e1f27ad', phrase:'des pivoines' },
    { id:'rose',       nom:'Rose de jardin',   prix:5.50, photo:'1561126841-3e34af7b2804', phrase:'des roses de jardin' },
    { id:'tulipe',     nom:'Tulipe perroquet', prix:4.00, photo:'1649629346893-b1669e7c11e9', phrase:'des tulipes perroquet' },
    { id:'anemone',    nom:'Anémone',          prix:3.80, photo:'1685907327016-36379595de60', phrase:'des anémones' },
    { id:'lisianthus', nom:'Lisianthus',       prix:4.20, photo:'1601519601884-aef41e1eef55', phrase:'du lisianthus' }
  ];

  var SECONDAIRES = [
    { id:'aucune',     nom:'Aucune',            prix:0,    photo:null, phrase:null },
    { id:'gypsophile', nom:'Gypsophile',        prix:2.50, photo:'1650805073031-e7991f380253', phrase:'un voile de gypsophile' },
    { id:'renonculeb', nom:'Renoncule blanche', prix:4.50, photo:'1677245360736-20bc5bb2165b', phrase:'quelques renoncules blanches' },
    { id:'rosecorail', nom:'Rose corail',       prix:5.50, photo:'1565573349860-cbf26ef3f40f', phrase:'quelques roses corail' },
    { id:'dahlia',     nom:'Dahlia',            prix:6.00, photo:'1617417715887-d51297ecdbca', phrase:'quelques dahlias' }
  ];

  var FEUILLAGES = [
    { id:'aucun',      nom:'Aucun',      prix:0,    feuille:null, phrase:null },
    { id:'eucalyptus', nom:'Eucalyptus', prix:2.50, feuille:{ c:'#9DB39A', t:'#7E9179', rx:7.2, ry:6.0 }, phrase:'de l’eucalyptus' },
    { id:'fougere',    nom:'Fougère',    prix:2.00, feuille:{ c:'#6F8B5E', t:'#5E7850', rx:9.5, ry:3.2 }, phrase:'de la fougère' },
    { id:'ruscus',     nom:'Ruscus',     prix:2.80, feuille:{ c:'#526E45', t:'#46603C', rx:8.4, ry:4.4 }, phrase:'du ruscus' }
  ];

  var TAILLES = [
    { id:'petit', nom:'Petit',  tiges:7,  prix:0, format:'petit' },
    { id:'moyen', nom:'Moyen',  tiges:12, prix:0, format:'moyen' },
    { id:'grand', nom:'Grand',  tiges:18, prix:0, format:'grand' }
  ];

  var EMBALLAGES = [
    { id:'kraft', nom:'Kraft naturel', prix:0,    c:'#C8AE8B', ombre:'#A98F6D', ruban:'#8E7C63' },
    { id:'creme', nom:'Papier crème',  prix:2.00, c:'#EFE7D8', ombre:'#D9CFBC', ruban:'#B8A88E' },
    { id:'rose',  nom:'Papier rosé',   prix:3.00, c:'#F3C7D2', ombre:'#DFA9B7', ruban:'#C98CA0' },
    { id:'lin',   nom:'Furoshiki lin', prix:6.00, c:'#D6D0C1', ombre:'#BDB6A4', ruban:'#8F8878' }
  ];

  function trouve(liste, id) {
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    return liste[0];
  }

  function photoUrl(ref) { return U + ref + Q; }

  /* ---------- prix ---------- */
  function calcul(compo) {
    var p = trouve(PRINCIPALES, compo.p);
    var s = trouve(SECONDAIRES, compo.s);
    var f = trouve(FEUILLAGES, compo.f);
    var t = trouve(TAILLES, compo.t);
    var e = trouve(EMBALLAGES, compo.w);

    var nSec = s.photo ? Math.round(t.tiges * 0.35) : 0;
    var nPri = t.tiges - nSec;

    var lignes = [
      { k: nPri + ' × ' + p.nom, v: nPri * p.prix }
    ];
    if (nSec) lignes.push({ k: nSec + ' × ' + s.nom, v: nSec * s.prix });
    if (f.prix) lignes.push({ k: f.nom + ' (botte)', v: f.prix });
    lignes.push({ k: e.nom, v: e.prix });

    var total = 0;
    for (var i = 0; i < lignes.length; i++) total += lignes[i].v;

    return { p:p, s:s, f:f, t:t, e:e, nPri:nPri, nSec:nSec, lignes:lignes, total:total };
  }

  function euros(n) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  function eurosCourt(n) {
    return Math.round(n).toLocaleString('fr-FR') + ' €';
  }

  /* ---------- petit générateur pseudo aléatoire stable ---------- */
  function alea(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* ---------- géométrie ---------- */
  var W = 420, H = 520;
  var TIE = { x: 210, y: 368 };
  var A0 = 196 * Math.PI / 180;
  var A1 = 344 * Math.PI / 180;

  var COUCHES = [
    { cls:'back',  cx:210, cy:258, rx:132, ry:88, taille:54, tige:1.7 },
    { cls:'mid',   cx:210, cy:274, rx:100, ry:66, taille:64, tige:2.1 },
    { cls:'front', cx:210, cy:292, rx:62,  ry:44, taille:74, tige:2.5 }
  ];

  function repartit(n) {
    var back = Math.round(n * 0.40);
    var mid = Math.round(n * 0.34);
    var front = n - back - mid;
    if (front < 1) { front = 1; mid = n - back - front; }
    return [back, mid, front];
  }

  function positions(n) {
    var parts = repartit(n);
    var out = [];
    var graine = 0;
    for (var c = 0; c < COUCHES.length; c++) {
      var L = COUCHES[c], k = parts[c];
      for (var i = 0; i < k; i++) {
        graine++;
        var t = k === 1 ? 0.5 : i / (k - 1);
        var a = A0 + (A1 - A0) * t;
        var x = L.cx + L.rx * Math.cos(a) + (alea(graine) - 0.5) * 11;
        var y = L.cy + L.ry * Math.sin(a) + (alea(graine + 41) - 0.5) * 11;
        out.push({
          x: x, y: y,
          taille: L.taille * (0.86 + alea(graine + 83) * 0.28),
          rot: (alea(graine + 17) - 0.5) * 56,
          couche: L.cls,
          tige: L.tige,
          ordre: out.length
        });
      }
    }
    return out;
  }

  function courbeTige(b) {
    var cx = b.x + (TIE.x - b.x) * 0.5;
    var cy = b.y + (TIE.y - b.y) * 0.74;
    return 'M' + b.x.toFixed(1) + ',' + b.y.toFixed(1) +
           ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) +
           ' ' + TIE.x + ',' + TIE.y;
  }

  /* feuillage : brins courbes portant des feuilles orientées le long du brin */
  function feuillageSvg(f) {
    if (!f.feuille) return '';
    var d = f.feuille, out = '';
    var brins = 9;
    for (var i = 0; i < brins; i++) {
      var t = brins === 1 ? 0.5 : i / (brins - 1);
      var a = (184 + (356 - 184) * t) * Math.PI / 180;
      var px = 210 + 168 * Math.cos(a) + (alea(i + 200) - 0.5) * 14;
      var py = 258 + 116 * Math.sin(a) + (alea(i + 300) - 0.5) * 14;
      var cx = TIE.x + (px - TIE.x) * 0.42 + (alea(i + 400) - 0.5) * 40;
      var cy = TIE.y + (py - TIE.y) * 0.68;

      out += '<path d="M' + TIE.x + ',' + TIE.y + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) +
             ' ' + px.toFixed(1) + ',' + py.toFixed(1) + '" fill="none" stroke="' + d.t +
             '" stroke-width="1.5" stroke-linecap="round"/>';

      var ts = [0.38, 0.50, 0.61, 0.71, 0.80, 0.89, 0.97];
      for (var j = 0; j < ts.length; j++) {
        var u = ts[j], v = 1 - u;
        var lx = v * v * TIE.x + 2 * v * u * cx + u * u * px;
        var ly = v * v * TIE.y + 2 * v * u * cy + u * u * py;
        var tx = 2 * v * (cx - TIE.x) + 2 * u * (px - cx);
        var ty = 2 * v * (cy - TIE.y) + 2 * u * (py - cy);
        var ang = Math.atan2(ty, tx) * 180 / Math.PI + (j % 2 ? 34 : -34);
        var ech = 0.82 + u * 0.55;
        out += '<ellipse cx="0" cy="0" rx="' + (d.rx * ech).toFixed(1) + '" ry="' + (d.ry * ech).toFixed(1) +
               '" fill="' + d.c + '" transform="translate(' + lx.toFixed(1) + ',' + ly.toFixed(1) +
               ') rotate(' + ang.toFixed(1) + ')"/>';
      }
    }
    return out;
  }

  function emballageSvg(e) {
    return '' +
      '<ellipse cx="210" cy="500" rx="74" ry="9" fill="rgba(20,10,14,.10)"/>' +
      '<path d="M132,346 L288,346 L210,492 Z" fill="' + e.c + '"/>' +
      '<path d="M132,346 L210,492 L210,346 Z" fill="rgba(0,0,0,.055)"/>' +
      '<ellipse cx="210" cy="346" rx="78" ry="10" fill="' + e.ombre + '"/>' +
      '<ellipse cx="210" cy="348" rx="66" ry="7" fill="rgba(0,0,0,.15)"/>' +
      '<rect x="182" y="370" width="56" height="11" rx="5.5" fill="' + e.ruban + '"/>' +
      '<path d="M190,381 L184,398 L196,390 Z" fill="' + e.ruban + '" opacity=".8"/>' +
      '<path d="M230,381 L236,398 L224,390 Z" fill="' + e.ruban + '" opacity=".8"/>';
  }

  /* ---------- rendu ---------- */
  function rendu(hote, compo) {
    var d = calcul(compo);
    var blooms = positions(d.t.tiges);

    /* une tige sur trois porte la fleur d'accompagnement, réparties dans les 3 couches */
    var idxSec = {};
    if (d.nSec) {
      var pas = blooms.length / d.nSec;
      for (var k = 0; k < d.nSec; k++) idxSec[Math.floor(k * pas + pas / 2)] = true;
    }

    var tiges = '';
    for (var i = 0; i < blooms.length; i++) {
      tiges += '<path d="' + courbeTige(blooms[i]) + '" fill="none" stroke="var(--tige)" stroke-width="' +
               blooms[i].tige + '" stroke-linecap="round" opacity=".9"/>';
    }

    var html = '' +
      '<svg class="bq__arriere" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
        feuillageSvg(d.f) + tiges +
      '</svg>' +
      '<div class="bq__blooms">';

    for (var j = 0; j < blooms.length; j++) {
      var b = blooms[j];
      var fleur = idxSec[j] && d.s.photo ? d.s : d.p;
      html += '<span class="bloom bloom--' + b.couche + '"' +
        ' style="left:' + (b.x / W * 100).toFixed(2) + '%;' +
        'top:' + (b.y / H * 100).toFixed(2) + '%;' +
        'width:' + (b.taille / W * 100).toFixed(2) + '%;' +
        'aspect-ratio:1;' +
        '--r:' + b.rot.toFixed(1) + 'deg;' +
        '--d:' + (j * 26) + 'ms;' +
        'transform:translate(-50%,-50%) rotate(' + b.rot.toFixed(1) + 'deg);' +
        'background-image:url(' + photoUrl(fleur.photo) + ')"></span>';
    }

    html += '</div>' +
      '<svg class="bq__avant" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
        emballageSvg(d.e) +
      '</svg>';

    hote.innerHTML = html;
    return d;
  }

  /* ---------- lecture / écriture d'une composition ---------- */
  var DEFAUT = { p:'renoncule', s:'gypsophile', f:'eucalyptus', t:'moyen', w:'kraft' };

  function depuisUrl(recherche) {
    var q = new URLSearchParams(recherche || window.location.search);
    var c = {};
    ['p','s','f','t','w'].forEach(function (k) { c[k] = q.get(k) || DEFAUT[k]; });
    /* on valide chaque clé contre le catalogue */
    c.p = trouve(PRINCIPALES, c.p).id;
    c.s = trouve(SECONDAIRES, c.s).id;
    c.f = trouve(FEUILLAGES, c.f).id;
    c.t = trouve(TAILLES, c.t).id;
    c.w = trouve(EMBALLAGES, c.w).id;
    return c;
  }

  function versUrl(compo) {
    return 'p=' + compo.p + '&s=' + compo.s + '&f=' + compo.f + '&t=' + compo.t + '&w=' + compo.w;
  }

  function resume(compo) {
    var d = calcul(compo);
    var bouts = [
      'format ' + d.t.format + ', ' + d.t.tiges + ' tiges',
      d.p.nom.toLowerCase() + (d.s.photo ? ' et ' + d.s.nom.toLowerCase() : '')
    ];
    if (d.f.feuille) bouts.push(d.f.nom.toLowerCase());
    bouts.push(d.e.nom.toLowerCase());
    return bouts.join(', ');
  }

  return {
    PRINCIPALES:PRINCIPALES, SECONDAIRES:SECONDAIRES, FEUILLAGES:FEUILLAGES,
    TAILLES:TAILLES, EMBALLAGES:EMBALLAGES, DEFAUT:DEFAUT,
    trouve:trouve, photoUrl:photoUrl, calcul:calcul, rendu:rendu,
    euros:euros, eurosCourt:eurosCourt,
    depuisUrl:depuisUrl, versUrl:versUrl, resume:resume
  };
})();
