/* =========================================================
   MAISON VERVEINE - le conseiller floral

   Chat libre. Aucune réponse écrite d'avance : tout ce que le
   conseiller dit vient du modèle, via /api/chat.

   La clé d'API et le prompt système vivent dans proxy.py, côté
   serveur. Le navigateur ne les voit jamais. Écrire le périmètre
   ici ne servirait à rien : n'importe qui peut réécrire ce
   fichier depuis la console de son navigateur.

   Sans proxy (ouverture du fichier en local, ou hébergement
   statique type GitHub Pages), il n'y a pas de modèle à
   interroger : le widget le dit et renvoie vers l'atelier.
   ========================================================= */

(function () {
  'use strict';

  var AVATAR = 'https://images.unsplash.com/photo-1541166227079-140bd2c23b03?w=120&h=120&fit=crop&q=70&auto=format';
  var MAX_HISTOIRE = 14;

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var enLigne = false;
  var occupe = false;
  var histoire = [];
  var racine, bouton, fil, saisie, champ, envoiBtn, sousTitre, ouvertPar;

  /* =========================================================
     Widget
     ========================================================= */
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
        '<span class="cbt__id"><b>Le conseiller floral</b>' +
          '<span id="cbt-sous">Fleurs et boutique uniquement</span></span>' +
        '<button class="cbt__x" type="button" aria-label="Fermer le conseiller">&times;</button>' +
      '</div>' +
      '<div class="cbt__fil" id="cbt-fil" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="cbt__bas">' +
        '<form class="cbt__saisie" id="cbt-saisie">' +
          '<input type="text" id="cbt-txt" autocomplete="off" maxlength="500" ' +
                 'placeholder="Votre question…" aria-label="Votre question">' +
          '<button type="submit" aria-label="Envoyer la question">' +
            '<span aria-hidden="true">&rarr;</span></button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(racine);

    fil = racine.querySelector('#cbt-fil');
    saisie = racine.querySelector('#cbt-saisie');
    champ = racine.querySelector('#cbt-txt');
    envoiBtn = saisie.querySelector('button');
    sousTitre = racine.querySelector('#cbt-sous');

    bouton.addEventListener('click', ouvre);
    racine.querySelector('.cbt__x').addEventListener('click', ferme);
    saisie.addEventListener('submit', envoie);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !racine.hidden) ferme();
    });

    verrouille(true);
    sonde();
  }

  /* Le proxy tourne-t-il, et avec une clé ? */
  function sonde() {
    if (!window.fetch) { horsLigne(); return; }
    fetch('/api/etat')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.ia) {
          enLigne = true;
          verrouille(false);
        } else {
          horsLigne();
        }
      })
      .catch(horsLigne);
  }

  function horsLigne() {
    enLigne = false;
    verrouille(true);
    champ.placeholder = 'Conseiller indisponible';
    sousTitre.textContent = 'Hors ligne';
  }

  function ouvre() {
    ouvertPar = document.activeElement;
    racine.hidden = false;
    bouton.hidden = true;
    bouton.setAttribute('aria-expanded', 'true');
    if (!fil.childNodes.length) accueil();
    if (enLigne && !occupe) champ.focus();
  }

  function ferme() {
    racine.hidden = true;
    bouton.hidden = false;
    bouton.setAttribute('aria-expanded', 'false');
    (ouvertPar || bouton).focus();
  }

  /* Une seule phrase fixe : une invitation à écrire, pas une réponse. */
  function accueil() {
    if (enLigne) {
      bulle('Bonjour. Posez-moi vos questions sur nos fleurs, nos bouquets ou la boutique.', 'elle');
    } else {
      bulle('Le conseiller n’est pas joignable depuis cette page. ' +
            'Vous pouvez composer votre bouquet dans <a href="atelier.html">l’atelier</a> ' +
            'ou écrire à <b>bonjour@maisonverveine.fr</b>.', 'elle');
    }
  }

  /* =========================================================
     Messages
     ========================================================= */
  function versLeBas() {
    requestAnimationFrame(function () { fil.scrollTop = fil.scrollHeight; });
    setTimeout(function () { fil.scrollTop = fil.scrollHeight; }, 380);
  }

  /* nos propres textes : ils contiennent du balisage qu'on maîtrise */
  function bulle(html, qui) {
    var d = document.createElement('div');
    d.className = 'cbt__m cbt__m--' + qui;
    d.innerHTML = html;
    fil.appendChild(d);
    versLeBas();
    return d;
  }

  /* texte saisi et texte du modèle : jamais d'innerHTML.
     Une réponse contenant du balisage deviendrait une faille XSS. */
  function bulleTexte(texte, qui) {
    var d = document.createElement('div');
    d.className = 'cbt__m cbt__m--' + qui;
    d.textContent = texte;
    fil.appendChild(d);
    versLeBas();
    return d;
  }

  function pointsDeSuspension() {
    var d = document.createElement('div');
    d.className = 'cbt__m cbt__m--elle cbt__ecrit';
    d.innerHTML = '<span></span><span></span><span></span>';
    if (reduit) d.textContent = '…';
    fil.appendChild(d);
    versLeBas();
    return d;
  }

  function verrouille(v) {
    occupe = v;
    champ.disabled = v;
    envoiBtn.disabled = v;
  }

  /* =========================================================
     Envoi
     ========================================================= */
  function envoie(e) {
    e.preventDefault();
    var texte = champ.value.trim();
    if (!texte || occupe || !enLigne) return;

    champ.value = '';
    bulleTexte(texte, 'moi');
    histoire.push({ role:'user', content:texte });
    verrouille(true);

    var points = pointsDeSuspension();

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: histoire.slice(-MAX_HISTOIRE) })
    })
      .then(function (r) {
        return r.json()
          .catch(function () { return {}; })
          .then(function (d) { return { ok:r.ok, d:d }; });
      })
      .then(function (res) {
        points.remove();
        if (res.ok && res.d && res.d.reponse) {
          bulleTexte(res.d.reponse, 'elle');
          histoire.push({ role:'assistant', content:res.d.reponse });
        } else {
          /* la réponse ratée ne reste pas dans le fil : sinon le modèle
             recevrait une question orpheline au tour suivant */
          histoire.pop();
          echec();
        }
      })
      .catch(function () {
        points.remove();
        histoire.pop();
        echec();
      })
      .then(function () {
        verrouille(!enLigne);
        if (enLigne) champ.focus();
      });
  }

  function echec() {
    bulle('Je n’arrive pas à joindre l’atelier pour le moment. Réessayez dans un instant, ' +
          'ou écrivez à <b>bonjour@maisonverveine.fr</b>.', 'elle');
  }

  /* =========================================================
     Démarrage
     ========================================================= */
  if (document.body) monte();
  else document.addEventListener('DOMContentLoaded', monte);
})();
