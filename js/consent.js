/* ============================================================
   Consentement cookies (RGPD / CNIL) + chargement de Google Analytics
   ------------------------------------------------------------
   Google Analytics n'est chargé QUE si le visiteur a explicitement
   accepté. Tant qu'aucun choix n'est fait, aucun script GA, aucun
   cookie de mesure. « Accepter » et « Refuser » sont à égalité.
   Le choix est mémorisé (localStorage) et modifiable à tout moment
   via un lien « Gérer les cookies » (attribut data-cookie-settings).
   ============================================================ */
(function () {
  'use strict';

  var GA_ID = 'G-MJ13MDPH4G';
  var KEY = 'tbc_cookie_consent';   // valeurs : 'granted' | 'denied'

  /* ---------- Chargement de Google Analytics (après consentement) ---------- */
  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  /* Supprime les cookies GA existants (en cas de refus ou de retrait). */
  function deleteGACookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = [location.hostname, '.' + location.hostname, host, '.' + host];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name === '_gat') {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
        });
      }
    });
  }

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* ignore */ } }

  /* ---------- Bandeau ---------- */
  function buildBanner() {
    var wrap = document.createElement('div');
    wrap.className = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Gestion des cookies');
    wrap.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__text">Nous utilisons des cookies de mesure d’audience pour comprendre la fréquentation du site et l’améliorer. Vous pouvez les accepter ou les refuser. En savoir plus dans notre <a href="politique-confidentialite.html">politique de confidentialité</a>.</p>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="cookie-btn cookie-btn--refuse" data-cc="refuse">Refuser</button>' +
          '<button type="button" class="cookie-btn cookie-btn--accept" data-cc="accept">Accepter</button>' +
        '</div>' +
      '</div>';

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cc]');
      if (!b) return;
      if (b.getAttribute('data-cc') === 'accept') {
        setChoice('granted');
        loadGA();
      } else {
        setChoice('denied');
        deleteGACookies();
      }
      wrap.classList.remove('is-visible');
      setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 300);
    });

    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('is-visible'); });
  }

  function openBanner() {
    if (!document.querySelector('.cookie-banner')) buildBanner();
  }

  /* ---------- Initialisation ---------- */
  var choice = getChoice();
  if (choice === 'granted') {
    loadGA();                 // consentement déjà donné : on charge GA
  } else if (choice !== 'denied') {
    openBanner();             // aucun choix encore : on demande
  }
  // (choice === 'denied' : on ne fait rien)

  /* Lien « Gérer les cookies » (pied de page) : rouvre le bandeau. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-cookie-settings]');
    if (link) { e.preventDefault(); openBanner(); }
  });
})();
