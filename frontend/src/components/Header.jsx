import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher.jsx';
import { getSiteSettings } from '../api/client.js';

const links = [
  { to: '/', key: 'home', label: 'خانه' },
  { to: '/services', key: 'services', label: 'خدمات' },
  { to: '/portfolio', key: 'portfolio', label: 'پورتفولیو' },
  { to: '/courses', key: 'courses', label: 'دوره‌ها' },
  { to: '/subscriptions', key: 'subscriptions', label: 'اشتراک‌ها' },
  { to: '/blog', key: 'blog', label: 'وبلاگ' },
  { to: '/about', key: 'about', label: 'تیم ما' },
  { to: '/contact', key: 'contact', label: 'تماس' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('codesazan-user') || 'null');

  useEffect(() => {
    getSiteSettings().then((next) => {
      setSettings(next);
      if (next?.favicon) {
        let link = document.querySelector('link[data-codesazan-favicon]');
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; link.dataset.codesazanFavicon = '1'; document.head.appendChild(link); }
        link.href = next.favicon;
      }
    }).catch(() => {});
  }, []);

  const scrollTopIfCurrentRoute = (to) => {
    if (location.pathname === to && !location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    setOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('codesazan-user');
    localStorage.removeItem('codesazan-user-token');
    navigate('/auth');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="brand" onClick={() => scrollTopIfCurrentRoute('/')}>
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="site-logo" />
          ) : (
            <span className="brand-mark">&lt;/&gt;</span>
          )}
          <span>{settings?.siteName || 'کدسازان'}</span>
        </NavLink>

        <nav className="nav-links" aria-label="ناوبری اصلی">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => scrollTopIfCurrentRoute(link.to)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {settings?.content?.global?.[link.key] || link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeSwitcher />
          {user ? (
            <>
              <Link to="/cart" className="btn btn-outline cart-link">🛒 {settings?.content?.global?.cart || 'سبد'}</Link>
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : user.role === 'employee' ? '/employee' : '/account'}
                className="btn btn-outline user-hub"
              >
                <span className="header-profile-avatar">{user.profile?.photo ? <img src={user.profile.photo} alt="" /> : (user.name || 'ک').slice(0,1)}</span>
                <span>{user.name} · {settings?.content?.global?.panel || 'پنل'}</span>
              </Link>
              <button className="icon-btn" title="خروج" onClick={logout}>↪</button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary header-cta">{settings?.content?.global?.login || 'ثبت‌نام / ورود'}</Link>
          )}
        </div>

        <button className="menu-toggle" aria-label="باز کردن منو" onClick={() => setOpen((value) => !value)}>☰</button>
      </div>

      {open && (
        <div className="mobile-nav container">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => scrollTopIfCurrentRoute(link.to)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {settings?.content?.global?.[link.key] || link.label}
            </NavLink>
          ))}
          <Link to={user ? '/account' : '/auth'} onClick={() => setOpen(false)}>
            {user ? 'پنل من' : (settings?.content?.global?.login || 'ثبت‌نام / ورود')}
          </Link>
        </div>
      )}
    </header>
  );
}
