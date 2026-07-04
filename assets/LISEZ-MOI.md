# Comment changer les photos et vidéos du site

Tout se règle dans **un seul fichier** : `data/content.js`
(ouvrez-le, il est entièrement commenté en français).

## 📸 Photos « Avant / Après »

Les fichiers sont dans le dossier **`assets/avant-apres/`** :

| Prestation           | Fichier AVANT              | Fichier APRÈS              |
|----------------------|----------------------------|----------------------------|
| Dermopigmentation    | `sourcils-avant.jpg`       | `sourcils-apres.jpg`       |
| Rehaussement de cils | `cils-avant.jpg`           | `cils-apres.jpg`           |
| Ongles               | `ongles-avant.jpg`         | `ongles-apres.jpg`         |
| Soin de la peau      | `peau-avant.jpg`           | `peau-apres.jpg`           |
| Détatouage           | `detatouage-avant.jpg`     | `detatouage-apres.jpg`     |

👉 **Pour changer une image** : déposez votre photo à la place du fichier
correspondant **en gardant exactement le même nom**. Rien d'autre à faire.

- Format conseillé : **JPG**, orientation paysage (4:3), env. 900×675 px.
- Pour ajouter/enlever une prestation : modifiez la liste `avantApres`
  dans `data/content.js`.

## 📱 Instagram

Les aperçus sont dans **`assets/instagram/`** : `post-1.jpg`, `post-2.jpg`,
`post-3.jpg` (format carré, env. 600×600 px).

- Vous pouvez mettre une **vidéo** à la place : déposez `post-1.mp4` et
  dans `data/content.js`, remplacez la ligne par
  `{ type: "video", src: "assets/instagram/post-1.mp4" }`.
- Le **nombre d'abonnés** se change à la ligne `abonnes:` du même fichier.

> ℹ️ Plus tard, une interface d'administration permettra de faire tout ça
> sans toucher aux fichiers.
