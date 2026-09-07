# Nodo Business Search

Herramienta interna de prospección B2B para identificar negocios en Auckland que **no cuentan con sitio web**, capturarlos como leads y exportarlos al tablero de Trello de Nodo.

## Stack

- **Next.js 16** (App Router, TypeScript strict, Turbopack)
- **Material UI v9** (theming dark/light con paleta Nodo)
- **Auth.js v5** (Google OAuth con whitelist de emails)
- **Prisma 6** + **Neon Postgres** (Vercel Marketplace)
- **next-intl** (ES / EN)
- **Google Places API (New)** — Text Search
- **Trello REST API** — export de cards
- Jest + RTL, ESLint, Prettier, Husky, lint-staged

## Requisitos

- Node.js 20+
- npm 10+
- Cuenta Vercel (Hobby)
- Base de datos Postgres (Neon vía Vercel Marketplace)
- Credenciales OAuth Google (Client ID + Secret)
- API key de Google Cloud con **Places API (New)** habilitada
- Trello: `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`, `TRELLO_LIST_ID`

## Setup local

```bash
npm install
cp .env.example .env.local
# Rellenar todas las variables en .env.local
npm run prisma:migrate   # primera migración
npm run dev
```

Abrir http://localhost:3000

## Scripts

| Comando                  | Uso                                             |
| ------------------------ | ----------------------------------------------- |
| `npm run dev`            | Servidor de desarrollo (Turbopack)              |
| `npm run build`          | Build de producción (incluye `prisma generate`) |
| `npm run start`          | Servidor productivo                             |
| `npm run lint`           | ESLint                                          |
| `npm run typecheck`      | TypeScript                                      |
| `npm run format`         | Prettier write                                  |
| `npm test`               | Jest                                            |
| `npm run prisma:migrate` | Aplicar migraciones locales                     |
| `npm run prisma:studio`  | Prisma Studio                                   |

## Estructura

```
app/
├─ (auth)/signin/        # login con Google
├─ (app)/                # rutas autenticadas
│  ├─ dashboard/
│  ├─ search/
│  ├─ leads/
│  └─ settings/
└─ api/{auth,search,leads,leads/export,metrics}/
components/               # UI (AppShell, SearchForm, LeadsTable, Dashboard, …)
lib/                      # auth, prisma, google-places, trello, rate-limit, metrics
prisma/schema.prisma      # User/Search/Lead/LeadExport + Auth.js
theme/                    # paleta Nodo + tema MUI dark/light
i18n/                     # config next-intl
messages/                 # es.json / en.json
proxy.ts                  # protección de rutas (Next 16)
```

## Whitelist de acceso

Sólo los emails listados en `AUTH_ALLOWED_EMAILS` (separados por coma) pueden iniciar sesión.
Cualquier otro email es rechazado en el callback `signIn` de Auth.js.

## Deploy en Vercel

1. Crear proyecto Vercel apuntando al repo GitHub.
2. Añadir integración **Neon** desde Vercel Marketplace (setea `DATABASE_URL` y `DIRECT_URL`).
3. Setear el resto de env vars en Vercel (production + preview).
4. Configurar dominio autorizado en Google OAuth Console.
5. Restringir la API key de Google Places por HTTP referrer.
