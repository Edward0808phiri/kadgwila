import Icon from './ui/Icon.jsx'
import Logo from './ui/Logo.jsx'
import { networkList } from '../lib/phone.js'

export default function Footer({ onBrowseAll, onBrowseFree, onOpenMap, onOpenStudio }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>
              Tickets for events across Zambia — concerts, festivals, meetups and community days.
              Pay with the mobile money you already use.
            </p>
          </div>

          <div className="footer-col">
            <h3>Discover</h3>
            <ul>
              <li>
                <button type="button" onClick={onBrowseAll}>
                  All events
                </button>
              </li>
              <li>
                <button type="button" onClick={onBrowseFree}>
                  Free events
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenMap}>
                  Events near you
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Organisers</h3>
            <ul>
              <li>
                <button type="button" onClick={onOpenStudio}>
                  Create an event
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenStudio}>
                  Organiser studio
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Support</h3>
            <ul>
              <li>
                <a href="mailto:support@zikets.zm">support@zikets.zm</a>
              </li>
              <li>
                <a href="tel:+260970000000">+260 97 000 0000</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Zikets · Lusaka, Zambia</span>
          <div className="footer-pay">
            <Icon name="shield" size={15} />
            {networkList.map((network) => (
              <span key={network.id}>{network.short}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
