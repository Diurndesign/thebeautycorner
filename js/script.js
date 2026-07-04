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
  if (baSlider) {
    const baBefore = document.getElementById('baBefore');
    const baBeforeImg = document.getElementById('baBeforeImg');
    const baAfterImg = document.getElementById('baAfterImg');
    const baHandle = document.getElementById('baHandle');
    const baTabs = Array.from(document.querySelectorAll('.ba-tab'));
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

    // Glisser pour déplacer la barre (souris + tactile via Pointer Events)
    baSlider.addEventListener('pointerdown', function (e) { dragging = true; setPos(pctFromEvent(e)); });
    window.addEventListener('pointermove', function (e) { if (dragging) setPos(pctFromEvent(e)); });
    window.addEventListener('pointerup', function () { dragging = false; });

    // Changement de sous-catégorie : on charge la paire avant/après
    baTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        baTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        baBeforeImg.src = tab.getAttribute('data-before');
        baAfterImg.src = tab.getAttribute('data-after');
        setPos(50);
      });
    });

    setPos(50);
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
