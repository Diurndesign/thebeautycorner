/* ============================================================
   CONTENU ÉDITABLE — The Beauty Corner by Alex
   ------------------------------------------------------------
   👉 C'est ICI qu'on change facilement les photos / vidéos / textes.

   POUR CHANGER UNE PHOTO :
   - Déposez votre image dans le dossier assets/ (voir ci-dessous) en
     GARDANT LE MÊME NOM DE FICHIER que l'exemple → rien d'autre à faire.
   - OU changez l'adresse ci-dessous par la vôtre (fichier local ou URL).

   Où déposer les photos :
   - Avant / Après → dossier  assets/avant-apres/
   - Instagram     → dossier  assets/instagram/

   (La future section Admin viendra écrire automatiquement dans ce
    même fichier — rien d'autre à modifier ailleurs.)
   ============================================================ */
window.SITE_CONTENT = {

  /* ---------- Galerie AVANT / APRÈS ----------
     Une entrée = une sous-catégorie (onglet).
     Remplacez les fichiers dans assets/avant-apres/ (mêmes noms), ou
     modifiez les chemins ci-dessous. Ajoutez/retirez des blocs librement. */
  avantApres: [
    {
      categorie: "Dermopigmentation",
      avant: "assets/avant-apres/sourcils-avant.jpg",
      apres: "assets/avant-apres/sourcils-apres.jpg"
    },
    {
      categorie: "Rehaussement de cils",
      avant: "assets/avant-apres/cils-avant.jpg",
      apres: "assets/avant-apres/cils-apres.jpg"
    },
    {
      categorie: "Ongles",
      avant: "assets/avant-apres/ongles-avant.jpg",
      apres: "assets/avant-apres/ongles-apres.jpg"
    },
    {
      categorie: "Soin de la peau",
      avant: "assets/avant-apres/peau-avant.jpg",
      apres: "assets/avant-apres/peau-apres.jpg"
    },
    {
      categorie: "Détatouage",
      avant: "assets/avant-apres/detatouage-avant.jpg",
      apres: "assets/avant-apres/detatouage-apres.jpg"
    }
  ],

  /* ---------- Section INSTAGRAM ----------
     abonnes : texte affiché (deviendra automatique avec le widget live).
     posts   : jusqu'à 3 aperçus. Chaque post est une image OU une vidéo :
       { type: "image", src: "assets/instagram/post-1.jpg" }
       { type: "video", src: "assets/instagram/post-1.mp4" }  (vidéo en boucle, muette) */
  instagram: {
    handle: "@thebeautycorner.byalex",
    url: "https://www.instagram.com/thebeautycorner.byalex",
    abonnes: "1 200",
    posts: [
      { type: "image", src: "assets/instagram/post-1.jpg" },
      { type: "image", src: "assets/instagram/post-2.jpg" },
      { type: "image", src: "assets/instagram/post-3.jpg" }
    ]
  }

};
