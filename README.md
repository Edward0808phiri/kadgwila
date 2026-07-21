# Zikets

Event ticketing for Zambia — concerts, festivals, meetups and free community
events, paid for with the mobile money people actually use.

React 18 + Vite. No backend: events are static data and everything a user books
is persisted to `localStorage`.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173 (also exposed on your LAN)
npm run build
npm run preview
npm run lint
```

## What's here

| Area | Entry point |
| --- | --- |
| Shell, filtering, view state | `src/App.jsx` |
| Nav, mobile tab bar, hero, footer | `src/components/` |
| Checkout and payment plans | `src/components/Checkout.jsx` |
| Saved tickets, plans, offers | `src/components/Account.jsx` |
| Map of nearby events | `src/components/NearbyMap.jsx` |
| Organiser dashboard | `src/components/Studio.jsx` |
| Persistence | `src/store.js` |
| Event and promo data | `src/data/` |
| Formatting, phone parsing, images | `src/lib/` |
| Styles | `src/styles/` |

### Styles

`src/styles/index.css` is the only entry; everything else is imported from it.
`tokens.css` holds every colour, space, type and motion value as a custom
property, and is also where the light theme is defined — components never
hardcode a colour.

Layout is mobile-first. Breakpoints are `640px` (large phone), `900px` (the
desktop nav replaces the bottom tab bar) and `1400px`. Dialogs are bottom
sheets below 640px and centred panels above it; data tables in the organiser
studio stack into cards below 900px using `data-label` attributes.

### Accessibility

- Dialogs trap focus, close on `Escape`, lock background scroll and return
  focus to whatever opened them (`src/hooks/useDialog.js`).
- All interactive targets are at least 44px; inputs are 16px on mobile so iOS
  Safari doesn't zoom on focus.
- The icon set is inline SVG with `aria-hidden` by default; icon-only controls
  carry their own labels.
- `prefers-reduced-motion` disables the hero pan, map fly-to and locator pulse.
- `npm run lint` includes `eslint-plugin-jsx-a11y`.

### Mobile money

`src/lib/phone.js` parses and validates Zambian numbers in any of the forms
users type them (`0977…`, `260977…`, `+260 97 7…`) and derives the operator
from the prefix — `95/75` Zamtel, `96/76` MTN, `97/77` Airtel. Checkout uses
this to select the provider automatically.

## Not implemented

Checkout does not take real money. `Checkout.jsx` builds the order and writes
it straight to the local store; a production build would hand off to a
mobile-money collection API there and only record the ticket once the provider
confirms. Events created in the organiser studio live in component state and
are not published to the public site.
