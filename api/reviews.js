// ============================================================
// Avis Google — fonction serverless Vercel
// Utilise la « Places API (New) » de Google, avec cache CDN.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment
// Variables) :
//   GOOGLE_API_KEY   → clé API Google Cloud (Places API (New) activée)
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
    const url = 'https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId) + '?languageCode=fr';

    const r = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription'
      }
    });
    const data = await r.json();

    if (!r.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ configured: true, ok: false, error: (data && data.error && data.error.status) || ('HTTP ' + r.status) });
    }

    const avis = (data.reviews || [])
      .filter(function (rv) { return rv && rv.text && rv.text.text && (rv.rating || 5) >= 4; })
      .map(function (rv) {
        return {
          texte: rv.text.text,
          auteur: (rv.authorAttribution && rv.authorAttribution.displayName) || 'Client',
          note: rv.rating || 5,
          source: 'Google',
          date: rv.relativePublishTimeDescription || ''
        };
      });

    // Cache CDN Vercel : servi tel quel 6 h, rafraîchi en arrière-plan
    // → l'API Google n'est appelée que quelques fois par jour (coût ~0).
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

    return res.status(200).json({
      configured: true,
      ok: true,
      note: typeof data.rating === 'number' ? data.rating : null,
      total: data.userRatingCount || 0,
      avis: avis
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: true, ok: false, error: String(e) });
  }
}
