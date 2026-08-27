// ============================================================
// Image du hero — fonction serverless Vercel
//
// Sert DIRECTEMENT les octets de la photo du hero actuelle (lue en direct
// depuis Supabase), sous une URL STABLE : /api/hero-image.
//
// Pourquoi servir les octets plutôt que rediriger ?
//   → Le préchargement (<link rel="preload" as="image">) devient fiable et
//     démarre le téléchargement immédiatement (une redirection ajoutait un
//     aller-retour et n'était pas toujours prise en compte par le navigateur).
//   → L'og:image, le préchargement et le fond CSS pointent tous vers cette
//     même URL stable, toujours synchronisée avec la photo choisie dans
//     l'admin : aucune URL à maintenir à la main, jamais d'erreur 400.
//
// La réponse est mise en cache sur le CDN Vercel (s-maxage) : après le 1er
// appel elle est servie depuis le edge, comme un fichier statique, et
// rafraîchie régulièrement pour refléter un changement de photo.
//
// Variables d'environnement (optionnelles — valeurs publiques par défaut,
// clé « anon » en lecture seule, identique à js/config.js) :
//   SUPABASE_URL       → URL du projet Supabase
//   SUPABASE_ANON_KEY  → clé anon (lecture seule)
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ssrjzqprpovhuyaumyuw.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmp6cXBycG92aHV5YXVteXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MTMxMTIsImV4cCI6MjEwMTE4OTExMn0.z1X8rvme4x7bYEu2DyKFzSyzdSUFKMuvidkqpOPG_jA';

// Repli si Supabase est momentanément injoignable : la photo actuelle connue.
const FALLBACK_IMAGE = 'https://ssrjzqprpovhuyaumyuw.supabase.co/storage/v1/object/public/media/uploads/1787674425918-rhkgvp.webp';

// Limite de sécurité : au-delà, on redirige au lieu de bufferiser (limite
// de taille de réponse des fonctions Vercel ~4,5 Mo). En pratique l'admin
// compresse les uploads, donc ce cas ne devrait jamais se produire.
const MAX_PROXY_BYTES = 4 * 1024 * 1024;

const CACHE = 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400';

export default async function handler(req, res) {
  let target = FALLBACK_IMAGE;

  // 1) URL de la photo actuelle du hero
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/site_content?select=data&id=eq.1', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY }
    });
    if (r.ok) {
      const rows = await r.json();
      const hero = rows && rows[0] && rows[0].data && rows[0].data.heroImage;
      if (typeof hero === 'string' && /^https?:\/\//.test(hero)) target = hero;
    }
  } catch (e) { /* on garde le repli */ }

  // 2) On sert les octets de l'image (avec repli sur redirection en cas de souci)
  try {
    const img = await fetch(target);
    if (!img.ok) throw new Error('image HTTP ' + img.status);

    const len = parseInt(img.headers.get('content-length') || '0', 10);
    if (len && len > MAX_PROXY_BYTES) {
      // Trop volumineuse : on laisse le navigateur la charger en direct.
      res.setHeader('Cache-Control', CACHE);
      res.setHeader('Location', target);
      return res.status(302).end();
    }

    const buf = Buffer.from(await img.arrayBuffer());
    res.setHeader('Content-Type', img.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', CACHE);
    return res.status(200).send(buf);
  } catch (e) {
    // Dernier recours : redirection vers l'image (jamais d'échec dur).
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', target);
    return res.status(302).end();
  }
}
