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
