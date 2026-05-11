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


Fresh Clone / New System — Full Command List
1. Prerequisites (ek baar install karo)

node -v        # Node.js 18+ hona chahiye
npm -v         # npm check
Agar Node nahi hai: nodejs.org se LTS download karo.

2. Clone & Setup

git clone <your-repo-url>
cd lordfunded
npm install
3. Build

npm run build
Yeh karta hai:

next build — static HTML generate karta hai out/ folder mein
node scripts/copy-rsc.js — RSC files copy karta hai
4. Local Dev Server (development mein)

npm run dev
Browser mein kholo: http://localhost:3000

5. Firebase Deploy (production)

npm install -g firebase-tools    # ek baar globally install karo
firebase login                   # ek baar login karo
firebase deploy                  # build ke baad deploy karo
Complete Flow (copy-paste ready)

git clone <your-repo-url>
cd lordfunded
npm install
npm run build
firebase deploy
Note: firebase login aur firebase-tools install sirf ek baar karna hoga. Agle time sirf yeh 3 commands:


npm install
npm run build
firebase deploy