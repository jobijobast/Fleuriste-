/* Maison Verveine
   Aucun écouteur de scroll : IntersectionObserver uniquement.
   Le contenu reste entièrement lisible si ce fichier ne se charge pas. */

(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Entrée du hero : le titre monte ligne par ligne ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var lignes = hero.querySelectorAll('.hero__title .line > span');
    for (var i = 0; i < lignes.length; i++) {
      lignes[i].style.setProperty('--d', (i * 90 + 120) + 'ms');
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('in'); });
    });
  }

  /* ---------- 1 bis. Vidéo du hero ----------
     On ne met pas l'attribut autoplay dans le HTML : sous
     prefers-reduced-motion la vidéo doit rester figée sur son
     affiche. On lance la lecture ici, seulement si le mouvement
     est accepté, et on laisse le poster si le navigateur refuse. */
  var video = document.getElementById('hero-video');
  if (video && !calme) {
    /* La lecture automatique échoue pour des raisons qu'on ne maîtrise pas
       depuis la page : média pas encore prêt, onglet ouvert en arrière-plan,
       politique du navigateur. Plutôt qu'un seul essai, on retente à chaque
       occasion crédible et on s'arrête dès que ça tourne. */
    var evenements = ['loadeddata', 'canplay', 'canplaythrough'];
    var gestes = ['pointerdown', 'keydown', 'scroll'];

    var arrete = function () {
      evenements.forEach(function (e) { video.removeEventListener(e, essaie); });
      gestes.forEach(function (e) { document.removeEventListener(e, essaie); });
      document.removeEventListener('visibilitychange', essaie);
    };

    function essaie() {
      if (!video.paused) { arrete(); return; }
      var p = video.play();
      if (p && p.then) {
        p.then(arrete).catch(function (err) {
          /* on garde une trace : une panne silencieuse est indébogable */
          if (window.console) console.warn('Hero : lecture refusée (' + err.name + ')');
        });
      }
    }

    essaie();
    evenements.forEach(function (e) { video.addEventListener(e, essaie); });
    gestes.forEach(function (e) { document.addEventListener(e, essaie, { passive: true }); });
    document.addEventListener('visibilitychange', essaie);
  }

  /* ---------- 2. Révélations au scroll, décalées par groupe ---------- */
  var aReveler = document.querySelectorAll('.reveal');

  if (calme || !('IntersectionObserver' in window)) {
    for (var j = 0; j < aReveler.length; j++) aReveler[j].classList.add('in');
  } else {
    var vu = new IntersectionObserver(function (entrees) {
      var rang = 0;
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', (rang * 70) + 'ms');
        e.target.classList.add('in');
        vu.unobserve(e.target);
        rang++;
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (var k = 0; k < aReveler.length; k++) vu.observe(aReveler[k]);
  }

  /* ---------- 3. Navigation : fond blanc une fois le hero passé ---------- */
  var nav = document.getElementById('nav');
  var sentinelle = document.getElementById('sentinel');

  if (nav && sentinelle && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) {
      nav.classList.toggle('is-stuck', !entrees[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinelle);
  }

  /* ---------- 4. Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu-mobile');

  function fermerMenu() {
    if (!menu || !burger) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var ouvert = burger.getAttribute('aria-expanded') === 'true';
      if (ouvert) {
        fermerMenu();
      } else {
        menu.hidden = false;
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') fermerMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerMenu();
    });
  }

  /* ---------- 5. Défilé des avis : on double le contenu pour boucler ---------- */
  var piste = document.getElementById('marquee');
  if (piste && !calme) {
    var copie = piste.innerHTML;
    piste.insertAdjacentHTML('beforeend', copie);
    var doubles = piste.querySelectorAll('.avis');
    for (var m = doubles.length / 2; m < doubles.length; m++) {
      doubles[m].setAttribute('aria-hidden', 'true');
    }
  }
})();
