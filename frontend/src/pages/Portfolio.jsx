import React, { useEffect, useState } from 'react';
import PortfolioCard from '../components/PortfolioCard.jsx';
import { getPortfolio,getSiteSettings } from '../api/client.js';

const categories = (settings) => [
  { key: 'all', label: settings?.content?.portfolio?.filterAll || 'همه' },
  { key: 'web', label: settings?.content?.portfolio?.filterWeb || 'وب' },
  { key: 'mobile', label: settings?.content?.portfolio?.filterMobile || 'موبایل' },
  { key: 'corporate', label: settings?.content?.portfolio?.filterCorporate || 'شرکتی' },
];

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true); const [settings,setSettings]=useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(()=>{});
    setLoading(true);
    getPortfolio(active === 'all' ? undefined : active)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{settings?.content?.portfolio?.title || 'نمونه‌کارها'}</h1>
          <p>{settings?.content?.portfolio?.description || 'مروری بر پروژه‌هایی که تیم کدسازان برای مشتریان مختلف طراحی و توسعه داده است.'}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="portfolio-filters">
            {categories(settings).map((c) => (
              <button
                key={c.key}
                className={`filter-btn${active === c.key ? ' active' : ''}`}
                onClick={() => setActive(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="state-msg">{settings?.content?.portfolio?.loading || 'در حال بارگذاری نمونه‌کارها...'}</p>
          ) : items.length === 0 ? (
            <p className="state-msg">{settings?.content?.portfolio?.empty || 'نمونه‌کاری در این دسته یافت نشد.'}</p>
          ) : (
            <div className="grid grid-3">
              {items.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
