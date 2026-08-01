# Espace d'administration — changer les photos/textes soi-même

Le site est relié à un petit outil d'administration (**Pages CMS**) qui
permet à Alex de **changer les photos et textes elle-même**, sans toucher
au code. Chaque modification est **enregistrée** et mise en ligne
automatiquement.

## Comment ça marche (le principe)

```
Alex se connecte  →  change une photo / un texte  →  clique « Save »
        →  la modif est enregistrée dans le projet (GitHub)
        →  le site se redéploie tout seul (Vercel)
        →  ~1 minute après, la nouvelle image est en ligne pour tout le monde ✅
```

## Mise en place (à faire UNE fois)

**Pré-requis** : le site doit être déployé sur **Vercel** et relié au dépôt
GitHub `Diurndesign/thebeautycorner` (redéploiement automatique activé).

1. Aller sur **https://app.pagescms.org**
2. Cliquer **« Sign in with GitHub »** et se connecter.
3. Autoriser Pages CMS puis **installer son application** sur le dépôt
   `Diurndesign/thebeautycorner` (bouton « Configure » → cocher le dépôt).
4. De retour dans Pages CMS, ouvrir le dépôt : il lit le fichier
   `.pages.yml` et affiche automatiquement l'éditeur **« Contenu du site »**.

C'est prêt. Rien à coder : toute la configuration est déjà dans le dépôt
(`.pages.yml`).

## Donner l'accès à Alex

Deux possibilités :
- **Simple** : Alex utilise le compte GitHub propriétaire du dépôt.
- **Propre** : ajouter Alex comme *collaboratrice* du dépôt GitHub
  (Settings → Collaborators), puis elle se connecte à app.pagescms.org
  avec **son** compte GitHub.

## Utilisation au quotidien

1. Aller sur **https://app.pagescms.org** et ouvrir le projet.
2. Menu **« Contenu du site »**.
3. Section **Galerie Avant / Après** : pour chaque prestation, déposer la
   photo *Avant* et la photo *Après*. On peut ajouter/retirer des
   prestations avec les boutons + / −.
4. Section **Instagram** : changer le nombre d'abonnés, et déposer jusqu'à
   3 photos **ou vidéos** (choisir le type « image » ou « video »).
5. Cliquer **« Save »** en haut à droite.
6. Attendre ~1 minute : le site affiche les nouvelles images.

> 💡 On peut aussi, plus tard, ajouter à cet éditeur les **textes** des
> sections et les **couleurs** du site — tout passe par le même fichier
> `data/content.json`.

## Sans le CMS (méthode manuelle, toujours possible)

Voir `assets/LISEZ-MOI.md` : il suffit de remplacer les fichiers images
dans `assets/avant-apres/` et `assets/instagram/` en gardant les mêmes noms.
