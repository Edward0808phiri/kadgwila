export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          d="M4 8.5A4.5 4.5 0 0 1 8.5 4h15A4.5 4.5 0 0 1 28 8.5v2.9a3.6 3.6 0 0 0 0 7.2v2.9A4.5 4.5 0 0 1 23.5 28h-15A4.5 4.5 0 0 1 4 23.5v-2.9a3.6 3.6 0 0 0 0-7.2V8.5Z"
          fill="currentColor"
        />
        <path
          className="logo-mark-glyph"
          d="M12 11.5h8.5L13 20.5h8.5"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && <span className="logo-word">Zikets</span>}
    </span>
  )
}
