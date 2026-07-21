/**
 * Stroke icon set (24px grid, 1.8 stroke). Icons are decorative by default —
 * pass a `title` only when the icon is the sole label for a control.
 */
const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20.5 20.5 16.7 16.7" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  navigation: <path d="M3 11 22 2l-9 19-2-8-8-2Z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  ticket: (
    <>
      <path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z" />
      <path d="M14 5v2M14 11v2M14 17v2" />
    </>
  ),
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M20 6 9 17l-5-5" />,
  play: <path d="M7 4.5v15l13-7.5-13-7.5Z" />,
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <path d="M7.5 7.5h.01" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.3h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v5M12 7.7h.01" />
    </>
  ),
  trending: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  chart: <path d="M3 21h18M6.5 18v-6M11.5 18V7M16.5 18v-9M21 18v-4" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
    </>
  ),
  star: <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8l-5.3 2.9 1.1-6.1L3.4 9.4l6-.8L12 3Z" />,
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  wallet: (
    <>
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z" />
    </>
  ),
  refresh: <path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />,

  /* Category glyphs */
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  mountain: <path d="M3 20h18L14 5l-4 7-2.4-3L3 20Z" />,
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </>
  ),
  food: (
    <>
      <path d="M7 2v20M4 2v6a3 3 0 0 0 6 0V2" />
      <path d="M17.5 2C16 4 15.5 6 15.5 8c0 2 1 3 2.5 3v11" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M12 14v4M8.5 21h7" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7" />
    </>
  ),
  theatre: (
    <>
      <path d="M4 4h16v8a8 8 0 0 1-16 0V4Z" />
      <path d="M9 9h.01M15 9h.01M9 14c1.8 1.4 4.2 1.4 6 0" />
    </>
  ),
  /* Broadcast waves around a dot — the standard "on air" mark. */
  broadcast: (
    <>
      <path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
      <path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  heart: (
    <path d="M12 20.3 4.4 12.7a4.9 4.9 0 0 1 6.9-6.9l.7.7.7-.7a4.9 4.9 0 0 1 6.9 6.9Z" />
  ),
  comment: (
    <path d="M20.5 11.6a8 8 0 0 1-8.5 8 9 9 0 0 1-3.8-.9L3.5 20.5l1.8-4.7a8 8 0 0 1-1.8-5 8 8 0 0 1 8.5-8 8 8 0 0 1 8.5 8Z" />
  ),
  send: <path d="M21.5 2.5 2.5 10l7.5 3.5L13.5 21Z" />,
}

export const iconNames = Object.keys(paths)

export default function Icon({ name, size = 20, title, className = '', strokeWidth = 1.8, ...rest }) {
  const glyph = paths[name]
  if (!glyph) return null

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  )
}
