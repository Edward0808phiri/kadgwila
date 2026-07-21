import { useId } from 'react'
import { createPortal } from 'react-dom'
import useDialog from '../../hooks/useDialog.js'
import Icon from './Icon.jsx'

export default function Sheet({ eyebrow, title, sub, onClose, children, footer, wide = false }) {
  const ref = useDialog(onClose)
  const titleId = useId()

  return createPortal(
    <div className="overlay">
      <div className="overlay-backdrop" role="presentation" onMouseDown={onClose} />
      <div
        ref={ref}
        className={`sheet ${wide ? 'sheet-wide' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="sheet-grip" />
        <header className="sheet-head">
          <div className="sheet-head-text">
            {eyebrow && <span className="sheet-eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            {sub && <p className="sheet-sub">{sub}</p>}
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
