import React from 'react';
import { Link } from 'react-router-dom';import {useEffect,useState} from 'react';import {getSiteSettings} from '../api/client.js';

export default function Footer() {
  const [s,setS]=useState(null);useEffect(()=>{getSiteSettings().then(setS).catch(()=>{})},[]);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              {s?.logo?<img src={s.logo} alt={s.siteName} className="site-logo"/>:<span className="brace">&lt;/&gt;</span>}
              {s?.siteName||'کدسازان'}
            </div>
            <p>{s?.tagline||'شرکت توسعه نرم‌افزار، مشاوره فناوری و آموزش برنامه‌نویسی؛ از ایده تا استقرار.'}</p>
          </div>
          <div className="footer-col">
            <h4>{s?.content?.footer?.servicesTitle||'خدمات'}</h4>
            <ul>
              <li><Link to="/services">{s?.content?.footer?.services1||'توسعه وب'}</Link></li>
              <li><Link to="/services">{s?.content?.footer?.services2||'اپلیکیشن موبایل'}</Link></li>
              <li><Link to="/services">{s?.content?.footer?.services3||'مشاوره فناوری'}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{s?.content?.footer?.companyTitle||'شرکت'}</h4>
            <ul>
              <li><Link to="/about">{s?.content?.footer?.companyAbout||'درباره ما'}</Link></li>
              <li><Link to="/portfolio">{s?.content?.footer?.companyPortfolio||'نمونه‌کارها'}</Link></li>
              <li><Link to="/blog">{s?.content?.footer?.companyBlog||'وبلاگ'}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{s?.content?.footer?.contactTitle||'ارتباط'}</h4>
            <ul>
              <li><Link to="/contact">{s?.content?.footer?.contactLink||'تماس با ما'}</Link></li><li>{s?.phone||'09120000000'}</li><li>{s?.email||'info@codesazan.local'}</li>
              <li><Link to="/courses">{s?.content?.footer?.coursesLink||'دوره‌های آموزشی'}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{s?.content?.footer?.copyright||'© 1403 codesazan.dev — تمامی حقوق محفوظ است'}</span>
          <span>{s?.content?.footer?.tech||'Built with React · Node.js · Docker'}</span>
        </div>
      </div>
    </footer>
  );
}
