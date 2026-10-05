import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div className="container">
        <p className="eyebrow" style={{ justifyContent: 'center' }}><span className="dot" /> 404</p>
        <h1 style={{ marginBottom: 16 }}>این مسیر پیدا نشد</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 30 }}>صفحه‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.</p>
        <Link to="/" className="btn btn-primary">بازگشت به خانه</Link>
      </div>
    </section>
  );
}
