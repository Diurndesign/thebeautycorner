// ============================================================
// Avis Google — fonction serverless Vercel
// Utilise la « Places API (New) » de Google, avec cache CDN.
//
// Variables d'environnement (Vercel → Settings → Environment Variables) :
//   GOOGLE_API_KEY     → clé API Google Cloud (Places API (New) activée) [REQUISE]
//   GOOGLE_PLACE_ID    → identifiant de la fiche Google (optionnel)
//   GOOGLE_PLACE_QUERY → recherche texte de la fiche (optionnel)
//
// Fonctionnement :
//   - Si GOOGLE_PLACE_ID est défini → lecture directe de la fiche.
//   - Sinon → recherche texte automatique (nom + adresse du salon), donc
//     seule la clé API est indispensable.
//   - Sans clé → { configured: false } et le site garde ses avis par
//     défaut (aucun bug).
// ============================================================

const DEFAULT_QUERY = 'The Beauty Corner by Alex, 42 rue Arson, 06300 Nice';
const FIELDS = 'rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,reviews.googleMapsUri';

export default async function handler(req, res) {
  const key = process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const query = process.env.GOOGLE_PLACE_QUERY || DEFAULT_QUERY;

  if (!key) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: false });
  }

  try {
    let place;

    if (placeId) {
      // Lecture directe de la fiche par Place ID.
      const url = 'https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId) + '?languageCode=fr';
      const r = await fetch(url, {
        headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELDS }
      });
      const data = await r.json();
      if (!r.ok) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ configured: true, ok: false, error: (data && data.error && data.error.status) || ('HTTP ' + r.status), detail: (data && data.error && data.error.message) || null });
      }
      place = data;
    } else {
      // Recherche texte : seule la clé API est nécessaire.
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.' + FIELDS.split(',').join(',places.')
        },
        body: JSON.stringify({ textQuery: query, languageCode: 'fr', maxResultCount: 1 })
      });
      const data = await r.json();
      if (!r.ok) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ configured: true, ok: false, error: (data && data.error && data.error.status) || ('HTTP ' + r.status), detail: (data && data.error && data.error.message) || null });
      }
      place = (data.places && data.places[0]) || null;
      if (!place) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ configured: true, ok: false, error: 'NOT_FOUND' });
      }
    }

    const avis = (place.reviews || [])
      .filter(function (rv) { return rv && rv.text && rv.text.text && (rv.rating || 5) >= 4; })
      .map(function (rv) {
        return {
          texte: rv.text.text,
          auteur: (rv.authorAttribution && rv.authorAttribution.displayName) || 'Client',
          note: rv.rating || 5,
          source: 'Google',
          date: rv.relativePublishTimeDescription || '',
          // Lien direct vers cet avis précis sur Google Maps (repli : la fiche)
          lien: rv.googleMapsUri || place.googleMapsUri || null
        };
      });

    // Cache CDN Vercel : servi tel quel 6 h, rafraîchi en arrière-plan
    // → l'API Google n'est appelée que quelques fois par jour (coût ~0).
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

    return res.status(200).json({
      configured: true,
      ok: true,
      note: typeof place.rating === 'number' ? place.rating : null,
      total: place.userRatingCount || 0,
      lienFiche: place.googleMapsUri || null,
      avis: avis
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ configured: true, ok: false, error: String(e) });
  }
}
