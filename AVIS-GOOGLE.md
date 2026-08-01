# Avis Google (hero + section Avis)

Le site affiche la **note Google** et les **derniers avis** en direct : dans
le hero (l'avis qui défile + la note) et dans la section « Avis ». Tant que
ce n'est pas configuré, il montre des avis par défaut (aucun bug).

Ça marche via une petite fonction serverless `api/reviews.js` (déjà dans le
projet) qui interroge Google et **met le résultat en cache 6 h** → l'API
Google n'est appelée que quelques fois par jour (**coût ~0 €**).

## Mise en place (une fois) — une seule chose obligatoire : la clé API

Bonne nouvelle : **le Place ID n'est plus obligatoire**. La fonction trouve
la fiche automatiquement (recherche « The Beauty Corner by Alex, 42 rue
Arson, 06300 Nice »). Il suffit donc de créer **une clé API**.

### 1. Créer une clé API Google
1. https://console.cloud.google.com → sélectionner (ou créer) le projet.
2. **APIs & Services → Library** → activer **Places API (New)**.
   ⚠️ Bien prendre la version **« (New) »**, pas l'ancienne.
3. **APIs & Services → Credentials** → **Create credentials → API key**.
4. **Restreindre la clé** (recommandé) : la limiter à « Places API (New) ».
5. Activer la **facturation** (carte obligatoire — voir le plafond ci-dessous
   pour garantir 0 €).

### 2. Garantir 0 € (plafond)
- **APIs & Services → Quotas** : limiter les requêtes (ex. 100 / jour).
- **Billing → Budgets & alerts** : créer une alerte à 1 €.
  → Avec le cache, on reste très en dessous ; la facturation ne peut pas
  déraper.

### 3. Renseigner la variable dans Vercel
Vercel → le projet → **Settings → Environment Variables**, ajouter :

| Nom               | Valeur                       | Obligatoire |
|-------------------|------------------------------|-------------|
| `GOOGLE_API_KEY`  | la clé API créée à l'étape 1 | **Oui**     |
| `GOOGLE_PLACE_ID` | le Place ID (si connu)       | Non         |

Puis **Redeploy** (Deployments → … → Redeploy). C'est en ligne.

> **Optionnel — pin par Place ID** : si un jour la recherche automatique
> tombe sur la mauvaise fiche, ajoute `GOOGLE_PLACE_ID` (outil :
> https://developers.google.com/maps/documentation/places/web-service/place-id)
> pour cibler la fiche exacte. Sinon, ne t'en occupe pas.

## Bon à savoir
- Google renvoie **jusqu'à 5 avis** (les plus pertinents) + la note moyenne
  et le nombre total d'avis. Parfait pour un hero qui défile.
- Les avis se rafraîchissent automatiquement (cache de 6 h).
- Rien à gérer côté CMS pour les avis : c'est automatique.
