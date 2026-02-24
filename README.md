This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker (with HWP/HWPX support)

This project uses system binaries to generate previews and page counts:

- `soffice` (LibreOffice): HWP/HWPX -> PDF conversion
- `libreoffice-h2orestart` (optional but recommended): improves HWPX import/conversion accuracy
- `pdfinfo`, `pdftoppm` (poppler-utils): page count / preview image generation
- `hwp5proc`, `hwp5odt` (`pyhwp==0.1b15`): HWP fallback extraction/conversion

These are already included in the root `Dockerfile`.
The container is configured with Next.js `standalone` output (`node server.js`).

Build and run:

```bash
docker build -t dre-edu-app .
docker run --rm -p 3000:3000 --env-file .env.local dre-edu-app
```
