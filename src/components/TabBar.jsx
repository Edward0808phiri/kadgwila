import Icon from './ui/Icon.jsx'

export default function TabBar({ activeView, ticketCount, onBrowseAll, onBrowseFree, onOpenMap, onOpenAccount }) {
  const tabs = [
    { id: 'browse', label: 'Browse', icon: 'home', onClick: onBrowseAll },
    { id: 'free', label: 'Free', icon: 'tag', onClick: onBrowseFree },
    { id: 'map', label: 'Near me', icon: 'pin', onClick: onOpenMap },
    { id: 'account', label: 'Tickets', icon: 'ticket', onClick: onOpenAccount, badge: ticketCount },
  ]

  return (
    <nav className="tabbar" aria-label="Sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="tabbar-item"
          data-active={activeView === tab.id || undefined}
          onClick={tab.onClick}
        >
          <Icon name={tab.icon} size={21} />
          {tab.label}
          {tab.badge > 0 && <span className="tabbar-badge">{tab.badge}</span>}
        </button>
      ))}
    </nav>
  )
}
