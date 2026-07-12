# Web Joki Store

A pricelist and storefront website for various "joki" (boosting/service-for-hire) services, built with Next.js, TypeScript, and Prisma.

Live demo: [web-joki-store.vercel.app](https://web-joki-store.vercel.app)

---

## About

**Web Joki Store** is a platform for displaying and managing a pricelist of various joki services in one place. Users can browse the service catalog, pricing, and details for each offering in a clean, responsive interface.

## Features

- Catalog / pricelist for multiple types of joki services
- Clean, easy-to-navigate service listings
- Fast rendering with Next.js App Router
- Data management using Prisma ORM
- Modern UI with Tailwind CSS and Lucide Icons
- Lightweight state management with Zustand
- Responsive on both desktop and mobile

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS |
| Database ORM | Prisma |
| State Management | Zustand |
| Icons | Lucide React |
| Deployment | Vercel |

## Project Structure

```
Web-Joki-Store/
├── app/            # Routing & pages (Next.js App Router)
├── components/     # Reusable UI components
├── lib/            # Utility functions & helpers
├── prisma/         # Database schema & migrations
├── public/         # Static assets (images, icons, etc.)
├── scripts/        # Supporting scripts (seeding, etc.)
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- Package manager: npm / yarn / pnpm / bun
- A database supported by Prisma (e.g. PostgreSQL, MySQL, or SQLite)

### 1. Clone the repository

```bash
git clone https://github.com/Greeval/Web-Joki-Store.git
cd Web-Joki-Store
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and set it up according to your database:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/joki_store"
```

### 4. Set up the database (Prisma)

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the development server |
| `npm run build` | Builds the project for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs the linter (ESLint) |

## Deployment

This project is deployed using [Vercel](https://vercel.com). To deploy your own version:

1. Push the repository to GitHub
2. Import the project into [Vercel](https://vercel.com/new)
3. Add environment variables (e.g. `DATABASE_URL`) in the Vercel dashboard
4. Deploy

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an [issue](https://github.com/Greeval/Web-Joki-Store/issues) or submit a pull request.

1. Fork this repository
2. Create a new branch (`git checkout -b new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin new-feature`)
5. Open a Pull Request

## License

No license has been specified yet. Add a `LICENSE` file if you want to make this project officially open source.

## Contact

Created by [Greeval](https://github.com/Greeval) — feel free to open an issue in this repo for questions or suggestions.
