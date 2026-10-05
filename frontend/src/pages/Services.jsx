import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHead from '../components/SectionHead.jsx';
import { getServices,getSiteSettings } from '../api/client.js';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); const [settings,setSettings]=useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(()=>{});
    getServices().then(setServices).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{settings?.content?.services?.title || 'خدمات کدسازان'}</h1>
          <p>{settings?.content?.services?.description || 'از ساخت محصول نرم‌افزاری گرفته تا مشاوره فنی و آموزش تیم داخلی سازمان شما.'}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <p className="state-msg">در حال بارگذاری خدمات...</p>
          ) : (
            <div className="grid grid-3">
              {services.map((s) => (
                <div key={s.id} className="card service-card">
                  <div className="icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 9l-4 4 4 4M16 9l4 4-4 4M13 5l-2 16" /></svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <SectionHead title="نمی‌دانید کدام خدمت را نیاز دارید؟" description="در یک جلسه مشاوره کوتاه، مسیر مناسب پروژه شما را با هم مشخص می‌کنیم." center />
          <Link to="/contact" className="btn btn-primary">{settings?.content?.services?.ctaButton || 'رزرو مشاوره رایگان'}</Link>
        </div>
      </section>
    </>
  );
}
