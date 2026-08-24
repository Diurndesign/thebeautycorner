# Formulaire de contact → email d'Alexandra

Les messages envoyés depuis le formulaire de la section **Contact** arrivent
directement dans une boîte mail, via le service gratuit **Web3Forms**.
L'adresse email n'apparaît **pas** dans le code : elle est liée à une *clé
d'accès* publique.

## Mise en route (à faire UNE fois)

1. Aller sur **https://web3forms.com**.
2. Saisir l'**email pro d'Alexandra** (celui qui doit recevoir les demandes)
   dans le champ « Create your Access Key », puis valider.
3. Web3Forms envoie un email de confirmation à cette adresse → **cliquer sur
   le lien** pour activer, et **copier la clé d'accès** (`access_key`) fournie.
4. Coller cette clé dans **`js/config.js`** :
   ```js
   window.WEB3FORMS_KEY = 'la-cle-copiee-ici';
   ```
5. Committer + pousser. C'est terminé : chaque envoi du formulaire arrive
   dans la boîte mail d'Alexandra.

> Tant que la clé est vide, le formulaire reste en « mode maquette » (il
> affiche un message de succès mais n'envoie pas d'email). Dès que la clé
> est renseignée, l'envoi réel est activé automatiquement.

## Ce qui est envoyé

Nom, email du visiteur, prestation souhaitée et message. Un champ piège
anti-robot (`_gotcha`) filtre les spams automatiques.

## Changer l'adresse de réception plus tard

Il suffit de générer une nouvelle clé sur web3forms.com avec la nouvelle
adresse et de remplacer `WEB3FORMS_KEY` dans `js/config.js`.
