# Espace d'administration (backend Supabase)

Le contenu du site (lien Planity, prestations, galerie Avant/Après) est
stocké dans **Supabase** (base de données + stockage d'images). Alex le
modifie depuis un espace d'admin protégé par mot de passe, et les
changements sont **visibles en ligne immédiatement** (aucun redéploiement,
aucun GitHub).

- **Page d'admin** : `https://<le-site>/admin/`
- **Projet Supabase** : `thebeautycorner` (organisation Diurndesign)
- **Table** : `site_content` (une ligne, colonne `data` en JSON)
- **Stockage images** : bucket `media` (public en lecture)

## Créer le compte de connexion d'Alex (à faire UNE fois)

1. Ouvrir le **dashboard Supabase** → projet **thebeautycorner**.
2. Menu **Authentication → Users → Add user**.
3. Renseigner **email + mot de passe**, cocher **Auto Confirm User**.
4. Communiquer ces identifiants à Alex.

> Par défaut, l'inscription libre est désactivée : seuls les comptes créés
> ici peuvent se connecter. La page `/admin` est publique mais inutile sans
> identifiants (et toute écriture est bloquée par les règles de sécurité RLS).

## Utilisation au quotidien (pour Alex)

1. Aller sur **`/admin`**, se connecter (email + mot de passe).
2. Modifier :
   - **Réservation** : le lien Planity.
   - **Photos du site** : la grande photo d'accueil (Hero) et la photo
     de la section « À propos ».
   - **Prestations** : titre, description, image de chaque carte (+ / −).
   - **Galerie Avant / Après** : nom + photo avant + photo après (+ / −).
   - Les images se déposent via « Choisir un fichier » (envoi automatique).
3. Cliquer **« Enregistrer »**. Les changements apparaissent en ligne en
   quelques secondes.

## Notes techniques

- Le site lit le contenu depuis Supabase ; en cas d'indisponibilité, il
  se rabat automatiquement sur `data/content.json` (aucun bug).
- Clés dans `js/config.js` : ce sont les clés **publiques** (anon),
  volontairement exposables — l'écriture est protégée par RLS + connexion.
- Instagram = géré par Behold. Avis = Google (Places API). Ces deux-là ne
  passent pas par l'admin.
