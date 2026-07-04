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

  /* ---------- Prestations : grille de blocs animés ---------- */
  const prestaGrid = document.getElementById('prestationsGrid');

  if (prestaGrid) {
    const cells = Array.from(prestaGrid.querySelectorAll('.presta-cell'));
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    cells.forEach(function (cell) {
      // Injecte l'image de la prestation dans la couche dédiée
      const src = cell.getAttribute('data-img');
      const imgEl = cell.querySelector('.presta-cell-img');
      if (src && imgEl) imgEl.style.backgroundImage = "url('" + src + "')";

      if (canHover) {
        // Desktop : ouverture au survol souris
        cell.addEventListener('pointerenter', function () { cell.classList.add('is-open'); });
        cell.addEventListener('pointerleave', function () { cell.classList.remove('is-open'); });
        // Accessibilité clavier : ouverture quand le bouton reçoit le focus
        const link = cell.querySelector('.presta-reserve');
        if (link) {
          link.addEventListener('focus', function () { cell.classList.add('is-open'); });
          link.addEventListener('blur', function () { cell.classList.remove('is-open'); });
        }
      } else {
        // Mobile / tablette : ouverture au tap (le bouton Réserver garde son lien)
        cell.addEventListener('click', function (e) {
          if (e.target.closest('.presta-reserve')) return; // laisse le lien fonctionner
          const alreadyOpen = cell.classList.contains('is-open');
          cells.forEach(function (c) { c.classList.remove('is-open'); });
          if (!alreadyOpen) cell.classList.add('is-open');
        });
      }
    });
  }

  /* ---------- Avant / Après : comparateur + sous-catégories ---------- */
  const baSlider = document.getElementById('baSlider');
  const baData = (window.SITE_CONTENT && window.SITE_CONTENT.avantApres) || [];
  if (baSlider && baData.length) {
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

    // Génère les onglets à partir de content.js
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

    // Glisser pour déplacer la barre (souris + tactile via Pointer Events)
    baSlider.addEventListener('pointerdown', function (e) { dragging = true; setPos(pctFromEvent(e)); });
    window.addEventListener('pointermove', function (e) { if (dragging) setPos(pctFromEvent(e)); });
    window.addEventListener('pointerup', function () { dragging = false; });

    loadPair(baData[0]);
  }

  /* ---------- Instagram : aperçu depuis content.js ---------- */
  const igPreview = document.getElementById('igPreview');
  const igData = window.SITE_CONTENT && window.SITE_CONTENT.instagram;
  if (igPreview && igData) {
    // Nombre d'abonnés
    document.querySelectorAll('[data-ig-count]').forEach(function (el) { el.textContent = igData.abonnes; });

    function igOverlay() {
      const s = document.createElement('span');
      s.className = 'ig-post-overlay';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none"/></svg>';
      return s;
    }

    (igData.posts || []).slice(0, 3).forEach(function (post) {
      const a = document.createElement('a');
      a.className = 'ig-post';
      a.href = igData.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', 'Voir la publication sur Instagram');
      if (post.type === 'video') {
        const v = document.createElement('video');
        v.src = post.src;
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
        v.setAttribute('playsinline', '');
        a.appendChild(v);
      } else {
        a.style.backgroundImage = "url('" + post.src + "')";
      }
      a.appendChild(igOverlay());
      igPreview.appendChild(a);
    });
  }

  /* ---------- Carrousel de témoignages ---------- */
  const testimonials = Array.from(document.querySelectorAll('.testimonial'));
  const dotsContainer = document.getElementById('testimonialDots');
  let current = 0;

  if (testimonials.length && dotsContainer) {
    // Génération des puces
    testimonials.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Témoignage ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function goTo(index) {
      testimonials[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = index;
      testimonials[current].classList.add('active');
      dots[current].classList.add('active');
    }

    // Rotation automatique
    setInterval(function () {
      goTo((current + 1) % testimonials.length);
    }, 6000);
  }

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
