import React, { useEffect, useState } from 'react';
import { sendContactMessage,getSiteSettings } from '../api/client.js';

const initial = { name: '', phone: '', email: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings,setSettings]=useState(null);
  useEffect(()=>{getSiteSettings().then(setSettings).catch(()=>{})},[]);
  const c=settings?.content?.contact||{};
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setStatus(null);
    try { const res = await sendContactMessage(form); setStatus({ type:'ok', text:res.message || c.formSuccess || 'پیام شما با موفقیت ارسال شد.' }); setForm(initial); }
    catch(err){ const apiMsg=err?.response?.data?.message; setStatus({type:'err',text:apiMsg || c.formError || 'ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید یا با شماره تماس بگیرید.'}); }
    finally{setLoading(false)}
  };
  return <form className="form-card" onSubmit={handleSubmit}>
    <div className="field"><label htmlFor="name">{c.formName||'نام و نام خانوادگی'}</label><input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="مثلاً علی رضایی" /></div>
    <div className="field"><label htmlFor="phone">{c.formPhone||'شماره تماس'}</label><input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="۰۹xx xxx xxxx" /></div>
    <div className="field"><label htmlFor="email">{c.formEmail||'ایمیل (اختیاری)'}</label><input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" /></div>
    <div className="field"><label htmlFor="subject">{c.formSubject||'موضوع'}</label><select id="subject" name="subject" value={form.subject} onChange={handleChange}><option value="">{c.formSelect||'انتخاب کنید'}</option><option value="سفارش پروژه">سفارش پروژه نرم‌افزاری</option><option value="مشاوره فناوری">مشاوره فناوری و تحول دیجیتال</option><option value="ثبت‌نام دوره">ثبت‌نام دوره آموزشی</option><option value="سایر">سایر</option></select></div>
    <div className="field"><label htmlFor="message">{c.formMessage||'پیام شما'}</label><textarea id="message" name="message" rows="4" value={form.message} onChange={handleChange} required placeholder={c.formPlaceholder||'کمی درباره نیاز خود بنویسید...'} /></div>
    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? (c.formSending||'در حال ارسال...') : (c.formSubmit||'ارسال درخواست')}</button>
    {status&&<div className={`form-msg show ${status.type==='ok'?'ok':'err'}`}>{status.text}</div>}
  </form>;
}
