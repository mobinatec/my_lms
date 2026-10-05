import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHead from '../components/SectionHead.jsx';
import PortfolioCard from '../components/PortfolioCard.jsx';
import { getServices, getPortfolio, getSiteSettings } from '../api/client.js';

export default function Home() {
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
    Promise.all([getServices(), getPortfolio()])
      .then(([s, p]) => {
        setServices(s);
        setPortfolio(p.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div>
            <div className="eyebrow"><span className="dot" /> {settings?.content?.home?.eyebrow || 'توسعه نرم‌افزار · مشاوره فناوری · آموزش'}</div>
            <h1>{settings?.content?.home?.title || 'ایده شما را به محصولی'} <span className="accent">{settings?.content?.home?.titleAccent || 'آماده اجرا'}</span> تبدیل می‌کنیم</h1>
            <p className="lead">{settings?.content?.home?.description || 'کدسازان تیمی از توسعه‌دهندگان و مشاوران فناوری است که وب‌سایت، اپلیکیشن و زیرساخت سازمان شما را طراحی، می‌سازد و آموزش می‌دهد.'}</p>
            <div className="btn-row">
              <Link to="/contact" className="btn btn-primary">{settings?.content?.home?.primary || 'شروع همکاری'}</Link>
              <Link to="/portfolio" className="btn btn-outline">{settings?.content?.home?.secondary || 'مشاهده نمونه‌کارها'}</Link>
            </div>
          </div>

          <div className="terminal">
            <div className="terminal-bar">
              <span></span><span></span><span></span>
              <span className="file-name">project.config.js</span>
            </div>
            <div className="terminal-body">
              <div><span className="ln">1</span><span className="tk-key">const</span> <span className="tk-plain">project</span> = {'{'}</div>
              <div><span className="ln">2</span>&nbsp;&nbsp;client: <span className="tk-str">'استارتاپ شما'</span>,</div>
              <div><span className="ln">3</span>&nbsp;&nbsp;stack: [<span className="tk-str">'React'</span>, <span className="tk-str">'Node.js'</span>, <span className="tk-str">'Docker'</span>],</div>
              <div><span className="ln">4</span>&nbsp;&nbsp;architecture: <span className="tk-str">'modular'</span>,</div>
              <div><span className="ln">5</span>&nbsp;&nbsp;team: <span className="tk-fn">codesazan</span>(),</div>
              <div><span className="ln">6</span>&nbsp;&nbsp;<span className="tk-com">// از طراحی تا استقرار</span></div>
              <div><span className="ln">7</span>{'}'};</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div className="container grid grid-4">
          <div className="stat"><b>{settings?.content?.home?.stats1Value||'+70'}</b><span>{settings?.content?.home?.stats1Label||'پروژه تحویل‌شده'}</span></div>
          <div className="stat"><b>{settings?.content?.home?.stats2Value||'+900'}</b><span>{settings?.content?.home?.stats2Label||'دانشجوی فارغ‌التحصیل'}</span></div>
          <div className="stat"><b>{settings?.content?.home?.stats3Value||'9 سال'}</b><span>{settings?.content?.home?.stats3Label||'سابقه فعالیت'}</span></div>
          <div className="stat"><b>{settings?.content?.home?.stats4Value||'18'}</b><span>{settings?.content?.home?.stats4Label||'متخصص در تیم'}</span></div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow={settings?.content?.home?.servicesEyebrow || 'خدمات ما'} title={settings?.content?.home?.servicesTitle || 'یک تیم، سه نقش: سازنده، مشاور، معلم'} description={settings?.content?.home?.servicesDescription || 'از ساخت محصول گرفته تا مشاوره فنی و آموزش تیم داخلی شما.'} />
          <div className="grid grid-3">
            {(loading ? Array.from({ length: 3 }) : services.slice(0, 3)).map((s, i) => (
              <div className="card service-card" key={s?.id || i}>
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 9l-4 4 4 4M16 9l4 4-4 4M13 5l-2 16" /></svg>
                </div>
                <h3>{s ? s.title : '...'}</h3>
                <p>{s ? s.description : ''}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/services" className="btn btn-ghost">مشاهده همه خدمات ←</Link>
          </div>
        </div>
      </section>

      {/* FEATURED PORTFOLIO */}
      <section className="section section-alt">
        <div className="container">
          <SectionHead eyebrow={settings?.content?.home?.portfolioEyebrow || 'نمونه‌کارها'} title={settings?.content?.home?.portfolioTitle || 'پروژه‌هایی که ساخته‌ایم'} description={settings?.content?.home?.portfolioDescription || 'نمونه‌ای از محصولاتی که برای کسب‌وکارهای مختلف طراحی و توسعه داده‌ایم.'} />
          {loading ? (
            <p className="state-msg">در حال بارگذاری...</p>
          ) : (
            <div className="grid grid-3">
              {portfolio.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          )}
          <div style={{ marginTop: 32 }}>
            <Link to="/portfolio" className="btn btn-ghost">مشاهده همه نمونه‌کارها ←</Link>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow={settings?.content?.home?.processEyebrow || 'روش کار'} title={settings?.content?.home?.processTitle || 'چهار گام تا تحویل محصول'} />
          <div className="process-grid">
            <div className="process-step"><span className="num">01</span><h3>{settings?.content?.home?.process1Title||'کشف و تحلیل'}</h3><p>{settings?.content?.home?.process1Text||'شناخت نیاز واقعی کسب‌وکار و تدوین نقشه‌راه فنی.'}</p></div>
            <div className="process-step"><span className="num">02</span><h3>{settings?.content?.home?.process2Title||'طراحی و معماری'}</h3><p>{settings?.content?.home?.process2Text||'طراحی رابط کاربری و معماری ماژولار قابل توسعه.'}</p></div>
            <div className="process-step"><span className="num">03</span><h3>{settings?.content?.home?.process3Title||'توسعه و تست'}</h3><p>{settings?.content?.home?.process3Text||'پیاده‌سازی اسپرینتی همراه با تست مستمر کیفیت.'}</p></div>
            <div className="process-step"><span className="num">04</span><h3>{settings?.content?.home?.process4Title||'استقرار و پشتیبانی'}</h3><p>{settings?.content?.home?.process4Text||'راه‌اندازی با Docker و پشتیبانی پس از تحویل.'}</p></div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="quote-band">
        <div className="container">
          <blockquote>
            {settings?.content?.home?.quoteText || '«کدسازان نه‌تنها سایت ما را ساخت، بلکه تیم فنی داخلی‌مان را هم برای نگهداری آن آموزش داد.»'}
            <div className="attribution">{settings?.content?.home?.quoteAttribution || '— مدیرعامل، دیجی‌بازار'}</div>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container">
          <h2>ایده بعدی خود را با ما شروع کنید</h2>
          <p>چه یک محصول تازه در ذهن دارید، چه به مشاوره فنی یا آموزش تیم نیاز دارید، یک قدم با شروع فاصله دارید.</p>
          <Link to="/contact" className="btn btn-primary">رزرو مشاوره رایگان</Link>
        </div>
      </section>
    </>
  );
}
