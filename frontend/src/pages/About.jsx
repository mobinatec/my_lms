import React, { useEffect, useState } from 'react';
import SectionHead from '../components/SectionHead.jsx';
import { getTeam,getResumeUrl,getSiteSettings } from '../api/client.js';

export default function About() {
  const [team,setTeam]=useState([]); const [settings,setSettings]=useState(null);
  useEffect(()=>{getTeam().then(setTeam).catch(()=>{});getSiteSettings().then(setSettings).catch(()=>{})},[]);
  return <>
    <div className="page-header"><div className="container"><span className="page-kicker">{settings?.content?.about?.kicker || 'THE PEOPLE BEHIND THE CODE'}</span><h1>{settings?.content?.about?.title || 'تیمی که پشت محصول شما ایستاده'}</h1><p>{settings?.content?.about?.description || 'توسعه‌دهندگان، طراحان و مهندسانی که از تحلیل ایده تا استقرار و پشتیبانی کنار شما هستند.'}</p></div></div>
    <section className="section"><div className="container">
      <SectionHead eyebrow={settings?.content?.about?.teamEyebrow || 'اعضای تیم'} title={settings?.content?.about?.teamTitle || 'آدم‌ها، نه فقط رزومه‌ها'} description={settings?.content?.about?.teamDescription || 'با تیمی آشنا شوید که مسئولیت فنی و تجربه محصول شما را بر عهده می‌گیرد.'} center/>
      <div className="team-grid">
        {team.map(m=><article className="team-card" key={m.id}>
          <div className="team-avatar" style={{'--accent':m.accent}}>{m.photo?<img src={m.photo} alt={m.name}/>:m.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div>
          <div className="team-content"><div className="team-role">{m.role}</div><h3>{m.name}</h3><p>{m.bio}</p>
          <div className="team-meta"><span>⌁ {m.experience}</span><span>◈ {m.education}</span></div>
          <div className="stack-row">{m.skills.map(s=><span className="badge" key={s}>{s}</span>)}</div>{m.resume&&<a className="btn btn-ghost" href={m.id&&m.resume?getResumeUrl(m.id):m.resume} download={`${m.name}-resume.pdf`}>دانلود رزومه PDF ↓</a>}</div>
        </article>)}
      </div>
    </div></section>
    <section className="section section-alt"><div className="container"><div className="grid grid-2" style={{alignItems:'center'}}>
      <div><SectionHead eyebrow={settings?.content?.about?.storyEyebrow || 'داستان ما'} title={settings?.content?.about?.storyTitle || 'از یک تیم کوچک تا یک استودیو محصول'} /><p className="muted-copy">{settings?.content?.about?.storyDescription || 'کدسازان با تمرکز بر توسعه وب شروع کرد و به‌مرور تیم‌های طراحی، بک‌اند، زیرساخت و آموزش را کنار هم قرار داد.'}</p></div>
      <div className="timeline">{[[settings?.content?.about?.timeline1Year||'1394',settings?.content?.about?.timeline1Text||'شروع فعالیت با تمرکز بر توسعه وب'],[settings?.content?.about?.timeline2Year||'1397',settings?.content?.about?.timeline2Text||'راه‌اندازی واحد آموزش'],[settings?.content?.about?.timeline3Year||'1400',settings?.content?.about?.timeline3Text||'افزودن مشاوره فناوری'],[settings?.content?.about?.timeline4Year||'1403',settings?.content?.about?.timeline4Text||'عبور از مرز ۷۰ پروژه تحویل‌شده']].map(x=><div className="timeline-item" key={x[0]}><span className="year">{x[0]}</span><p>{x[1]}</p></div>)}</div>
    </div></div></section>
  </>;
}
