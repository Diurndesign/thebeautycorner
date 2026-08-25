/* ============================================================
   THE BEAUTY CORNER by Alex — Interactions maquette
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Rechargement : rester en haut (ne pas sauter vers une ancre restée dans l'URL) ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (window.location.hash) {
    const _root = document.documentElement;
    const _prevBehavior = _root.style.scrollBehavior;
    _root.style.scrollBehavior = 'auto';            // annule le défilement doux le temps de remettre en haut
    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
    requestAnimationFrame(function () { _root.style.scrollBehavior = _prevBehavior; });
  }

  /* ---------- Menu mobile (burger) ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
    });

    // Refermer le menu au clic sur un lien
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Header : fond sombre au scroll + logo qui apparaît ---------- */
  const header = document.getElementById('header');
  const headerLogo = document.getElementById('headerLogo');
  function updateHeader() {
    const y = window.scrollY;
    if (y > 80) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    if (headerLogo) {
      // Apparition progressive du logo entre 40 px et 220 px de scroll
      const p = Math.max(0, Math.min(1, (y - 40) / 180));
      headerLogo.style.opacity = p;
      headerLogo.style.transform = 'translateY(' + ((1 - p) * -6).toFixed(1) + 'px) scale(' + (0.85 + 0.15 * p).toFixed(3) + ')';
      headerLogo.style.pointerEvents = p > 0.05 ? 'auto' : 'none';
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Clic sur le logo → retour en haut du site (défilement doux)
  if (headerLogo) {
    headerLogo.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Apparition des sections au scroll ---------- */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    const sel = '.section-head, .about-grid, .prestations-grid, .experience-card, .ba-tabs, .ba-slider, .testimonials-content, .ig-feed, .giftcard-inner, .faq-list, .contact-grid';
    const els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!els.length) return;
    els.forEach(function (el) { el.classList.add('reveal'); });
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Rendu des prestations (données éditées via l'admin, stockées
     dans Supabase ; repli sur data/content.json — voir loadContent). ---------- */
  function renderPrestations(data, planity) {
    const prestaGrid = document.getElementById('prestationsGrid');
    if (!prestaGrid || !data || !data.length) return;
    prestaGrid.innerHTML = '';   // rendu idempotent : on repart d'une grille vide

    // Clic sur une prestation : ouvre le modal des formules si elles existent,
    // sinon renvoie directement sur Planity (dégradation propre).
    function openAction(item) {
      if ((item.formules && item.formules.length) || item.detail) openPrestaModal(item, planity);
      else window.open(item.bookHref || planity, '_blank', 'noopener');
    }

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Sert une version redimensionnée + recompressée via la transformation
    // d'image Supabase (bien plus légère que l'original). Renvoie null si l'URL
    // n'est pas une image publique Supabase ; l'<img> retombe alors sur l'original.
    function optimizedUrl(url, w) {
      const marker = '/storage/v1/object/public/';
      if (typeof url !== 'string' || url.indexOf(marker) === -1) return null;
      return url.replace(marker, '/storage/v1/render/image/public/') + '?width=' + w + '&quality=65';
    }

    data.forEach(function (item, i) {
      const hasFormules = !!(item.formules && item.formules.length);
      const btnLabel = item.cardLabel || (hasFormules ? 'Voir les formules' : 'Réserver');
      const art = document.createElement('article');
      art.className = 'presta-cell';
      art.innerHTML =
        '<div class="presta-cell-inner">' +
          '<span class="presta-num">' + ('0' + (i + 1)).slice(-2) + '</span>' +
          '<div class="presta-cell-head">' +
            '<h3 class="presta-name"></h3>' +
            '<p class="presta-desc"></p>' +
            '<p class="presta-price"></p>' +
          '</div>' +
          '<button class="presta-reserve" type="button">' + btnLabel + ' <span aria-hidden="true">→</span></button>' +
        '</div>';
      art.querySelector('.presta-name').textContent = item.nom || '';
      art.querySelector('.presta-desc').textContent = item.description || '';
      const priceEl = art.querySelector('.presta-price');
      if (item.prix) priceEl.textContent = item.prix; else priceEl.style.display = 'none';

      // Image de survol : vraie balise <img> en lazy-load (desktop uniquement).
      // Le navigateur la charge quand la carte approche de l'écran -> déjà prête
      // au survol, sans rafale au scroll ni téléchargement inutile sur mobile.
      if (canHover && item.image) {
        const opt = optimizedUrl(item.image, 900);
        const im = document.createElement('img');
        im.className = 'presta-cell-img';
        im.alt = '';
        im.setAttribute('aria-hidden', 'true');
        im.loading = 'lazy';
        im.decoding = 'async';
        if (opt) {
          // Repli sur l'original si la transformation d'image n'est pas disponible.
          im.addEventListener('error', function onErr() {
            im.removeEventListener('error', onErr);
            im.src = item.image;
          });
          im.src = opt;
        } else {
          im.src = item.image;
        }
        art.insertBefore(im, art.firstChild);
      }

      // Le bouton est dans la card : le clic remonte au gestionnaire de la card.
      art.addEventListener('click', function () { openAction(item); });
      prestaGrid.appendChild(art);
    });

    // Survol (desktop) : révèle l'image + focus clavier sur le bouton
    if (canHover) {
      Array.prototype.forEach.call(prestaGrid.querySelectorAll('.presta-cell'), function (cell) {
        cell.addEventListener('pointerenter', function () { cell.classList.add('is-open'); });
        cell.addEventListener('pointerleave', function () { cell.classList.remove('is-open'); });
        const btn = cell.querySelector('.presta-reserve');
        if (btn) {
          btn.addEventListener('focus', function () { cell.classList.add('is-open'); });
          btn.addEventListener('blur', function () { cell.classList.remove('is-open'); });
        }
      });

      // Préchargement en arrière-plan, dès l'arrivée sur la page (priorité basse
      // pour ne pas gêner le hero) : les images de survol sont en cache AVANT
      // qu'on atteigne la section -> 1er survol instantané, même pour un gros
      // fichier. C'est ce qui manquait : le lazy-load ne chargeait qu'au dernier
      // moment, trop tard pour une image lourde.
      data.forEach(function (item) {
        if (!item.image) return;
        const im = new Image();
        if ('fetchPriority' in im) im.fetchPriority = 'low';
        im.decoding = 'async';
        im.src = optimizedUrl(item.image, 900) || item.image;
      });
    }
  }

  /* ---------- FAQ (éditable depuis l'admin) ---------- */
  function renderFaq(list) {
    const wrap = document.getElementById('faqList');
    if (!wrap || !Array.isArray(list)) return;
    const items = list.filter(function (f) { return f && (f.question || f.q); });
    if (!items.length) return;   // aucune FAQ définie : on garde le contenu par défaut du HTML

    wrap.innerHTML = items.map(function (f) {
      const q = f.question || f.q || '';
      const a = f.answer || f.reponse || f.a || '';
      return '<details class="faq-item"><summary>' + escHtml(q) + '</summary>' +
             '<div class="faq-a">' + escBreak(a) + '</div></details>';
    }).join('');

    // Données structurées FAQ (SEO) synchronisées avec le contenu affiché
    const schema = document.getElementById('faqSchema');
    if (schema) {
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(function (f) {
          return {
            '@type': 'Question',
            name: f.question || f.q || '',
            acceptedAnswer: { '@type': 'Answer', text: f.answer || f.reponse || f.a || '' }
          };
        })
      });
    }
  }

  function renderBeforeAfter(baData) {
    const baSlider = document.getElementById('baSlider');
    if (!baSlider) return;
    // Aucune donnée (ex. repli hors-ligne) : on masque toute la section
    // au lieu d'afficher un cadre vide.
    if (!baData || !baData.length) {
      const section = document.getElementById('realisations');
      if (section) section.style.display = 'none';
      return;
    }
    const baTabsEl = document.getElementById('baTabs');
    const baBefore = document.getElementById('baBefore');
    const baBeforeImg = document.getElementById('baBeforeImg');
    const baAfterImg = document.getElementById('baAfterImg');
    const baHandle = document.getElementById('baHandle');
    let dragging = false;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      baBefore.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      baHandle.style.left = pct + '%';
    }
    function pctFromEvent(e) {
      const rect = baSlider.getBoundingClientRect();
      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * 100;
    }
    function loadPair(item) {
      baBeforeImg.src = item.avant;
      baAfterImg.src = item.apres;
      setPos(50);
    }

    baData.forEach(function (item, i) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ba-tab' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.textContent = item.categorie;
      btn.addEventListener('click', function () {
        baTabsEl.querySelectorAll('.ba-tab').forEach(function (t) { t.classList.remove('is-active'); });
        btn.classList.add('is-active');
        loadPair(item);
      });
      baTabsEl.appendChild(btn);
    });

    // Glisser (souris + tactile) : capture du pointeur sur le slider pour
    // que le geste fonctionne sans faire scroller la page sur mobile.
    baSlider.addEventListener('pointerdown', function (e) {
      dragging = true;
      if (baSlider.setPointerCapture) { try { baSlider.setPointerCapture(e.pointerId); } catch (_) {} }
      setPos(pctFromEvent(e));
      e.preventDefault();
    });
    baSlider.addEventListener('pointermove', function (e) {
      if (dragging) { setPos(pctFromEvent(e)); e.preventDefault(); }
    });
    function endDrag(e) {
      dragging = false;
      if (baSlider.releasePointerCapture && e && e.pointerId != null) {
        try { baSlider.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    }
    baSlider.addEventListener('pointerup', endDrag);
    baSlider.addEventListener('pointercancel', endDrag);

    loadPair(baData[0]);
  }

  /* ---------- Instagram : feed live via Behold (JSON) ---------- */
  const BEHOLD_FEED = 'https://feeds.behold.so/yBvbxQrqJpDImoPKDLvR';
  (function () {
    const igPreview = document.getElementById('igPreview');
    if (!igPreview) return;

    const IG_SVG = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none"/></svg>';
    const PLAY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

    // Repli : 3 tuiles de marque (si le flux Behold échoue ou est vide)
    function showIgFallback() {
      const a = '<a class="ig-post ig-post-fallback" href="https://www.instagram.com/thebeautycorner.byalex" target="_blank" rel="noopener" aria-label="Voir sur Instagram"><span class="ig-post-overlay" aria-hidden="true">' + IG_SVG + '</span></a>';
      igPreview.innerHTML = a + a + a;
    }

    fetch(BEHOLD_FEED, { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data) { showIgFallback(); return; }

        // Nombre d'abonnés
        if (typeof data.followersCount === 'number') {
          const f = document.getElementById('igFollowers');
          if (f) { f.textContent = data.followersCount.toLocaleString('fr-FR'); f.setAttribute('data-locked', '1'); }
        }

        const posts = (data.posts || []).slice(0, 3);
        if (!posts.length) { showIgFallback(); return; }

        // Remplace les squelettes par les vrais posts
        igPreview.innerHTML = '';
        posts.forEach(function (post) {
          const img = (post.sizes && post.sizes.medium && post.sizes.medium.mediaUrl) || post.thumbnailUrl || post.mediaUrl;
          const a = document.createElement('a');
          a.className = 'ig-post';
          a.href = post.permalink || 'https://www.instagram.com/thebeautycorner.byalex';
          a.target = '_blank';
          a.rel = 'noopener';
          a.setAttribute('aria-label', 'Voir la publication sur Instagram');
          if (img) {
            const im = document.createElement('img');
            im.src = img;
            im.alt = '';   // décorative : le lien porte déjà aria-label (évite les alt identiques)
            im.loading = 'lazy';
            a.appendChild(im);
          }

          const ov = document.createElement('span');
          ov.className = 'ig-post-overlay';
          ov.setAttribute('aria-hidden', 'true');
          ov.innerHTML = IG_SVG;
          a.appendChild(ov);

          if (post.mediaType === 'VIDEO' || post.isReel) {
            // Vidéo/reel : cadrée (peut être rognée en hauteur, sans souci)
            a.classList.add('is-video');
            const badge = document.createElement('span');
            badge.className = 'ig-post-video';
            badge.setAttribute('aria-hidden', 'true');
            badge.innerHTML = PLAY_SVG;
            a.appendChild(badge);
          }
          igPreview.appendChild(a);
        });
      })
      .catch(function () { showIgFallback(); });
  })();

  // Contenu du site : d'abord Supabase (base de données éditable via l'admin),
  // repli sur data/content.json si Supabase est indisponible.
  function loadContent() {
    const url = window.SB_URL, key = window.SB_KEY;
    const fromFile = function () {
      return fetch('data/content.json', { cache: 'no-cache' }).then(function (r) { return r.json(); });
    };
    if (url && key) {
      return fetch(url + '/rest/v1/site_content?select=data&id=eq.1', {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
        cache: 'no-cache'
      })
        .then(function (r) { if (!r.ok) throw new Error('supabase'); return r.json(); })
        .then(function (rows) {
          if (rows && rows[0] && rows[0].data) return rows[0].data;
          throw new Error('vide');
        })
        .catch(fromFile);
    }
    return fromFile();
  }

  // Remplit le menu « Prestation souhaitée » du formulaire de contact à partir
  // des prestations (reste synchronisé avec l'admin) + une option « Autre ».
  function fillServiceSelect(prestations) {
    const sel = document.getElementById('service');
    if (!sel || !prestations || !prestations.length) return;
    sel.innerHTML = '';
    prestations.forEach(function (p) {
      if (!p || !p.nom) return;
      const o = document.createElement('option');
      o.textContent = p.nom;
      sel.appendChild(o);
    });
    const autre = document.createElement('option');
    autre.textContent = 'Autre / Plusieurs prestations';
    sel.appendChild(autre);
  }

  loadContent()
    .then(function (content) {
      const planity = content.planity || 'https://www.planity.com/the-beauty-corner-by-alex--06300-nice';
      document.querySelectorAll('[data-planity]').forEach(function (a) { a.href = planity; });
      // Lien « Offrir » (carte cadeau) : configurable, sinon on garde le href du HTML
      if (content.planityGift) {
        document.querySelectorAll('[data-planity-gift]').forEach(function (a) { a.href = content.planityGift; });
      }

      if (content.heroImage) {
        const heroBg = document.getElementById('heroBg');
        if (heroBg) heroBg.style.backgroundImage = "url('" + content.heroImage + "')";
      }
      if (content.aboutImage) {
        const aboutImg = document.getElementById('aboutImg');
        if (aboutImg) aboutImg.src = content.aboutImage;
      }
      if (content.avisImage) {
        const avisSection = document.getElementById('avis');
        if (avisSection) avisSection.style.backgroundImage = "url('" + content.avisImage + "')";
      }
      if (content.giftcardImage) {
        const giftSection = document.getElementById('giftcard');
        if (giftSection) {
          giftSection.style.backgroundImage = "url('" + content.giftcardImage + "')";
          giftSection.classList.add('has-image');
        }
      }

      applyTexts(content.texts || {});
      renderExpModal(content.texts || {}, content.experience);

      renderPrestations(content.prestations || [], planity);
      renderBeforeAfter(content.avantApres || []);
      renderFaq(content.faq || []);
      fillServiceSelect(content.prestations || []);
    })
    .catch(function (err) { console.error('Chargement du contenu impossible :', err); });

  /* ---------- Textes du site (liaison data-txt) ---------- */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escBreak(s) { return escHtml(s).replace(/\n/g, '<br>'); }

  function applyTexts(texts) {
    document.querySelectorAll('[data-txt]').forEach(function (el) {
      const key = el.getAttribute('data-txt');
      const val = texts[key];
      if (val != null && val !== '' && !el.hasAttribute('data-locked')) {
        el.innerHTML = escBreak(val);
      }
      const telKey = el.getAttribute('data-tel-from');
      if (telKey && texts[telKey]) {
        el.setAttribute('href', 'tel:' + String(texts[telKey]).replace(/\s+/g, ''));
      }
    });
  }

  /* ---------- Modal Expérience : rendu depuis le contenu ---------- */
  const DEFAULT_EXP = {
    tiers: [
      { name: 'Girls Night', price: '55 €', unit: '/ pers', flag: '', tag: 'La soirée entre amies par excellence',
        items: ['Accueil personnalisé, ambiance musicale & espace photo', 'Softs à volonté + sélection vin blanc, rosé & Martini (2 conso/pers)', 'Pause gourmande : chips, olives, biscuits apéritifs, tomates cerises, petites douceurs', 'Parenthèse beauté personnalisée : chaque participante choisit un soin'] },
      { name: 'Glam Night', price: '70 €', unit: '/ pers', flag: 'Le plus festif', tag: 'Une soirée plus festive, avec des souvenirs à partager',
        items: ['Tout de la Girls Night, et :', 'Souvenirs : polaroïds pour immortaliser la soirée', 'Pause gourmande enrichie : mini pizzas, mini quiches, bouchées salées, douceurs sucrées', 'Possibilité d\'apporter votre propre gâteau personnalisé'] },
      { name: 'Signature', price: '85 €', unit: '/ pers', flag: '', tag: 'Une expérience unique pensée autour de votre événement',
        items: ['Tout de la Glam Night, et :', 'Cadeau personnalisé pour la future mariée', 'Goodies pour chaque participante', 'Petites attentions surprises'] }
    ],
    beautyTitle: 'La parenthèse beauté personnalisée',
    beautyLead: 'Chaque participante choisit l\'un de ces soins :',
    choices: [
      { name: 'Rituel Éclat', desc: 'Nettoyage de peau & massage du visage' },
      { name: 'Pause Douceur', desc: 'Manucure & massage des mains' },
      { name: 'Regard Sublimé', desc: 'Épilation & teinture des sourcils' }
    ],
    tattoo: 'Option tatouage souvenir (facultative) : avec les artistes Frères d\'Encre — tatouage flash ou projet personnalisé, réalisé et réglé directement auprès du tatoueur.',
    conditionsTitle: 'Conditions de réservation',
    conditions: ['Réservation au minimum 1 mois avant la date souhaitée', 'Groupes de 6 à 10 participantes', 'Acompte de 30 % pour confirmer la réservation', 'Solde réglé selon les modalités convenues', 'Nombre définitif confirmé avant l\'événement', 'Toute demande particulière signalée à la réservation'],
    notesTitle: 'Bon à savoir',
    notes: ['Boissons alcoolisées réservées aux personnes majeures, limitées à 2 consommations par participante', 'L\'abus d\'alcool est dangereux pour la santé — à consommer avec modération', 'Chaque participante est responsable de ses effets personnels ; les éventuelles dégradations pourront être facturées']
  };

  function liList(arr, cls) {
    return '<ul class="exp-list' + (cls ? ' ' + cls : '') + '">' +
      (arr || []).map(function (i) { return '<li>' + escHtml(i) + '</li>'; }).join('') + '</ul>';
  }

  function renderExpModal(texts, exp) {
    const body = document.getElementById('expModalBody');
    if (!body) return;
    exp = exp || DEFAULT_EXP;
    const t = texts || {};
    const eyebrow = t['experience.modalEyebrow'] || 'Frères d\'Encre Experiences · by Alex';
    const title = t['experience.modalTitle'] || 'Une soirée entre amies, pensée pour créer des souvenirs';
    const sub = t['experience.modalSub'] || 'Groupe privé de 6 à 10 participantes · au studio Frères d\'Encre, 42 rue Arson, Nice';

    const tiers = (exp.tiers || []).map(function (tier) {
      return '<article class="exp-tier' + (tier.flag ? ' exp-tier-featured' : '') + '">' +
        (tier.flag ? '<span class="exp-tier-flag">' + escHtml(tier.flag) + '</span>' : '') +
        '<h3>' + escHtml(tier.name) + '</h3>' +
        '<p class="exp-tier-price">' + escHtml(tier.price) + ' <span>' + escHtml(tier.unit || '') + '</span></p>' +
        '<p class="exp-tier-tag">' + escHtml(tier.tag) + '</p>' +
        liList(tier.items) +
      '</article>';
    }).join('');

    const choices = (exp.choices || []).map(function (c) {
      return '<div class="exp-choice"><strong>' + escHtml(c.name) + '</strong><span>' + escHtml(c.desc) + '</span></div>';
    }).join('');

    body.innerHTML =
      '<header class="exp-modal-head">' +
        '<p class="exp-eyebrow">' + escHtml(eyebrow) + '</p>' +
        '<h2 id="expModalTitle">' + escHtml(title) + '</h2>' +
        '<p class="exp-sub">' + escHtml(sub) + '</p>' +
      '</header>' +
      '<div class="exp-tiers">' + tiers + '</div>' +
      '<section class="exp-block">' +
        '<h4>' + escHtml(exp.beautyTitle) + '</h4>' +
        '<p class="exp-block-lead">' + escHtml(exp.beautyLead) + '</p>' +
        '<div class="exp-choices">' + choices + '</div>' +
        '<p class="exp-option">' + escBreak(exp.tattoo) + '</p>' +
      '</section>' +
      '<div class="exp-notes">' +
        '<section class="exp-block"><h4>' + escHtml(exp.conditionsTitle) + '</h4>' + liList(exp.conditions, 'exp-list-plain') + '</section>' +
        '<section class="exp-block"><h4>' + escHtml(exp.notesTitle) + '</h4>' + liList(exp.notes, 'exp-list-plain') + '</section>' +
      '</div>';
  }

  /* ---------- Avis clients (Google via api/reviews, avec repli) ---------- */
  const FALLBACK_REVIEWS = [
    { texte: "Des ongles impeccables et des sourcils parfaitement dessinés. Un travail précis et un accueil au top !", auteur: "Cliente vérifiée", source: "Google" },
    { texte: "Alexandra est une vraie professionnelle. Résultat naturel, ambiance douce et créative. Je recommande à 100 %.", auteur: "Cliente vérifiée", source: "Google" },
    { texte: "20 ans d'expertise, ça se voit. Minutie, écoute et un rendu magnifique en dermopigmentation.", auteur: "Cliente vérifiée", source: "Planity" }
  ];
  let heroInterval = null, sectionInterval = null;

  function citeText(rv) {
    return '— ' + (rv.auteur || 'Client') + (rv.source ? ' · ' + rv.source : '');
  }
  function truncate(t, n) { return (t && t.length > n) ? t.slice(0, n - 1).trim() + '…' : t; }

  function renderReviews(reviews, rating, total) {
    if (!reviews || !reviews.length) return;

    // Note (hero + bandeau de la section)
    const ratingStr = (typeof rating === 'number') ? rating.toFixed(1).replace('.', ',') : null;
    if (ratingStr) {
      const hr = document.getElementById('heroRating');
      if (hr) hr.textContent = ratingStr;
      const rc = document.getElementById('reviewsCount');
      if (rc) rc.textContent = total ? (total + ' avis Google') : 'Avis clients Google';
      const note = document.getElementById('reviewsNote');
      if (note) note.textContent = 'Note ' + ratingStr + ' sur Google' + (total ? ' · ' + total + ' avis' : '');

      // SEO : synchronise aggregateRating (étoiles dans Google)
      try {
        const ld = document.querySelector('script[type="application/ld+json"]');
        if (ld) {
          const j = JSON.parse(ld.textContent);
          if (j.aggregateRating) {
            j.aggregateRating.ratingValue = String(rating);
            if (total) j.aggregateRating.reviewCount = String(total);
            ld.textContent = JSON.stringify(j);
          }
        }
      } catch (e) { /* ignore */ }
    }

    // Section Avis : reconstruit le carrousel
    const track = document.getElementById('testimonialTrack');
    const dotsC = document.getElementById('testimonialDots');
    if (track && dotsC) {
      track.innerHTML = ''; dotsC.innerHTML = '';
      reviews.forEach(function (rv, i) {
        const bq = document.createElement('blockquote');
        bq.className = 'testimonial' + (i === 0 ? ' active' : '');
        const p = document.createElement('p'); p.textContent = '« ' + rv.texte + ' »';
        const c = document.createElement('cite'); c.textContent = citeText(rv);
        bq.appendChild(p); bq.appendChild(c);
        if (rv.lien) {
          bq.classList.add('is-clickable');
          bq.setAttribute('title', 'Voir cet avis sur Google');
          bq.addEventListener('click', function () {
            window.open(rv.lien, '_blank', 'noopener');
          });
        }
        track.appendChild(bq);
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', 'Avis ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dotsC.appendChild(dot);
      });
      const items = Array.from(track.children), dots = Array.from(dotsC.children);
      let curS = 0;
      function goToS(idx) {
        items[curS].classList.remove('active'); dots[curS].classList.remove('active');
        curS = idx;
        items[curS].classList.add('active'); dots[curS].classList.add('active');
      }
      dots.forEach(function (d, i) { d.addEventListener('click', function () { goToS(i); }); });

      // Hauteur figée sur l'avis le plus grand → plus de saut de mise en page
      function sizeTrack() {
        let max = 0;
        items.forEach(function (it) { max = Math.max(max, it.offsetHeight); });
        if (max) track.style.height = max + 'px';
      }
      sizeTrack();
      if (window.__baResize) window.removeEventListener('resize', window.__baResize);
      window.__baResize = sizeTrack;
      window.addEventListener('resize', sizeTrack, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeTrack);
      setTimeout(sizeTrack, 400);

      if (sectionInterval) clearInterval(sectionInterval);
      if (items.length > 1) sectionInterval = setInterval(function () { goToS((curS + 1) % items.length); }, 6000);
    }

    // Hero : l'avis qui défile
    const heroReview = document.getElementById('heroReview');
    if (heroReview) {
      const hp = heroReview.querySelector('p'), hc = heroReview.querySelector('cite');
      let curH = 0;
      function showHero(i) {
        if (hp) hp.textContent = '« ' + truncate(reviews[i].texte, 150) + ' »';
        if (hc) hc.textContent = citeText(reviews[i]);
        const lien = reviews[i].lien || '';
        if (lien) { heroReview.dataset.lien = lien; heroReview.style.cursor = 'pointer'; heroReview.setAttribute('title', 'Voir cet avis sur Google'); }
        else { delete heroReview.dataset.lien; heroReview.style.cursor = ''; heroReview.removeAttribute('title'); }
      }
      if (!heroReview.__clickBound) {
        heroReview.__clickBound = true;
        heroReview.addEventListener('click', function () {
          if (heroReview.dataset.lien) window.open(heroReview.dataset.lien, '_blank', 'noopener');
        });
      }
      showHero(0);
      if (heroInterval) clearInterval(heroInterval);
      if (reviews.length > 1) {
        heroInterval = setInterval(function () {
          curH = (curH + 1) % reviews.length;
          heroReview.classList.add('is-fading');
          setTimeout(function () { showHero(curH); heroReview.classList.remove('is-fading'); }, 450);
        }, 5500);
      }
    }
  }

  // Affiche d'abord les avis de repli, puis tente les avis Google live
  renderReviews(FALLBACK_REVIEWS, null, null);
  fetch('/api/reviews', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.ok && d.avis && d.avis.length) renderReviews(d.avis, d.note, d.total);
    })
    .catch(function () { /* repli déjà affiché */ });

  /* ---------- Formulaire de contact (envoi par email via Web3Forms) ---------- */
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  const RED = '#b45f4d', BLUE = '#4a6b7a';

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');

      if (!name.value.trim() || !email.value.trim()) {
        feedback.textContent = 'Merci de renseigner votre nom et votre email.';
        feedback.style.color = RED;
        return;
      }

      // Anti-spam : si le champ piège est rempli, c'est un robot → on ignore.
      const trap = form.querySelector('#_gotcha');
      if (trap && trap.value) { form.reset(); return; }

      const key = window.WEB3FORMS_KEY;
      // Sans clé configurée : on reste sur un retour visuel (mode maquette).
      if (!key) {
        feedback.textContent = 'Merci ' + name.value.trim() + ' ! Votre demande a bien été envoyée.';
        feedback.style.color = BLUE;
        form.reset();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const oldLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Envoi en cours…'; }
      feedback.textContent = 'Envoi en cours…';
      feedback.style.color = BLUE;

      const payload = {
        access_key: key,
        subject: 'Nouvelle demande — The Beauty Corner (site)',
        from_name: 'Site The Beauty Corner',
        name: name.value.trim(),
        email: email.value.trim(),
        prestation: (form.querySelector('#service') || {}).value || '',
        message: (form.querySelector('#message') || {}).value || ''
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            feedback.textContent = 'Merci ' + name.value.trim() + ' ! Votre demande a bien été envoyée.';
            feedback.style.color = BLUE;
            form.reset();
          } else {
            feedback.textContent = "L'envoi a échoué. Réessayez ou appelez-nous au 06 01 82 37 73.";
            feedback.style.color = RED;
          }
        })
        .catch(function () {
          feedback.textContent = "L'envoi a échoué. Réessayez ou appelez-nous au 06 01 82 37 73.";
          feedback.style.color = RED;
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = oldLabel; }
        });
    });
  }

  /* ---------- Modal Expérience (Frères d'Encre Experiences) ---------- */
  const expModal = document.getElementById('expModal');
  const expCard = document.getElementById('experienceCard');
  let expLastFocus = null;

  function openExp() {
    if (!expModal) return;
    expLastFocus = document.activeElement;
    expModal.hidden = false;
    document.body.classList.add('modal-open');
    const closeBtn = expModal.querySelector('.exp-modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeExp() {
    if (!expModal) return;
    expModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (expLastFocus && expLastFocus.focus) expLastFocus.focus();
  }

  if (expCard) expCard.addEventListener('click', openExp);
  if (expModal) {
    expModal.addEventListener('click', function (e) {
      if (e.target.closest('[data-exp-close]')) closeExp();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !expModal.hidden) closeExp();
    });

    // « Une question » : ferme le modal et amène au formulaire de contact,
    // en pré-remplissant le message.
    const askBtn = document.getElementById('expAsk');
    if (askBtn) {
      askBtn.addEventListener('click', function () {
        closeExp();
        const contact = document.getElementById('contact');
        const msg = document.getElementById('message');
        if (msg && !msg.value.trim()) {
          msg.value = "Bonjour, je souhaite des informations sur les Frères d'Encre Experiences (Girls Night / Glam Night / Signature). ";
        }
        if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (msg) setTimeout(function () { msg.focus(); }, 600);
      });
    }
  }

  /* ---------- Modal Prestation : formules + prix, bouton vers Planity ---------- */
  const prestaModal = document.getElementById('prestaModal');
  let prestaLastFocus = null;

  function openPrestaModal(item, planity) {
    if (!prestaModal) { window.open(planity, '_blank', 'noopener'); return; }
    const body = document.getElementById('prestaModalBody');
    const intro = item.detail || item.description || '';
    const rows = (item.formules || []).map(function (f) {
      // Sous-titre : ce qui suit le tiret dans le nom (ex. « XS — moins de 5 cm² »),
      // affiché en italique sous le titre pour une présentation plus claire.
      const raw = String(f.nom || '');
      const m = raw.match(/^(.*?)\s+[—–-]\s+(.*)$/);
      const fname = m ? m[1] : raw;
      const fdetail = f.detail || (m ? m[2] : '');
      return '<div class="pf-row">' +
        '<div class="pf-info"><span class="pf-name">' + escHtml(fname) + '</span>' +
          (fdetail ? '<span class="pf-detail">' + escHtml(fdetail) + '</span>' : '') + '</div>' +
        '<div class="pf-meta">' +
          (f.prix ? '<span class="pf-price">' + escHtml(f.prix) + '</span>' : '') +
          (f.duree ? '<span class="pf-duree">' + escHtml(f.duree) + '</span>' : '') +
        '</div></div>';
    }).join('');
    // Bouton d'action : par défaut « Réserver sur Planity », ou un bouton
    // personnalisé (ex. appel téléphonique) si la prestation le définit.
    const bookHref = item.bookHref || planity;
    const bookLabel = item.bookLabel || 'Réserver sur Planity';
    const bookTarget = item.bookHref ? '' : ' target="_blank" rel="noopener"';
    body.innerHTML =
      '<header class="presta-modal-head">' +
        '<p class="exp-eyebrow">Prestation</p>' +
        '<h2 id="prestaModalTitle">' + escHtml(item.nom || '') + '</h2>' +
        (intro ? '<p class="exp-sub">' + escBreak(intro) + '</p>' : '') +
      '</header>' +
      '<div class="presta-formules">' + rows + '</div>' +
      '<div class="exp-modal-actions">' +
        '<a class="btn btn-blue" href="' + bookHref + '"' + bookTarget + '>' + escHtml(bookLabel) + '</a>' +
      '</div>';
    prestaLastFocus = document.activeElement;
    prestaModal.hidden = false;
    document.body.classList.add('modal-open');
    const closeBtn = prestaModal.querySelector('.exp-modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closePresta() {
    if (!prestaModal) return;
    prestaModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (prestaLastFocus && prestaLastFocus.focus) prestaLastFocus.focus();
  }
  if (prestaModal) {
    prestaModal.addEventListener('click', function (e) {
      if (e.target.closest('[data-presta-close]')) closePresta();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !prestaModal.hidden) closePresta();
    });
  }

});
