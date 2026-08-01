# Comment changer les photos et vidéos du site

Tout se règle dans **un seul fichier** : `data/content.json`
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
  dans `data/content.json`.

## 📱 Instagram

Le feed Instagram est **géré par Behold** (behold.so) : il se met à jour
tout seul à chaque publication. Il n'y a donc **rien à faire ici** pour
Instagram (ni dans les fichiers, ni dans le CMS).

## 🗓️ Lien de réservation Planity

L'adresse Planity utilisée par tous les boutons « Prendre rendez-vous » /
« Réserver » est à la ligne `planity` de `data/content.json` (modifiable
aussi dans le CMS). À changer uniquement si l'URL Planity évolue.

> ℹ️ Le CMS (Pages CMS) permet de faire tout ça depuis une interface, sans
> toucher aux fichiers.
