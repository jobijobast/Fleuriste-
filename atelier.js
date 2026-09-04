/* =========================================================
   MAISON VERVEINE - composeur de bouquet
   ========================================================= */

(function () {
  'use strict';

  var hote = document.getElementById('bq');
  if (!hote || !window.MV) return;

  var compo   = MV.depuisUrl();
  var elCompo = document.getElementById('compo');
  var elEtapes= document.getElementById('etapes');
  var elTotal = document.getElementById('total');
  var elDetail= document.getElementById('detail');
  var elLeg   = document.getElementById('legende');
  var elDevis = document.getElementById('vers-devis');

  /* ---------- construction des étapes ---------- */

  function opt(cle, item, pastille, sousTitre) {
    var id = 'o-' + cle + '-' + item.id;
    var coche = compo[cle] === item.id ? ' checked' : '';
    return '<div class="opt">' +
      '<input type="radio" name="' + cle + '" id="' + id + '" value="' + item.id + '"' + coche + '>' +
      '<label for="' + id + '">' + pastille +
        '<span class="nom">' + item.nom + '</span>' +
        '<span class="prix">' + sousTitre + '</span>' +
      '</label></div>';
  }

  function prixSuffixe(item, unite) {
    if (!item.prix) return unite || '—';
    return MV.euros(item.prix) + (unite ? ' ' + unite : '');
  }

  function pastillePhoto(item) {
    if (!item.photo) return '<span class="pastille pastille--uni pastille--txt">aucune</span>';
    return '<span class="pastille" style="background-image:url(' + MV.photoUrl(item.photo) + ')"></span>';
  }

  function pastilleFeuille(item) {
    if (!item.feuille) return '<span class="pastille pastille--uni pastille--txt">aucun</span>';
    return '<span class="pastille pastille--uni" style="background:' + item.feuille.c + '"></span>';
  }

  function pastilleEmballage(item) {
    return '<span class="pastille pastille--uni" style="background:' + item.c + '"></span>';
  }

  function pastilleTaille(item) {
    return '<span class="pastille pastille--uni pastille--txt">' + item.tiges + '</span>';
  }

  function grille(cle, liste, rendrePastille, sousTitre, classe) {
    var h = '<div class="choix' + (classe ? ' ' + classe : '') + '">';
    for (var i = 0; i < liste.length; i++) {
      h += opt(cle, liste[i], rendrePastille(liste[i]), sousTitre(liste[i]));
    }
    return h + '</div>';
  }

  function etape(n, titre, aide, corps) {
    return '<section class="etape-c">' +
      '<div class="etape-c__t"><h2>' + titre + '</h2><span class="etape-c__n">(0' + n + ')</span></div>' +
      '<p class="etape-c__aide">' + aide + '</p>' +
      '<fieldset><legend class="sr">' + titre + '</legend>' + corps + '</fieldset>' +
      '</section>';
  }

  function construit() {
    elEtapes.innerHTML =
      etape(1, 'La fleur principale',
        'Elle donne le ton et représente les deux tiers du bouquet.',
        grille('p', MV.PRINCIPALES, pastillePhoto, function (f) { return MV.euros(f.prix) + ' / tige'; })) +

      etape(2, 'L’accompagnement',
        'Un tiers des tiges, pour donner du relief. Facultatif.',
        grille('s', MV.SECONDAIRES, pastillePhoto, function (f) {
          return f.photo ? MV.euros(f.prix) + ' / tige' : 'Bouquet mono-fleur';
        })) +

      etape(3, 'Le feuillage',
        'Vendu à la botte, il structure le bouquet et le fait tenir.',
        grille('f', MV.FEUILLAGES, pastilleFeuille, function (f) {
          return f.prix ? MV.euros(f.prix) + ' / botte' : '—';
        }, 'choix--4')) +

      etape(4, 'Taille et emballage',
        'Le nombre de tiges, puis la façon dont on le ferme.',
        grille('t', MV.TAILLES, pastilleTaille, function (t) { return t.tiges + ' tiges'; }) +
        '<p class="etape-c__aide" style="margin:22px 0 14px">Emballage</p>' +
        grille('w', MV.EMBALLAGES, pastilleEmballage, function (e) {
          return e.prix ? '+ ' + MV.euros(e.prix) : 'Compris';
        }, 'choix--4'));
  }

  /* ---------- mise à jour ---------- */

  function majUrl() {
    var q = '?' + MV.versUrl(compo);
    if (window.history && history.replaceState) {
      history.replaceState(null, '', window.location.pathname + q);
    }
    elDevis.setAttribute('href', 'devis.html' + q);
  }

  function maj() {
    var d = MV.rendu(hote, compo);

    elTotal.textContent = MV.euros(d.total);

    var li = '';
    for (var i = 0; i < d.lignes.length; i++) {
      li += '<li><span>' + d.lignes[i].k + '</span><span>' + MV.euros(d.lignes[i].v) + '</span></li>';
    }
    elDetail.innerHTML = li;

    var bouts = ['<b>' + d.t.tiges + ' tiges</b>', d.p.nom];
    if (d.s.photo) bouts.push(d.s.nom);
    if (d.f.feuille) bouts.push(d.f.nom);
    bouts.push(d.e.nom);
    elLeg.innerHTML = bouts.join('<span aria-hidden="true">·</span>');

    majUrl();
  }

  /* ---------- interactions ---------- */

  elEtapes.addEventListener('change', function (e) {
    var cible = e.target;
    if (cible.tagName !== 'INPUT' || cible.type !== 'radio') return;
    if (!(cible.name in compo)) return;
    compo[cible.name] = cible.value;
    maj();
  });

  document.getElementById('reset').addEventListener('click', function () {
    compo = { p:MV.DEFAUT.p, s:MV.DEFAUT.s, f:MV.DEFAUT.f, t:MV.DEFAUT.t, w:MV.DEFAUT.w };
    construit();
    maj();
    elEtapes.scrollIntoView({ block: 'start' });
  });

  /* ---------- démarrage ---------- */
  construit();
  elCompo.hidden = false;
  maj();
})();
