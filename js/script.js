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

  // (La section Instagram est gérée par Behold — pas de rendu JS ici.)

  fetch('data/content.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (content) {
      // Lien de réservation Planity : applique l'URL du CMS à tous les boutons
      const planity = content.planity || 'https://www.planity.com/the-beauty-corner-by-alex--06300-nice';
      document.querySelectorAll('[data-planity]').forEach(function (a) { a.href = planity; });

      renderPrestations(content.prestations || [], planity);
      renderBeforeAfter(content.avantApres || []);
    })
    .catch(function (err) { console.error('Chargement du contenu impossible :', err); });

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
