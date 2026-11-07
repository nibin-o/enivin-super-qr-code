# Enivin Super QR Code

A private-company QR management workspace prototype.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages preview
The included GitHub Actions workflow builds the React frontend and publishes it to GitHub Pages on every push to `main`.

1. Open **Settings → Pages** in this repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Open **Actions** and watch the **Deploy preview to GitHub Pages** workflow.
4. Once it succeeds, the preview URL is `https://nibin-o.github.io/enivin-super-qr-code/`.

## Important security and product scope
This repository currently contains a frontend prototype with browser-local demo data. It is not a production-secure company system. Do not store confidential company documents or real staff credentials in this preview.

GitHub Pages is static hosting. Staff authentication, role enforcement, shared-folder authorization, secure file storage, PDF publishing, dynamic QR redirects, and audit logs require a separate backend (for example Supabase with server-side policies and storage). No public sign-up or production authentication is implemented in this preview yet.

## Current prototype features
- Dashboard overview and QR library.
- Create URL and plain-text QR codes.
- Dynamic/static demo QR records stored in browser localStorage.
- Edit destination for demo dynamic QR records.
- Download QR as SVG or PNG.
- Folder/category selection and search.
- Responsive dark workspace UI.

Advanced styling, complete content types, PDF inline viewer, multi-user permissions, analytics, audit logs and production persistence remain future implementation work.