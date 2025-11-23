**HEYAMA Objects UI (Next.js)**

**Aperçu**
- Interface minimale pour créer, lister et afficher des “Objects” via une API REST.
- Mises à jour en temps réel avec Socket.IO sur le namespace `/objects`, avec fallback manuel.
- Upload d’images via URL présignée (style S3) et rendu optimisé avec `next/image`.

**Stack Technique**
- Next.js `16.0.3` (App Router) + React `19` + Tailwind CSS `v4`.
- Socket.IO client `4.8.1`.
- Gestionnaire de paquets: `pnpm`.

**Fonctionnalités**
- Créer un objet: titre, description, image du device; upload via URL présignée, puis création via l’API.
- Lister les objets: lecture depuis l’API, images via URLs publiques S3/MinIO, mises à jour temps réel.
- Voir un objet: page simple affichant titre, description, image et date.
- Realtime: écoute des événements `objects.created` et `objects.deleted`. Si le WebSocket est indisponible, une bannière s’affiche avec rafraîchissement HTTP et “Réessayer WebSocket”.

**Prérequis**
- API sur `http://localhost:3000` (fallback possible `http://localhost:3001`). Endpoints ci‑dessous.
- Si l’API occupe `3000`, lance le serveur Next en dev sur `3001`.

**Installation**
- `pnpm install`
- Variable optionnelle:
  - `NEXT_PUBLIC_API_BASE=http://localhost:3000`

**Exécution**
- Démarrer Next.js (sur un port différent de l’API):
  - `pnpm dev -- -p 3001`
- Accueil: `http://localhost:3001/`

**Helpers API**
- Détection automatique de la base entre `3000` et `3001` avec timeout 2s:
  - `lib/api.ts:15` sonde et met en cache la base.
- Endpoints utilisés:
  - `listObjects()` → `GET /objects` `lib/api.ts:36`
  - `getObject(id)` → `GET /objects/:id` `lib/api.ts:42`
  - `getUploadUrl(filename, contentType)` → `POST /objects/upload-url` `lib/api.ts:48`
  - `createObject({ title, description, imageUrl })` → `POST /objects` `lib/api.ts:57`
  - `deleteObject(id)` → `DELETE /objects/:id` `lib/api.ts:66`

**Flux d’Upload**
- Étape 1: générer l’URL présignée
  - `POST /objects/upload-url` avec `filename`, `contentType`.
- Étape 2: upload du fichier sur S3/MinIO via `uploadUrl` (`PUT` avec `Content-Type`).
- Étape 3: création de l’objet avec le `publicUrl`.
  - Voir `app/objects/new/page.tsx:20–40`.

**Temps Réel**
- Namespace Socket: base API + `io(base + "/objects")` (transport `websocket` uniquement, timeout 2s).
  - Client: `lib/socket.ts:10`.
- Événements:
  - `objects.created` (objet complet) → insertion en tête `app/objects/page.tsx:62`.
  - `objects.deleted` (`{ id }`) → filtrage `app/objects/page.tsx:65`.
- Fallback manuel:
  - Bannière avec indicateur, boutons `Rafraîchir` (HTTP) et `Réessayer WebSocket` `app/objects/page.tsx:86–94`.

**Optimisation des Images**
- `next/image` avec `fill` et `sizes` responsifs:
  - Liste: `app/objects/page.tsx:97`.
  - Détail: `app/objects/[id]/page.tsx:39`.
- `next.config.mjs` autorise S3 et ton hôte MinIO:
  - `**.amazonaws.com` et `demo-bucket-minio.dubabf.easypanel.host`.
  - Pour un autre hôte, ajoute un `remotePatterns` avec `protocol`, `hostname`, `port`, `pathname` exacts.

**Routage & Pages**
- Accueil: liens vers la liste et la création `app/page.tsx:11–13`.
- Liste: temps réel, suppression, navigation `app/objects/page.tsx:73–109`.
- Création: formulaire + upload `app/objects/new/page.tsx:1–75`.
- Détail: `React.use()` pour `params` et affichage `app/objects/[id]/page.tsx:9–41`.

**Composants UI**
- Composants légers inspirés shadcn:
  - Button `components/ui/button.tsx`
  - Input `components/ui/input.tsx`
  - Textarea `components/ui/textarea.tsx`
  - Label `components/ui/label.tsx`
  - Card `components/ui/card.tsx`
  - Spinner `components/ui/spinner.tsx`
- Installer les composants shadcn officiels si souhaité:
  - `pnpm dlx shadcn@latest init`
  - `pnpm dlx shadcn@latest add button`
  - `pnpm dlx shadcn@latest add input`
  - `pnpm dlx shadcn@latest add textarea`
  - `pnpm dlx shadcn@latest add label`
  - `pnpm dlx shadcn@latest add card`

**Notes de Développement**
- Utilise un port différent pour Next dev que l’API (`-p 3001`).
- Fonts: `next/font` Geist appliquée via `app/layout.tsx` et CSS `var(--font-geist-sans)` `app/globals.css`.
- Accessibilité: `aria-label` sur les liens boutons dans la liste `app/objects/page.tsx`.

**Dépannage**
- Hôte non configuré pour `next/image`: vérifie `images.remotePatterns` (`protocol`, `hostname`, `port`, `pathname`). Voir `next.config.mjs`.
- WebSocket indisponible: la bannière mode manuel apparaît; utilise `Rafraîchir` pour HTTP ou `Réessayer WebSocket`. Connexion sur `${API_BASE}/objects` avec timeout 2s.
- `params` asynchrones côté client: utilise `React.use()` comme `app/objects/[id]/page.tsx:10`.
