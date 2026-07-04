/* ============================================================
   CONTENU ÉDITABLE — The Beauty Corner by Alex
   ------------------------------------------------------------
   👉 C'est ICI qu'on change facilement les photos / vidéos / textes.
   Remplacez simplement les adresses d'images par vos propres photos :
     - soit une URL externe : "https://…/ma-photo.jpg"
     - soit un fichier déposé dans le dossier assets :
       "assets/avant-apres/sourcils-avant.jpg"

   (La future section Admin viendra écrire automatiquement dans ce
    même fichier — rien d'autre à modifier ailleurs.)
   ============================================================ */
window.SITE_CONTENT = {

  /* ---------- Galerie AVANT / APRÈS ----------
     Une entrée = une sous-catégorie (onglet).
     Ajoutez / retirez / réordonnez librement les blocs ci-dessous. */
  avantApres: [
    {
      categorie: "Dermopigmentation",
      avant: "https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?auto=format&fit=crop&w=900&h=675&q=80",
      apres: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&h=675&q=80"
    },
    {
      categorie: "Rehaussement de cils",
      avant: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=900&h=675&q=80",
      apres: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&h=675&q=80"
    },
    {
      categorie: "Ongles",
      avant: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=900&h=675&q=80",
      apres: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&h=675&q=80"
    },
    {
      categorie: "Soin de la peau",
      avant: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&h=675&q=80",
      apres: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&h=675&q=80"
    },
    {
      categorie: "Détatouage",
      avant: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&h=675&q=80",
      apres: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&h=675&q=80"
    }
  ],

  /* ---------- Section INSTAGRAM ----------
     abonnes : texte affiché (sera automatique quand le widget live sera branché).
     posts   : jusqu'à 3 aperçus. Chaque post peut être une image OU une vidéo :
       { type: "image", src: "…" }
       { type: "video", src: "…" }   (vidéo mp4, lecture en boucle silencieuse) */
  instagram: {
    handle: "@thebeautycorner.byalex",
    url: "https://www.instagram.com/thebeautycorner.byalex",
    abonnes: "1 200",
    posts: [
      { type: "image", src: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&crop=faces,center&w=600&h=600&q=80" },
      { type: "image", src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&crop=faces,center&w=600&h=600&q=80" },
      { type: "image", src: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&crop=faces,center&w=600&h=600&q=80" }
    ]
  }

};
