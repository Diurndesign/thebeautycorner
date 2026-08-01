// ============================================================
// Avis Google — fonction serverless Vercel
// Récupère la note et les avis de la fiche Google, avec cache CDN.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment
// Variables) :
//   GOOGLE_API_KEY   → clé API Google Cloud (Places API activée)
//   GOOGLE_PLACE_ID  → identifiant de la fiche Google (Place ID)
//
// Tant que ces variables ne sont pas définies, la fonction renvoie
// { configured: false } et le site garde ses avis par défaut (aucun bug).
// ============================================================
export default async function handler(req, res) {
  const key = process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: false });
  }

  try {
    const url =
      'https://maps.googleapis.com/maps/api/place/details/json' +
      '?place_id=' + encodeURIComponent(placeId) +
      '&fields=rating,user_ratings_total,reviews' +
      '&reviews_sort=newest' +
      '&language=fr' +
      '&key=' + encodeURIComponent(key);

    const r = await fetch(url);
    const data = await r.json();

    if (data.status !== 'OK') {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ configured: true, ok: false, error: data.status });
    }

    const result = data.result || {};
    const avis = (result.reviews || [])
      .filter(function (rv) { return rv && rv.text && rv.rating >= 4; })
      .map(function (rv) {
        return {
          texte: rv.text,
          auteur: rv.author_name,
          note: rv.rating,
          source: 'Google',
          date: rv.relative_time_description || ''
        };
      });

    // Cache CDN Vercel : servi tel quel 6 h, rafraîchi en arrière-plan
    // → l'API Google n'est appelée que quelques fois par jour (coût ~0).
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

    return res.status(200).json({
      configured: true,
      ok: true,
      note: typeof result.rating === 'number' ? result.rating : null,
      total: result.user_ratings_total || 0,
      avis: avis
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: true, ok: false, error: String(e) });
  }
}
