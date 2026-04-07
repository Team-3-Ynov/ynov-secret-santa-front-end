# Ynov Secret Santa - Frontend

Frontend web de Ynov Secret Santa construit avec Next.js App Router.

## Stack technique

- Next.js 16 (App Router)
- React 19
- TypeScript strict
- Tailwind CSS
- Vitest + Testing Library
- Biome + Oxlint

## Prerequis

- Node.js 20+
- npm (ou pnpm, selon votre usage)

## Configuration locale

Creer un fichier `.env.local` a la racine avec au minimum:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Le frontend tourne sur `http://localhost:3000`.

## Lancer le projet

```bash
npm install
npm run dev
```

## Scripts utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run format
npm run typecheck
npm run test
npm run test:watch
npm run test:coverage
```

## Fonctionnalites principales

- Authentification: inscription, connexion, deconnexion
- Gestion des evenements Secret Santa (creation, edition, invitations)
- Page dediee aux invitations recues
- Notifications in-app (cloche navbar):
  - badge non lu (polling)
  - liste des notifications
  - marquer une notification comme lue
  - marquer toutes les notifications comme lues
  - redirection vers l'evenement ou l'invitation associee

## Structure (resume)

```text
src/app/
  auth/login, auth/signup
  events/, events/[id], events/[id]/join
  invitations/
  profile/
  secretsanta/create, secretsanta/edit/[id]
src/components/
  Navbar.tsx
  NotificationBell.tsx
  InviteDialog.tsx
  PasswordRequirements.tsx
src/utils/
  notifications.ts
  validation.ts
tests/
  app/, components/, utils/
```

## Qualite et verification

Avant merge, verifier au minimum:

```bash
npm run typecheck
npm run test
```

## Notes API

- Base API attendue: `${NEXT_PUBLIC_API_URL}/api`
- Les routes protegees utilisent un JWT Bearer stocke dans le navigateur.
