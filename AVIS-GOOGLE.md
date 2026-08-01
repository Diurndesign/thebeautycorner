# Avis Google (hero + section Avis)

Le site affiche la **note Google** et les **derniers avis** en direct : dans
le hero (l'avis qui défile + la note) et dans la section « Avis ». Tant que
ce n'est pas configuré, il montre des avis par défaut (aucun bug).

Ça marche via une petite fonction serverless `api/reviews.js` (déjà dans le
projet) qui interroge Google et **met le résultat en cache 6 h** → l'API
Google n'est appelée que quelques fois par jour (**coût ~0 €**).

## Mise en place (une fois)

### 1. Récupérer le « Place ID » de la fiche Google
- Outil : https://developers.google.com/maps/documentation/places/web-service/place-id
- Chercher **The Beauty Corner by Alex** (Nice) → copier le **Place ID**.

### 2. Créer une clé API Google
1. https://console.cloud.google.com → créer un projet.
2. **APIs & Services → Library** → activer **Places API**.
3. **APIs & Services → Credentials** → **Create credentials → API key**.
4. **Restreindre la clé** (recommandé) : la limiter à l'API « Places API ».
5. Activer la **facturation** (carte obligatoire — voir le plafond ci-dessous
   pour garantir 0 €).

### 3. Garantir 0 € (plafond)
- **APIs & Services → Quotas** : limiter les requêtes (ex. 100 / jour).
- **Billing → Budgets & alerts** : créer une alerte à 1 €.
  → Avec le cache, on reste très en dessous ; la facturation ne peut pas
  déraper.

### 4. Renseigner les variables dans Vercel
Vercel → le projet → **Settings → Environment Variables**, ajouter :

| Nom               | Valeur                    |
|-------------------|---------------------------|
| `GOOGLE_API_KEY`  | la clé API créée à l'étape 2 |
| `GOOGLE_PLACE_ID` | le Place ID de l'étape 1  |

Puis **Redeploy** (Deployments → … → Redeploy). C'est en ligne.

## Bon à savoir
- Google renvoie **jusqu'à 5 avis** (les plus pertinents) + la note moyenne
  et le nombre total d'avis. Parfait pour un hero qui défile.
- Les avis se rafraîchissent automatiquement (cache de 6 h).
- Rien à gérer côté CMS pour les avis : c'est automatique.
