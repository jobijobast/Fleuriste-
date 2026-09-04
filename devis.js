/* =========================================================
   MAISON VERVEINE - demande de devis
   Estimation en direct, envoi par mailto, impression.
   Aucun serveur : rien ne quitte le navigateur tant que
   la personne n'envoie pas elle-même son message.
   ========================================================= */

(function () {
  'use strict';

  var form = document.getElementById('form');
  if (!form || !window.MV) return;

  var $ = function (id) { return document.getElementById(id); };

  var PRETS = [
    { id:'petitmardi', nom:'Le Petit Mardi',         prix:48  },
    { id:'renoncule',  nom:'Renoncule & Eucalyptus', prix:65  },
    { id:'blanc',      nom:'Blanc d’Hiver',          prix:92  },
    { id:'gerbe',      nom:'La Gerbe des Halles',    prix:130 }
  ];
  var LIVRAISON = { retrait:{ nom:'Retrait à l’atelier', prix:0 },
                    paris:  { nom:'Livraison Paris',     prix:8 },
                    pc:     { nom:'Livraison petite couronne', prix:18 } };

  var compo = MV.depuisUrl();
  var compoPrix = MV.calcul(compo).total;

  /* ---------- onglets ---------- */
  var ongB = $('ong-bouquet'), ongE = $('ong-event');
  var panB = $('pan-bouquet'), panE = $('pan-event');
  var mode = 'bouquet';

  function onglet(nouveau) {
    mode = nouveau;
    var b = mode === 'bouquet';
    ongB.setAttribute('aria-selected', b);
    ongE.setAttribute('aria-selected', !b);
    panB.hidden = !b;
    panE.hidden = b;
    estime();
  }
  ongB.addEventListener('click', function () { onglet('bouquet'); });
  ongE.addEventListener('click', function () { onglet('event'); });

  /* ---------- panneau bouquet ---------- */
  var sel = $('quel-bouquet');
  var apercu = $('apercu-compo');

  function remplitSelect() {
    var h = '<option value="compo">Ma composition sur mesure (' + MV.euros(compoPrix) + ')</option>';
    for (var i = 0; i < PRETS.length; i++) {
      h += '<option value="' + PRETS[i].id + '">' + PRETS[i].nom + ' (' + MV.euros(PRETS[i].prix) + ')</option>';
    }
    sel.innerHTML = h;
  }

  function majApercu() {
    var surMesure = sel.value === 'compo';
    apercu.style.display = surMesure ? 'flex' : 'none';
    $('aide-bouquet').textContent = surMesure
      ? 'Composition faite dans l’atelier en ligne. Vous pouvez encore la modifier.'
      : 'Un de nos bouquets de la semaine, monté le jour même.';
  }

  remplitSelect();
  MV.rendu($('bq-mini'), compo);
  $('legende-mini').innerHTML = MV.resume(compo).replace(/^./, function (c) { return c.toUpperCase(); });
  $('lien-modifier').setAttribute('href', 'atelier.html?' + MV.versUrl(compo));
  majApercu();

  sel.addEventListener('change', function () { majApercu(); estime(); });

  /* ---------- prestations événement ---------- */
  var lignesPresta = [].slice.call(document.querySelectorAll('.presta__l'));

  lignesPresta.forEach(function (l) {
    var c = l.querySelector('input[type="checkbox"]');
    c.addEventListener('change', function () {
      l.setAttribute('data-actif', c.checked ? '1' : '0');
      estime();
    });
    var qId = c.getAttribute('data-q');
    if (qId) $(qId).addEventListener('input', estime);
  });

  /* nombre de tables déduit du nombre d'invités, tant qu'on n'y a pas touché */
  var tablesTouchees = false;
  $('q-centres').addEventListener('input', function () { tablesTouchees = true; });
  $('e-invites').addEventListener('input', function () {
    if (tablesTouchees) return;
    var n = parseInt($('e-invites').value, 10);
    if (n > 0) $('q-centres').value = Math.max(1, Math.ceil(n / 8));
    estime();
  });

  /* ---------- estimation ---------- */
  function arrondi10(n) { return Math.round(n / 10) * 10; }

  function lignesBouquet() {
    var out = [];
    if (sel.value === 'compo') {
      out.push({ k:'Composition sur mesure', d:MV.resume(compo), v:compoPrix });
    } else {
      var p = PRETS.filter(function (x) { return x.id === sel.value; })[0];
      if (p) out.push({ k:p.nom, d:'Bouquet de la semaine', v:p.prix });
    }
    var liv = LIVRAISON[$('b-mode').value];
    if (liv && liv.prix) out.push({ k:liv.nom, d:'', v:liv.prix });
    return out;
  }

  function lignesEvent() {
    var out = [];
    lignesPresta.forEach(function (l) {
      var c = l.querySelector('input[type="checkbox"]');
      if (!c.checked) return;
      var prix = parseFloat(c.getAttribute('data-prix'));
      var qId = c.getAttribute('data-q');
      var q = qId ? Math.max(1, parseInt($(qId).value, 10) || 1) : 1;
      var nom = l.querySelector('.presta__n').childNodes[0].textContent.trim();
      out.push({ k:nom, d:qId ? q + ' × ' + MV.eurosCourt(prix) : '', v:prix * q });
    });
    var km = parseInt($('e-km').value, 10) || 0;
    if (km > 30) out.push({ k:'Déplacement', d:(km - 30) + ' km au-delà de 30 km', v:(km - 30) * 2.40 });
    return out;
  }

  function estime() {
    var lignes = mode === 'bouquet' ? lignesBouquet() : lignesEvent();
    var total = lignes.reduce(function (s, l) { return s + l.v; }, 0);

    var vide = $('estim-vide');
    var ul = $('estim-lignes');
    var out = $('fourchette');
    var note = $('estim-note');

    if (!lignes.length || total <= 0) {
      ul.innerHTML = '';
      out.textContent = '—';
      vide.hidden = false;
      note.textContent = mode === 'bouquet'
        ? 'Choisissez un bouquet pour voir le montant.'
        : 'Cochez les prestations qui vous intéressent.';
      return;
    }

    vide.hidden = true;
    ul.innerHTML = lignes.map(function (l) {
      return '<li><span>' + l.k + (l.d ? '<span class="presta__d">' + l.d + '</span>' : '') +
             '</span><span>' + MV.euros(l.v) + '</span></li>';
    }).join('');

    if (mode === 'bouquet') {
      out.textContent = MV.euros(total);
      note.textContent = 'Montant ferme pour un bouquet. Réglé au retrait ou à la livraison.';
    } else {
      var bas = arrondi10(total * 0.92), haut = arrondi10(total * 1.15);
      out.textContent = 'entre ' + MV.eurosCourt(bas) + ' et ' + MV.eurosCourt(haut);
      note.textContent = 'Fourchette indicative. Elle bouge avec la saison des fleurs et le lieu.';
    }
  }

  form.addEventListener('input', function (e) {
    if (e.target.closest('.estim')) return;
    estime();
  });

  /* ---------- validation ---------- */
  function erreur(champId, message) {
    var e = $('e-' + champId);
    var champ = $(champId) ? $(champId).closest('.champ') : null;
    if (e) e.textContent = message || '';
    if (champ) champ.classList.toggle('champ--ko', !!message);
    return !message;
  }

  function demain() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function valide() {
    var ok = true;

    ok = erreur('c-nom', $('c-nom').value.trim() ? '' : 'Indiquez votre nom, qu’on sache à qui répondre.') && ok;
    var mail = $('c-mail').value.trim();
    ok = erreur('c-mail', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail) ? '' : 'Cette adresse e-mail semble incomplète.') && ok;

    if (mode === 'bouquet') {
      var bd = $('b-date').value;
      ok = erreur('b-date', !bd ? 'Choisissez une date de livraison ou de retrait.'
                : (bd < demain() ? 'Il nous faut au moins un jour pour préparer le bouquet.' : '')) && ok;
    } else {
      var ed = $('e-date').value;
      ok = erreur('e-date', ed ? '' : 'Sans date, nous ne pouvons pas vérifier nos disponibilités.') && ok;
      var coche = lignesPresta.some(function (l) { return l.querySelector('input[type="checkbox"]').checked; });
      $('e-presta').textContent = coche ? '' : 'Cochez au moins une prestation.';
      ok = coche && ok;
    }
    return ok;
  }

  /* ---------- récapitulatif et envoi ---------- */
  function recap() {
    var l = [];
    l.push(mode === 'bouquet' ? 'DEMANDE POUR UN BOUQUET' : 'DEMANDE POUR UN ÉVÉNEMENT');
    l.push('');

    if (mode === 'bouquet') {
      var choix = sel.options[sel.selectedIndex].text;
      l.push('Bouquet : ' + choix);
      if (sel.value === 'compo') l.push('Composition : ' + MV.resume(compo));
      l.push('Date : ' + ($('b-date').value || 'non précisée'));
      l.push('Remise : ' + LIVRAISON[$('b-mode').value].nom);
      if ($('b-adresse').value.trim()) l.push('Adresse : ' + $('b-adresse').value.trim());
      if ($('b-carte').value.trim()) l.push('Carte : ' + $('b-carte').value.trim());
    } else {
      l.push('Type : ' + $('e-type').value);
      l.push('Date : ' + ($('e-date').value || 'non précisée'));
      l.push('Invités : ' + ($('e-invites').value || '?'));
      if ($('e-lieu').value.trim()) l.push('Lieu : ' + $('e-lieu').value.trim());
      var km = parseInt($('e-km').value, 10) || 0;
      if (km) l.push('Distance depuis Paris : ' + km + ' km');
    }

    l.push('');
    l.push('DÉTAIL');
    var lignes = mode === 'bouquet' ? lignesBouquet() : lignesEvent();
    var total = 0;
    lignes.forEach(function (x) {
      total += x.v;
      l.push('- ' + x.k + (x.d ? ' (' + x.d + ')' : '') + ' : ' + MV.euros(x.v));
    });
    l.push('');
    l.push(mode === 'bouquet'
      ? 'Total : ' + MV.euros(total)
      : 'Estimation : entre ' + MV.eurosCourt(arrondi10(total * 0.92)) + ' et ' + MV.eurosCourt(arrondi10(total * 1.15)));

    l.push('');
    l.push('CONTACT');
    l.push($('c-nom').value.trim() + ' · ' + $('c-mail').value.trim() +
           ($('c-tel').value.trim() ? ' · ' + $('c-tel').value.trim() : ''));
    if ($('c-source').value) l.push('Nous a connus par : ' + $('c-source').value);
    if ($('c-mot').value.trim()) { l.push(''); l.push('MESSAGE'); l.push($('c-mot').value.trim()); }

    return l.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valide()) {
      var ko = form.querySelector('.champ--ko input, .champ--ko select');
      if (ko) ko.focus();
      return;
    }
    var texte = recap();
    var sujet = mode === 'bouquet'
      ? 'Demande de bouquet · ' + $('c-nom').value.trim()
      : 'Demande de devis ' + $('e-type').value.toLowerCase() + ' · ' + $('c-nom').value.trim();

    var ok = $('envoi-ok');
    ok.hidden = false;
    ok.innerHTML = '<b>Votre demande est prête.</b><br>Votre logiciel de messagerie vient de s’ouvrir avec le récapitulatif. ' +
      'S’il ne s’ouvre pas, copiez le texte ci-dessous et envoyez-le à bonjour@maisonverveine.fr.' +
      '<textarea readonly style="margin-top:12px;width:100%;min-height:150px;font:inherit;font-size:12.5px;' +
      'border:1px solid rgba(14,14,14,.18);border-radius:8px;padding:10px"></textarea>';
    ok.querySelector('textarea').value = texte;

    window.location.href = 'mailto:bonjour@maisonverveine.fr' +
      '?subject=' + encodeURIComponent(sujet) +
      '&body=' + encodeURIComponent(texte);
  });

  $('imprimer').addEventListener('click', function () { window.print(); });

  /* ---------- démarrage ---------- */
  var q = new URLSearchParams(window.location.search);
  if (q.get('mode') === 'event') onglet('event');
  $('b-date').setAttribute('min', demain());
  $('e-date').setAttribute('min', demain());
  estime();
})();
