/* ============================================================
   THE BEAUTY CORNER by Alex — Interactions maquette
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

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

  /* ---------- Header : fond sombre au scroll (lisibilité) ---------- */
  const header = document.getElementById('header');
  function updateHeader() {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Contenu dynamique chargé depuis data/content.json ----------
     (édité par la cliente via le CMS ; toute modif est enregistrée dans ce
     fichier, puis le site se redéploie et affiche les nouvelles images.) */
  function renderPrestations(data, planity) {
    const prestaGrid = document.getElementById('prestationsGrid');
    if (!prestaGrid || !data || !data.length) return;

    data.forEach(function (item, i) {
      const art = document.createElement('article');
      art.className = 'presta-cell';
      art.innerHTML =
        '<div class="presta-cell-img" aria-hidden="true"></div>' +
        '<div class="presta-cell-inner">' +
          '<span class="presta-num">' + ('0' + (i + 1)).slice(-2) + '</span>' +
          '<div class="presta-cell-head">' +
            '<h3 class="presta-name"></h3>' +
            '<p class="presta-desc"></p>' +
          '</div>' +
          '<a class="presta-reserve" href="' + planity + '" target="_blank" rel="noopener">Réserver <span aria-hidden="true">→</span></a>' +
        '</div>';
      art.querySelector('.presta-name').textContent = item.nom || '';
      art.querySelector('.presta-desc').textContent = item.description || '';
      if (item.image) art.querySelector('.presta-cell-img').style.backgroundImage = "url('" + item.image + "')";
      prestaGrid.appendChild(art);
    });

    // Interactions : survol (desktop) / tap (mobile) + focus clavier
    const cells = Array.from(prestaGrid.querySelectorAll('.presta-cell'));
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    cells.forEach(function (cell) {
      if (canHover) {
        cell.addEventListener('pointerenter', function () { cell.classList.add('is-open'); });
        cell.addEventListener('pointerleave', function () { cell.classList.remove('is-open'); });
        const link = cell.querySelector('.presta-reserve');
        if (link) {
          link.addEventListener('focus', function () { cell.classList.add('is-open'); });
          link.addEventListener('blur', function () { cell.classList.remove('is-open'); });
        }
      } else {
        cell.addEventListener('click', function (e) {
          if (e.target.closest('.presta-reserve')) return;
          const alreadyOpen = cell.classList.contains('is-open');
          cells.forEach(function (c) { c.classList.remove('is-open'); });
          if (!alreadyOpen) cell.classList.add('is-open');
        });
      }
    });
  }

  function renderBeforeAfter(baData) {
    const baSlider = document.getElementById('baSlider');
    if (!baSlider || !baData || !baData.length) return;
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

    baSlider.addEventListener('pointerdown', function (e) { dragging = true; setPos(pctFromEvent(e)); });
    window.addEventListener('pointermove', function (e) { if (dragging) setPos(pctFromEvent(e)); });
    window.addEventListener('pointerup', function () { dragging = false; });

    loadPair(baData[0]);
  }

  /* ---------- Instagram : feed live via Behold (JSON) ---------- */
  const BEHOLD_FEED = 'https://feeds.behold.so/yBvbxQrqJpDImoPKDLvR';
  (function () {
    const igPreview = document.getElementById('igPreview');
    if (!igPreview) return;

    const IG_SVG = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none"/></svg>';
    const PLAY_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

    fetch(BEHOLD_FEED, { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data) return;

        // Nombre d'abonnés
        if (typeof data.followersCount === 'number') {
          const f = document.getElementById('igFollowers');
          if (f) f.textContent = data.followersCount.toLocaleString('fr-FR');
        }

        const posts = (data.posts || []).slice(0, 3);
        if (!posts.length) return;

        // Remplace les vignettes de repli par les vrais posts
        igPreview.innerHTML = '';
        posts.forEach(function (post) {
          const img = (post.sizes && post.sizes.medium && post.sizes.medium.mediaUrl) || post.thumbnailUrl || post.mediaUrl;
          const a = document.createElement('a');
          a.className = 'ig-post';
          a.href = post.permalink || 'https://www.instagram.com/thebeautycorner.byalex';
          a.target = '_blank';
          a.rel = 'noopener';
          a.setAttribute('aria-label', 'Voir la publication sur Instagram');
          if (img) a.style.backgroundImage = "url('" + img + "')";

          const ov = document.createElement('span');
          ov.className = 'ig-post-overlay';
          ov.setAttribute('aria-hidden', 'true');
          ov.innerHTML = IG_SVG;
          a.appendChild(ov);

          if (post.mediaType === 'VIDEO' || post.isReel) {
            const badge = document.createElement('span');
            badge.className = 'ig-post-video';
            badge.setAttribute('aria-hidden', 'true');
            badge.innerHTML = PLAY_SVG;
            a.appendChild(badge);
          }
          igPreview.appendChild(a);
        });
      })
      .catch(function () { /* repli statique conservé */ });
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

  loadContent()
    .then(function (content) {
      const planity = content.planity || 'https://www.planity.com/the-beauty-corner-by-alex--06300-nice';
      document.querySelectorAll('[data-planity]').forEach(function (a) { a.href = planity; });

      if (content.heroImage) {
        const hero = document.getElementById('accueil');
        if (hero) hero.style.backgroundImage = "url('" + content.heroImage + "')";
      }
      if (content.aboutImage) {
        const aboutImg = document.getElementById('aboutImg');
        if (aboutImg) aboutImg.src = content.aboutImage;
      }

      renderPrestations(content.prestations || [], planity);
      renderBeforeAfter(content.avantApres || []);
    })
    .catch(function (err) { console.error('Chargement du contenu impossible :', err); });

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
        bq.appendChild(p); bq.appendChild(c); track.appendChild(bq);
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
      }
      showHero(0);
      if (heroInterval) clearInterval(heroInterval);
      if (reviews.length > 1) {
        heroInterval = setInterval(function () {
          curH = (curH + 1) % reviews.length;
          heroReview.classList.add('is-fading');
          setTimeout(function () { showHero(curH); heroReview.classList.remove('is-fading'); }, 250);
        }, 5000);
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

  /* ---------- Formulaire de contact (maquette) ---------- */
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');

      if (!name.value.trim() || !email.value.trim()) {
        feedback.textContent = 'Merci de renseigner votre nom et votre email.';
        feedback.style.color = '#b45f4d';
        return;
      }

      feedback.textContent = 'Merci ' + name.value.trim() + ' ! Votre demande a bien été envoyée.';
      feedback.style.color = '#587D8D';
      form.reset();
    });
  }

});
