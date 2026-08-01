/* ============================================================
   Espace admin — The Beauty Corner
   Connexion Supabase + édition du contenu + upload d'images.
   ============================================================ */
(function () {
  const sb = window.supabase.createClient(window.SB_URL, window.SB_KEY);

  const loginView = document.getElementById('loginView');
  const editorView = document.getElementById('editorView');
  const savebar = document.getElementById('savebar');
  const loginMsg = document.getElementById('loginMsg');
  const saveMsg = document.getElementById('saveMsg');

  /* ---------- Auth ---------- */
  async function refresh() {
    const { data } = await sb.auth.getSession();
    if (data.session) enterEditor(); else showLogin();
  }
  function showLogin() {
    loginView.classList.remove('hidden');
    editorView.classList.add('hidden');
    savebar.classList.add('hidden');
  }
  async function enterEditor() {
    loginView.classList.add('hidden');
    editorView.classList.remove('hidden');
    savebar.classList.remove('hidden');
    await loadContent();
  }

  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    loginMsg.textContent = 'Connexion…';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Auth error:', error);
        const detail = error.message || error.name || ('erreur ' + (error.status || '?'));
        loginMsg.textContent = 'Connexion impossible : ' + detail;
      } else {
        loginMsg.textContent = '';
      }
    } catch (err) {
      console.error('Auth exception:', err);
      loginMsg.textContent = 'Erreur : ' + ((err && err.message) ? err.message : 'réseau');
    }
  });

  document.getElementById('logout').addEventListener('click', async function () {
    await sb.auth.signOut();
    showLogin();
  });

  sb.auth.onAuthStateChange(function (_evt, session) {
    if (session) enterEditor(); else showLogin();
  });

  /* ---------- Chargement du contenu ---------- */
  async function loadContent() {
    const { data, error } = await sb.from('site_content').select('data').eq('id', 1).single();
    if (error) { saveMsg.className = 'msg err'; saveMsg.textContent = 'Erreur de chargement : ' + error.message; return; }
    const c = (data && data.data) || {};
    document.getElementById('planity').value = c.planity || '';
    renderSiteImages(c);
    renderPrestations(c.prestations || []);
    renderBa(c.avantApres || []);
  }

  /* ---------- Rendu des champs ---------- */
  const prestaWrap = document.getElementById('prestations');
  const baWrap = document.getElementById('avantApres');
  const siteImagesWrap = document.getElementById('siteImages');

  function renderSiteImages(c) {
    siteImagesWrap.innerHTML =
      '<div data-siteimg="heroImage">' + imgField('heroImage', c.heroImage, 'Photo du Hero (grande image d\'accueil, en fond)') + '</div>' +
      '<div data-siteimg="aboutImage" style="margin-top:14px;">' + imgField('aboutImage', c.aboutImage, 'Photo de la section « À propos »') + '</div>';
  }

  function imgField(fieldName, url, customLabel) {
    const label = customLabel ||
      (fieldName === 'image' ? 'Image de la carte' : (fieldName === 'avant' ? 'Photo AVANT' : 'Photo APRÈS'));
    return '' +
      '<label>' + label + '</label>' +
      '<div class="imgfield">' +
        '<span class="thumb" data-thumb style="background-image:url(\'' + (url || '') + '\')"></span>' +
        '<div class="up">' +
          '<input type="file" accept="image/*" data-upload />' +
          '<input type="hidden" data-field="' + fieldName + '" value="' + (url || '') + '" />' +
          '<div class="grip" data-status></div>' +
        '</div>' +
      '</div>';
  }

  function prestaCard(p) {
    p = p || {};
    const el = document.createElement('div');
    el.className = 'card'; el.setAttribute('data-presta', '');
    el.innerHTML =
      '<div class="row-head"><strong>Prestation</strong><button class="btn-danger" data-remove type="button">Supprimer</button></div>' +
      '<label>Titre</label><input type="text" data-field="nom" value="' + escAttr(p.nom) + '" />' +
      '<label>Description</label><textarea data-field="description">' + escHtml(p.description) + '</textarea>' +
      imgField('image', p.image);
    return el;
  }

  function baCard(b) {
    b = b || {};
    const el = document.createElement('div');
    el.className = 'card'; el.setAttribute('data-ba', '');
    el.innerHTML =
      '<div class="row-head"><strong>Prestation</strong><button class="btn-danger" data-remove type="button">Supprimer</button></div>' +
      '<label>Nom de la prestation</label><input type="text" data-field="categorie" value="' + escAttr(b.categorie) + '" />' +
      '<div class="col2" style="margin-top:6px;">' +
        '<div>' + imgField('avant', b.avant) + '</div>' +
        '<div>' + imgField('apres', b.apres) + '</div>' +
      '</div>';
    return el;
  }

  function renderPrestations(list) {
    prestaWrap.innerHTML = '';
    (list.length ? list : [{}]).forEach(function (p) { prestaWrap.appendChild(prestaCard(p)); });
  }
  function renderBa(list) {
    baWrap.innerHTML = '';
    (list.length ? list : [{}]).forEach(function (b) { baWrap.appendChild(baCard(b)); });
  }

  /* ---------- Ajout / suppression ---------- */
  document.addEventListener('click', function (e) {
    const add = e.target.closest('[data-add]');
    if (add) {
      if (add.getAttribute('data-add') === 'prestation') prestaWrap.appendChild(prestaCard({}));
      else baWrap.appendChild(baCard({}));
      return;
    }
    const rem = e.target.closest('[data-remove]');
    if (rem) { const card = rem.closest('.card'); if (card) card.remove(); }
  });

  /* ---------- Upload d'image ---------- */
  document.addEventListener('change', async function (e) {
    const input = e.target.closest('[data-upload]');
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    const box = input.closest('.up');
    const hidden = box.querySelector('[data-field]');
    const status = box.querySelector('[data-status]');
    const thumb = input.closest('.imgfield').querySelector('[data-thumb]');
    status.textContent = 'Envoi en cours…';
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = sb.storage.from('media').getPublicUrl(path);
      hidden.value = data.publicUrl;
      thumb.style.backgroundImage = "url('" + data.publicUrl + "')";
      status.textContent = 'Photo ajoutée ✓';
    } catch (err) {
      status.textContent = 'Échec : ' + (err.message || err);
    }
  });

  /* ---------- Enregistrement ---------- */
  document.getElementById('save').addEventListener('click', async function () {
    saveMsg.className = 'msg'; saveMsg.textContent = 'Enregistrement…';

    const content = {
      planity: document.getElementById('planity').value.trim(),
      heroImage: val(siteImagesWrap, 'heroImage'),
      aboutImage: val(siteImagesWrap, 'aboutImage'),
      prestations: [],
      avantApres: []
    };
    prestaWrap.querySelectorAll('[data-presta]').forEach(function (card) {
      const nom = val(card, 'nom'), description = val(card, 'description'), image = val(card, 'image');
      if (nom || description || image) content.prestations.push({ nom: nom, description: description, image: image });
    });
    baWrap.querySelectorAll('[data-ba]').forEach(function (card) {
      const categorie = val(card, 'categorie'), avant = val(card, 'avant'), apres = val(card, 'apres');
      if (categorie || avant || apres) content.avantApres.push({ categorie: categorie, avant: avant, apres: apres });
    });

    const { error } = await sb.from('site_content')
      .update({ data: content, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) { saveMsg.className = 'msg err'; saveMsg.textContent = 'Erreur : ' + error.message; return; }
    saveMsg.className = 'msg ok'; saveMsg.textContent = 'Enregistré ✓ — visible en ligne dans quelques secondes.';
  });

  /* ---------- Utilitaires ---------- */
  function val(card, field) {
    const el = card.querySelector('[data-field="' + field + '"]');
    return el ? el.value.trim() : '';
  }
  function escAttr(s) { return String(s || '').replace(/"/g, '&quot;'); }
  function escHtml(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  refresh();
})();
