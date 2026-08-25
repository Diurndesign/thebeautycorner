// ============================================================
// Image du hero — fonction serverless Vercel
//
// Redirige (302) vers l'URL ACTUELLE de la photo du hero, lue en direct
// depuis Supabase. Ainsi l'og:image, le préchargement et le fond CSS du
// hero pointent tous vers une seule URL STABLE (/api/hero-image) qui reste
// toujours synchronisée avec la photo choisie dans l'admin.
//
// → Plus aucune URL à mettre à jour à la main quand Alex change la photo,
//   et plus jamais d'erreur 400 / d'aperçu de partage cassé.
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
// (Sert uniquement de filet de sécurité ; la valeur normale vient de la base.)
const FALLBACK_IMAGE = 'https://ssrjzqprpovhuyaumyuw.supabase.co/storage/v1/object/public/media/uploads/1787674425918-rhkgvp.webp';

export default async function handler(req, res) {
  let target = FALLBACK_IMAGE;

  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/site_content?select=data&id=eq.1', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY }
    });
    if (r.ok) {
      const rows = await r.json();
      const hero = rows && rows[0] && rows[0].data && rows[0].data.heroImage;
      if (typeof hero === 'string' && /^https?:\/\//.test(hero)) target = hero;
    }
    // Cache CDN Vercel : la redirection est servie depuis le edge pendant
    // 10 min puis rafraîchie en arrière-plan → Supabase n'est sollicité
    // qu'occasionnellement et la redirection reste quasi instantanée.
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
  }

  res.setHeader('Location', target);
  return res.status(302).end();
}
