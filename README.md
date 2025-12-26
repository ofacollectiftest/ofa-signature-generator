# OFA — Générateur de signature Gmail (Option B / Next.js)

MVP : **photo → recadrage rond → upload GitHub → génération signature HTML → copier/coller dans Gmail**.

## 1) Prérequis
- Node.js 18+ (recommandé)
- Un repo GitHub **public** pour héberger les images (sinon les destinataires ne verront pas la photo)
- Un token GitHub (fine‑grained recommandé) avec accès **Contents: Read/Write** sur ce repo

## 2) Recommandations repo GitHub (propre & conventionnel)
Créer un repo dédié aux assets de signature, par ex :
- `ofa-signatures-assets` (public)
- branche `main`
- dossiers :
  - `members/` (photos membres)
  - `icons/` (logos réseaux)
  - `README.md` (règles + conventions)

Conventions:
- **ne pas** mettre l’email dans le nom de fichier.
- nommage conseillé : `photo_<prenom-nom>_<timestamp>.png` (automatique dans l’app)
- si vous changez la photo : uploadez une nouvelle version (nouveau fichier) et régénérez la signature.

> Note RGPD : GitHub garde un historique. Pour une suppression “forte”, il peut falloir réécrire l’historique (à traiter plus tard).

## 3) Configuration (.env)
Copier `.env.example` vers `.env.local` et remplir :

```bash
cp .env.example .env.local
```

Variables:
- `GITHUB_TOKEN` : token GitHub (fine‑grained, limité au repo)
- `GITHUB_OWNER` : owner/org
- `GITHUB_REPO` : repo
- `GITHUB_BRANCH` : `main`
- `GITHUB_PATH_PREFIX` : `members`
- `ASSET_BASE_URL` : optionnel (si GitHub Pages / CDN). Sinon `raw.githubusercontent.com` est utilisé.

## 4) Lancer en local
```bash
npm install
npm run dev
```
Puis ouvrir http://localhost:3000

## 5) Procédure utilisateur (copier/coller Gmail)
1. Remplir les infos (prénom, nom, fonction, email, tel).
2. Uploader une photo → recadrer (rond) → valider.
3. Cliquer **Uploader sur GitHub**.
4. Dans la colonne de droite, cliquer **Copier la signature (rendu)**.
5. Aller sur Gmail :
   - ⚙️ **Paramètres** → **Voir tous les paramètres**
   - Onglet **Général** → section **Signature**
   - **Créer nouveau** (ou modifier) → cliquer dans le champ signature → **Ctrl+V** (coller)
   - Descendre et **Enregistrer les modifications**

### Si “Copier la signature (rendu)” ne marche pas
- utiliser **Télécharger .html**
- ouvrir le fichier .html dans le navigateur
- sélectionner uniquement la signature affichée
- copier (Ctrl+C) puis coller dans Gmail

## 6) Notes de compatibilité (photo ronde)
Ce projet exporte un **PNG déjà masqué en rond** (transparence), ce qui est le plus stable sur les clients email.
On met quand même `border-radius:999px` en CSS en “ceinture+bretelles”.

## 7) Sécurité
- ne jamais commiter `.env.local`
- token GitHub : permissions minimales, rotation si besoin

## 8) Dépannage rapide
- Upload GitHub échoue : vérifier token + owner/repo/branch + repo public.
- La photo ne s’affiche pas chez les destinataires : vérifier que l’URL `raw.githubusercontent.com/...` est accessible publiquement.
- Gmail modifie le rendu : normal (sanitisation). Garder un HTML simple.
