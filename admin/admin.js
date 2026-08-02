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
    renderTexts(c.texts || {});
    renderExp(c.experience || {}, c.texts || {});
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

  /* ---------- Textes du site ---------- */
  const textsWrap = document.getElementById('textsEditor');
  const expWrap = document.getElementById('expEditor');

  function field(attr, key, label, type, value) {
    value = value == null ? '' : value;
    const a = attr + '="' + key + '"';
    const input = type === 'area'
      ? '<textarea ' + a + '>' + escHtml(value) + '</textarea>'
      : '<input type="text" ' + a + ' value="' + escAttr(value) + '" />';
    return '<label>' + label + '</label>' + input;
  }

  const TEXT_GROUPS = [
    { title: 'Accueil (Hero)', fields: [
      ['hero.eyebrow', 'Sur-titre', 'input'],
      ['hero.title', 'Titre principal', 'area'],
      ['hero.tagline', 'Accroche', 'area'],
      ['hero.stat1label', 'Statistique 1 — libellé', 'input'],
      ['hero.stat2num', 'Statistique 2 — valeur', 'input'],
      ['hero.stat2label', 'Statistique 2 — libellé', 'input'],
      ['hero.stat3num', 'Statistique 3 — valeur', 'input'],
      ['hero.stat3label', 'Statistique 3 — libellé', 'input']
    ] },
    { title: 'À propos', fields: [
      ['about.eyebrow', 'Sur-titre', 'input'],
      ['about.title', 'Titre', 'area'],
      ['about.p1', 'Paragraphe 1', 'area'],
      ['about.p2', 'Paragraphe 2', 'area'],
      ['about.li1', 'Point 1', 'input'],
      ['about.li2', 'Point 2', 'input'],
      ['about.li3', 'Point 3', 'input']
    ] },
    { title: 'Prestations (en-tête)', fields: [
      ['prestations.eyebrow', 'Sur-titre', 'input'],
      ['prestations.title', 'Titre', 'input'],
      ['prestations.lead', 'Texte', 'area']
    ] },
    { title: 'Réalisations (en-tête)', fields: [
      ['realisations.eyebrow', 'Sur-titre', 'input'],
      ['realisations.title', 'Titre', 'input'],
      ['realisations.lead', 'Texte', 'area']
    ] },
    { title: 'Avis', fields: [
      ['avis.title', 'Titre', 'input']
    ] },
    { title: 'Instagram', fields: [
      ['instagram.handle', 'Identifiant (@…)', 'input'],
      ['instagram.title', 'Titre', 'input'],
      ['instagram.followers', "Nombre d'abonnés (repli si non connecté)", 'input'],
      ['instagram.subtitle', 'Sous-titre', 'input']
    ] },
    { title: 'Contact', fields: [
      ['contact.eyebrow', 'Sur-titre', 'input'],
      ['contact.title', 'Titre', 'area'],
      ['contact.lead', 'Texte', 'area'],
      ['contact.address', 'Adresse', 'area'],
      ['contact.phone', 'Téléphone (affiché)', 'input'],
      ['contact.phoneTel', 'Téléphone (lien — format +33…)', 'input'],
      ['contact.hoursMon', 'Horaires — Lundi', 'input'],
      ['contact.hoursTue', 'Horaires — Mardi', 'input'],
      ['contact.hoursWed', 'Horaires — Mercredi', 'input'],
      ['contact.hoursThu', 'Horaires — Jeudi', 'input'],
      ['contact.hoursFri', 'Horaires — Vendredi', 'input'],
      ['contact.hoursSat', 'Horaires — Samedi', 'input'],
      ['contact.hoursSun', 'Horaires — Dimanche', 'input']
    ] }
  ];

  const EXP_TEXT_FIELDS = [
    ['experience.badge', 'Badge de la carte', 'input'],
    ['experience.cardEyebrow', 'Carte — sur-titre', 'input'],
    ['experience.cardTitle', 'Carte — titre', 'input'],
    ['experience.cardLead', 'Carte — texte', 'area'],
    ['experience.cardPrice', 'Carte — prix affiché', 'input'],
    ['experience.modalEyebrow', 'Fenêtre — sur-titre', 'input'],
    ['experience.modalTitle', 'Fenêtre — titre', 'area'],
    ['experience.modalSub', 'Fenêtre — sous-titre', 'area']
  ];

  function renderTexts(texts) {
    textsWrap.innerHTML = TEXT_GROUPS.map(function (g) {
      return '<div class="card"><div class="row-head"><strong>' + g.title + '</strong></div>' +
        g.fields.map(function (f) { return field('data-tkey', f[0], f[1], f[2], texts[f[0]]); }).join('') +
        '</div>';
    }).join('');
  }

  function tierCard(t) {
    t = t || {};
    const el = document.createElement('div');
    el.className = 'card'; el.setAttribute('data-tier', ''); el.style.background = '#fbf6ec';
    el.innerHTML =
      '<div class="row-head"><strong>Formule</strong><button class="btn-danger" data-remove type="button">Supprimer</button></div>' +
      '<div class="col2"><div>' + field('data-t', 'name', 'Nom', 'input', t.name) + '</div>' +
        '<div>' + field('data-t', 'price', 'Prix (ex : 55 €)', 'input', t.price) + '</div></div>' +
      '<div class="col2"><div>' + field('data-t', 'unit', 'Unité (ex : / pers)', 'input', t.unit) + '</div>' +
        '<div>' + field('data-t', 'flag', 'Badge (ex : Le plus festif — vide sinon)', 'input', t.flag) + '</div></div>' +
      field('data-t', 'tag', 'Sous-titre', 'input', t.tag) +
      '<label>Ce qui est inclus (une ligne par point)</label>' +
      '<textarea data-t="items" style="min-height:120px;">' + escHtml((t.items || []).join('\n')) + '</textarea>';
    return el;
  }

  function choiceRow(c) {
    c = c || {};
    const el = document.createElement('div');
    el.className = 'card'; el.setAttribute('data-choice', ''); el.style.padding = '14px'; el.style.background = '#fbf6ec';
    el.innerHTML =
      '<div class="row-head"><strong>Soin</strong><button class="btn-danger" data-remove type="button">Supprimer</button></div>' +
      '<div class="col2"><div>' + field('data-c', 'name', 'Nom', 'input', c.name) + '</div>' +
        '<div>' + field('data-c', 'desc', 'Description', 'input', c.desc) + '</div></div>';
    return el;
  }

  function renderExp(exp, texts) {
    exp = exp || {};
    let html = '';
    html += '<div class="card"><div class="row-head"><strong>Textes de l\'expérience</strong></div>' +
      EXP_TEXT_FIELDS.map(function (f) { return field('data-tkey', f[0], f[1], f[2], texts[f[0]]); }).join('') + '</div>';
    html += '<div class="card"><div class="row-head"><strong>Formules</strong></div><div id="expTiers"></div>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-add="tier">+ Ajouter une formule</button></div>';
    html += '<div class="card"><div class="row-head"><strong>Parenthèse beauté</strong></div>' +
      field('data-exp', 'beautyTitle', 'Titre', 'input', exp.beautyTitle) +
      field('data-exp', 'beautyLead', "Texte d'introduction", 'input', exp.beautyLead) +
      '<label style="margin-top:8px;">Soins au choix</label><div id="expChoices"></div>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-add="choice">+ Ajouter un soin</button>' +
      '<label style="margin-top:14px;">Option tatouage</label>' +
      '<textarea data-exp="tattoo">' + escHtml(exp.tattoo || '') + '</textarea></div>';
    html += '<div class="card"><div class="row-head"><strong>Conditions de réservation</strong></div>' +
      field('data-exp', 'conditionsTitle', 'Titre', 'input', exp.conditionsTitle) +
      '<label>Une condition par ligne</label>' +
      '<textarea data-exp="conditions" style="min-height:130px;">' + escHtml((exp.conditions || []).join('\n')) + '</textarea></div>';
    html += '<div class="card"><div class="row-head"><strong>Bon à savoir</strong></div>' +
      field('data-exp', 'notesTitle', 'Titre', 'input', exp.notesTitle) +
      '<label>Une information par ligne</label>' +
      '<textarea data-exp="notes" style="min-height:110px;">' + escHtml((exp.notes || []).join('\n')) + '</textarea></div>';
    expWrap.innerHTML = html;

    const tiersWrap = document.getElementById('expTiers');
    (exp.tiers && exp.tiers.length ? exp.tiers : [{}]).forEach(function (t) { tiersWrap.appendChild(tierCard(t)); });
    const choicesWrap = document.getElementById('expChoices');
    (exp.choices && exp.choices.length ? exp.choices : [{}]).forEach(function (c) { choicesWrap.appendChild(choiceRow(c)); });
  }

  function collectExp() {
    const exp = {};
    expWrap.querySelectorAll('[data-exp]').forEach(function (el) {
      const k = el.getAttribute('data-exp');
      if (k === 'conditions' || k === 'notes') {
        exp[k] = el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      } else { exp[k] = el.value.trim(); }
    });
    exp.tiers = [];
    expWrap.querySelectorAll('[data-tier]').forEach(function (card) {
      const t = {};
      card.querySelectorAll('[data-t]').forEach(function (el) {
        const k = el.getAttribute('data-t');
        if (k === 'items') t.items = el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        else t[k] = el.value.trim();
      });
      if (t.name || t.price || (t.items && t.items.length)) exp.tiers.push(t);
    });
    exp.choices = [];
    expWrap.querySelectorAll('[data-choice]').forEach(function (row) {
      const c = {};
      row.querySelectorAll('[data-c]').forEach(function (el) { c[el.getAttribute('data-c')] = el.value.trim(); });
      if (c.name || c.desc) exp.choices.push(c);
    });
    return exp;
  }

  /* ---------- Ajout / suppression ---------- */
  document.addEventListener('click', function (e) {
    const add = e.target.closest('[data-add]');
    if (add) {
      const kind = add.getAttribute('data-add');
      if (kind === 'prestation') prestaWrap.appendChild(prestaCard({}));
      else if (kind === 'ba') baWrap.appendChild(baCard({}));
      else if (kind === 'tier') document.getElementById('expTiers').appendChild(tierCard({}));
      else if (kind === 'choice') document.getElementById('expChoices').appendChild(choiceRow({}));
      return;
    }
    const rem = e.target.closest('[data-remove]');
    if (rem) { const card = rem.closest('.card'); if (card) card.remove(); }
  });

  /* ---------- Compression d'image (côté navigateur) ----------
     Redimensionne au besoin (max 2400 px sur le grand côté) et ré-encode
     en JPEG qualité 92 % — visuellement identique, bien plus léger.
     Si le résultat n'est pas plus léger que l'original, on garde l'original. */
  const MAX_SIDE = 2400;
  const JPEG_QUALITY = 0.92;

  async function compressImage(file) {
    // On ne touche pas aux formats à préserver tels quels.
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) return file;
    try {
      let source, width, height, bitmap = null;
      if (window.createImageBitmap) {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return null; });
      }
      if (bitmap) {
        source = bitmap; width = bitmap.width; height = bitmap.height;
      } else {
        const url = URL.createObjectURL(file);
        const img = await new Promise(function (res, rej) {
          const i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = url;
        });
        URL.revokeObjectURL(url);
        source = img; width = img.naturalWidth; height = img.naturalHeight;
      }
      if (!width || !height) return file;

      const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
      const w = Math.round(width * scale), h = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';        // fond blanc si transparence (PNG)
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(source, 0, 0, w, h);
      if (bitmap && bitmap.close) bitmap.close();

      const blob = await new Promise(function (res) { canvas.toBlob(res, 'image/jpeg', JPEG_QUALITY); });
      if (!blob || blob.size >= file.size) return file;   // pas plus léger → on garde l'original
      const base = (file.name.replace(/\.[^.]+$/, '') || 'photo');
      return new File([blob], base + '.jpg', { type: 'image/jpeg' });
    } catch (e) {
      return file; // en cas de souci, on envoie l'original (jamais de blocage)
    }
  }

  function fmtSize(bytes) {
    return bytes >= 1024 * 1024
      ? (bytes / 1024 / 1024).toFixed(1) + ' Mo'
      : Math.round(bytes / 1024) + ' Ko';
  }

  /* ---------- Upload d'image ---------- */
  document.addEventListener('change', async function (e) {
    const input = e.target.closest('[data-upload]');
    if (!input || !input.files || !input.files[0]) return;
    const original = input.files[0];
    const box = input.closest('.up');
    const hidden = box.querySelector('[data-field]');
    const status = box.querySelector('[data-status]');
    const thumb = input.closest('.imgfield').querySelector('[data-thumb]');
    status.textContent = 'Optimisation…';
    try {
      const file = await compressImage(original);
      status.textContent = 'Envoi en cours…';
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = sb.storage.from('media').getPublicUrl(path);
      hidden.value = data.publicUrl;
      thumb.style.backgroundImage = "url('" + data.publicUrl + "')";
      status.textContent = (file.size < original.size)
        ? 'Photo ajoutée ✓ (' + fmtSize(original.size) + ' → ' + fmtSize(file.size) + ')'
        : 'Photo ajoutée ✓';
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
      texts: {},
      experience: collectExp(),
      prestations: [],
      avantApres: []
    };
    document.querySelectorAll('[data-tkey]').forEach(function (el) {
      content.texts[el.getAttribute('data-tkey')] = el.value;
    });
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

    // Nettoyage automatique : supprime du stockage les photos qui ne sont
    // plus utilisées nulle part sur le site (évite l'accumulation).
    const removed = await cleanupOrphans(content);
    if (removed > 0) {
      saveMsg.textContent = 'Enregistré ✓ — ' + removed + ' ancienne' + (removed > 1 ? 's' : '') +
        ' photo' + (removed > 1 ? 's' : '') + ' supprimée' + (removed > 1 ? 's' : '') + ' du stockage.';
    }
  });

  /* ---------- Nettoyage des photos orphelines ---------- */
  async function cleanupOrphans(content) {
    try {
      const marker = '/storage/v1/object/public/media/';
      const used = {};
      function addUrl(u) {
        if (!u) return;
        const i = u.indexOf(marker);
        if (i !== -1) used[u.slice(i + marker.length)] = true; // ex : uploads/xxx.jpeg
      }
      addUrl(content.heroImage);
      addUrl(content.aboutImage);
      (content.prestations || []).forEach(function (p) { addUrl(p.image); });
      (content.avantApres || []).forEach(function (b) { addUrl(b.avant); addUrl(b.apres); });

      const { data: files, error } = await sb.storage.from('media').list('uploads', { limit: 1000 });
      if (error || !files) return 0;

      const toDelete = files
        .filter(function (f) { return f && f.name && f.name.charAt(0) !== '.'; })
        .map(function (f) { return 'uploads/' + f.name; })
        .filter(function (path) { return !used[path]; });

      if (!toDelete.length) return 0;
      const { error: delErr } = await sb.storage.from('media').remove(toDelete);
      if (delErr) return 0;
      return toDelete.length;
    } catch (e) {
      return 0;
    }
  }

  /* ---------- Utilitaires ---------- */
  function val(card, field) {
    const el = card.querySelector('[data-field="' + field + '"]');
    return el ? el.value.trim() : '';
  }
  function escAttr(s) { return String(s || '').replace(/"/g, '&quot;'); }
  function escHtml(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  refresh();
})();
