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
