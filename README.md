# SYNCTOKT

**Zikets** — a ticketing platform for events across Zambia, including free community events. Built with React + Vite.

## Features
- Browse events across Zambia (Lusaka, Ndola, Livingstone, Kitwe, Chipata, Solwezi & more)
- Free events clearly badged, plus a "Free only" filter
- Search by event, city, or artist + category filters
- Pre-order / buy tickets with a quantity selector and live total
- Mobile money payments only — Airtel Money, MTN MoMo, Zamtel Kwacha
- Simple checkout: name, email, phone + mobile money number

## Getting started
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Project structure
- `src/App.jsx` — hero, search, filters, event grid
- `src/components/Checkout.jsx` — purchase modal + mobile money payment
- `src/data/events.js` — event data
- `src/styles.css` — styling

> Note: checkout is front-end only — the success screen simulates payment. Wire the submit handler to a mobile-money API to take real payments.
