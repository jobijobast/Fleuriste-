/* =========================================================
   MAISON VERVEINE - le conseiller floral
   Guide de choix entièrement local : trois questions, une
   recommandation, deux actions réelles. Aucune requête
   réseau, aucune clé d'API, rien n'est envoyé nulle part.
   ========================================================= */

(function () {
  'use strict';

  var AVATAR = 'https://images.unsplash.com/photo-1541166227079-140bd2c23b03?w=120&h=120&fit=crop&q=70&auto=format';

  var OCCASIONS = [
    { id:'mariage', l:'Un mariage' },
    { id:'anniv',   l:'Un anniversaire' },
    { id:'merci',   l:'Dire merci' },
    { id:'deuil',   l:'Un deuil' },
    { id:'offrir',  l:'Juste pour offrir' },
    { id:'pro',     l:'Un événement pro' }
  ];
  var AMBIANCES = [
    { id:'douce',   l:'Douce et pâle' },
    { id:'coloree', l:'Colorée' },
    { id:'blanche', l:'Blanche et graphique' },
    { id:'sauvage', l:'Sauvage, champêtre' }
  ];
  var BUDGETS = [
    { id:'a', l:'Moins de 50 €' },
    { id:'b', l:'50 à 90 €' },
    { id:'c', l:'90 à 150 €' },
    { id:'d', l:'Plus de 150 €' }
  ];

  var BASE = {
    douce:   { p:'renoncule',  s:'gypsophile', f:'eucalyptus' },
    coloree: { p:'tulipe',     s:'dahlia',     f:'fougere' },
    blanche: { p:'anemone',    s:'renonculeb', f:'ruscus' },
    sauvage: { p:'lisianthus', s:'gypsophile', f:'fougere' }
  };
  var TAILLE = { a:{ t:'petit', w:'kraft' }, b:{ t:'moyen', w:'creme' },
                 c:{ t:'grand', w:'creme' }, d:{ t:'grand', w:'lin' } };

  var PRET = {
    a:{ nom:'Le Petit Mardi', prix:'48 €' },
    b:{ nom:'Renoncule & Eucalyptus', prix:'65 €' },
    c:{ nom:'Blanc d’Hiver', prix:'92 €' },
    d:{ nom:'La Gerbe des Halles', prix:'130 €' }
  };

  var INTRO = {
    mariage:'Pour un mariage, un seul bouquet suffit rarement, mais voilà une base solide.',
    anniv:  'Pour un anniversaire, on peut se permettre un peu de gaieté.',
    merci:  'Pour dire merci, mieux vaut quelque chose de simple et bien fait.',
    deuil:  'Sobre, sans effet, sans parfum trop fort : c’est ce qui convient le mieux.',
    offrir: 'Offrir sans occasion, c’est la meilleure raison.',
    pro:    'Pour un événement professionnel, il faut que ça tienne la soirée et que ça passe en photo.'
  };

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var etat = { occasion:null, ambiance:null, budget:null };
  var etape = 0;
  var racine, bouton, fil, bas, ouvertPar;

  /* ---------- construction du widget ---------- */
  function monte() {
    bouton = document.createElement('button');
    bouton.className = 'cbt-btn';
    bouton.type = 'button';
    bouton.setAttribute('aria-expanded', 'false');
    bouton.innerHTML = '<i aria-hidden="true"></i>Besoin d’un conseil&nbsp;?';
    document.body.appendChild(bouton);

    racine = document.createElement('div');
    racine.className = 'cbt';
    racine.hidden = true;
    racine.setAttribute('role', 'dialog');
    racine.setAttribute('aria-label', 'Conseiller floral');
    racine.innerHTML =
      '<div class="cbt__top">' +
        '<span class="cbt__av" style="background-image:url(' + AVATAR + ')"></span>' +
        '<span class="cbt__id"><b>Le conseiller floral</b><span>Réponses préparées par l’atelier</span></span>' +
        '<button class="cbt__x" type="button" aria-label="Fermer le conseiller">&times;</button>' +
      '</div>' +
      '<div class="cbt__fil" id="cbt-fil" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="cbt__bas"><div class="cbt__ch" id="cbt-ch"></div></div>';
    document.body.appendChild(racine);

    fil = racine.querySelector('#cbt-fil');
    bas = racine.querySelector('#cbt-ch');

    bouton.addEventListener('click', ouvre);
    racine.querySelector('.cbt__x').addEventListener('click', ferme);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !racine.hidden) ferme();
    });
  }

  function ouvre() {
    ouvertPar = document.activeElement;
    racine.hidden = false;
    bouton.hidden = true;
    bouton.setAttribute('aria-expanded', 'true');
    if (!fil.childNodes.length) demarre();
    else focusChoix();
  }

  function ferme() {
    racine.hidden = true;
    bouton.hidden = false;
    bouton.setAttribute('aria-expanded', 'false');
    (ouvertPar || bouton).focus();
  }

  /* ---------- messages ---------- */
  /* le fil défile en smooth : on repousse en bas sur deux temps,
     sinon un ajout rapide interrompt le défilement précédent */
  function versLeBas() {
    requestAnimationFrame(function () { fil.scrollTop = fil.scrollHeight; });
    setTimeout(function () { fil.scrollTop = fil.scrollHeight; }, 380);
  }

  function bulle(texte, qui) {
    var d = document.createElement('div');
    d.className = 'cbt__m cbt__m--' + qui;
    d.innerHTML = texte;
    fil.appendChild(d);
    versLeBas();
    return d;
  }

  function ecrit(suite) {
    if (reduit) { suite(); return; }
    var d = document.createElement('div');
    d.className = 'cbt__m cbt__m--elle cbt__ecrit';
    d.innerHTML = '<span></span><span></span><span></span>';
    fil.appendChild(d);
    versLeBas();
    setTimeout(function () { d.remove(); suite(); }, 620);
  }

  function choix(liste, rose) {
    bas.innerHTML = '';
    liste.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.l;
      if (rose && c.rose) b.className = 'est-rose';
      if (c.href) {
        b.addEventListener('click', function () { window.location.href = c.href; });
      } else {
        b.addEventListener('click', function () { repond(c); });
      }
      bas.appendChild(b);
    });
    focusChoix();
  }

  function focusChoix() {
    var p = bas.querySelector('button');
    if (p) p.focus();
  }

  /* ---------- déroulé ---------- */
  function demarre() {
    etape = 0;
    etat = { occasion:null, ambiance:null, budget:null };
    fil.innerHTML = '';
    bulle('Bonjour. Je vous aide à choisir en trois questions, puis je vous laisse la main.', 'elle');
    ecrit(function () {
      bulle('C’est pour quelle occasion&nbsp;?', 'elle');
      choix(OCCASIONS);
    });
  }

  function repond(c) {
    bulle(c.l, 'moi');
    bas.innerHTML = '';

    if (etape === 0) {
      etat.occasion = c.id;
      etape = 1;
      ecrit(function () {
        if (c.id === 'deuil') {
          etat.ambiance = 'blanche';
          etape = 2;
          bulle('Nous restons sur du blanc, c’est ce qui convient le mieux. Quel budget avez-vous en tête&nbsp;?', 'elle');
          choix(BUDGETS);
        } else {
          bulle('Quelle ambiance vous ressemble&nbsp;?', 'elle');
          choix(AMBIANCES);
        }
      });
      return;
    }

    if (etape === 1) {
      etat.ambiance = c.id;
      etape = 2;
      ecrit(function () {
        bulle('Et quel budget avez-vous en tête&nbsp;?', 'elle');
        choix(BUDGETS);
      });
      return;
    }

    if (etape === 2) {
      etat.budget = c.id;
      etape = 3;
      ecrit(conclut);
    }
  }

  function conclut() {
    var base = BASE[etat.ambiance] || BASE.douce;
    var fin = TAILLE[etat.budget] || TAILLE.b;
    var compo = { p:base.p, s:base.s, f:base.f, t:fin.t, w:fin.w };
    if (etat.budget === 'd') compo.p = 'pivoine';

    var phrase = INTRO[etat.occasion] || '';
    var prix = '';

    if (window.MV) {
      var d = MV.calcul(compo);
      phrase += ' Je partirais sur ' + d.p.phrase;
      if (d.s.phrase) phrase += ' avec ' + d.s.phrase;
      if (d.f.phrase) phrase += ' et ' + d.f.phrase;
      phrase += ', en format ' + d.t.format + ', emballé en ' + d.e.nom.toLowerCase() + '.';
      prix = ' Autour de <b>' + MV.euros(d.total) + '</b>.';
    } else {
      phrase += ' Je partirais sur une composition ' + (etat.ambiance === 'blanche' ? 'blanche' : 'de saison') + '.';
    }

    bulle(phrase + prix, 'elle');

    ecrit(function () {
      var pret = PRET[etat.budget];
      bulle('Vous pouvez la reprendre telle quelle dans l’atelier, ou partir de <b>' + pret.nom +
            '</b> (' + pret.prix + '), déjà monté.', 'elle');

      var actions = [
        { l:'Ouvrir dans l’atelier', rose:true, href:'atelier.html?' + (window.MV ? MV.versUrl(compo) : '') },
        { l:'Voir ' + pret.nom, href:'index.html#bouquets' }
      ];
      if (etat.occasion === 'mariage' || etat.occasion === 'pro') {
        actions.push({ l:'Demander un devis', href:'devis.html?mode=event' });
      }
      actions.push({ l:'Recommencer', id:'reset' });

      choix(actions.map(function (a) {
        if (a.id === 'reset') return { l:a.l, reset:true };
        return a;
      }), true);

      /* le bouton Recommencer n'a pas de lien : on le rebranche */
      var dernier = bas.lastChild;
      if (dernier) {
        var neuf = dernier.cloneNode(true);
        dernier.replaceWith(neuf);
        neuf.addEventListener('click', demarre);
      }
    });
  }

  /* ---------- démarrage ---------- */
  if (document.body) monte();
  else document.addEventListener('DOMContentLoaded', monte);
})();
