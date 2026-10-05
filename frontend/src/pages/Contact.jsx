import React from 'react';
import ContactForm from '../components/ContactForm.jsx';
import { getSiteSettings } from '../api/client.js';

export default function Contact() {
  const [settings,setSettings]=React.useState(null); React.useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[]);
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{settings?.content?.contact?.title || 'تماس با کدسازان'}</h1>
          <p>{settings?.content?.contact?.description || 'برای شروع پروژه، درخواست مشاوره یا ثبت‌نام در دوره‌ها، فرم زیر را پر کنید یا مستقیم تماس بگیرید.'}</p>
        </div>
      </div>

      <section className="section">
        <div className="container contact-grid">
          <div>
            <div className="info-row">
              <div>
                <b>{settings?.content?.contact?.addressLabel || 'آدرس دفتر'}</b>
                <span>{settings?.content?.contact?.addressValue || 'تهران، خیابان کارگر شمالی، برج فناوری، طبقه ۶'}</span>
              </div>
            </div>
            <div className="info-row">
              <div>
                <b>{settings?.content?.contact?.phoneLabel || 'تلفن'}</b>
                <span>{settings?.content?.contact?.phoneValue || '021-88990011 | 0912-0000000'}</span>
              </div>
            </div>
            <div className="info-row">
              <div>
                <b>{settings?.content?.contact?.emailLabel || 'ایمیل'}</b>
                <span>{settings?.content?.contact?.emailValue || 'hello@codesazan.dev'}</span>
              </div>
            </div>
            <div className="info-row">
              <div>
                <b>{settings?.content?.contact?.hoursLabel || 'ساعات پاسخگویی'}</b>
                <span>{settings?.content?.contact?.hoursValue || 'شنبه تا چهارشنبه، ۹:۰۰ تا ۱۸:۰۰'}</span>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
