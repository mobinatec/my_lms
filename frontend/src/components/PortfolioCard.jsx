import React,{useState} from 'react';
export default function PortfolioCard({item}){
 const [open,setOpen]=useState(false); const [activeImage,setActiveImage]=useState(0);
 const initials=item.title.trim().slice(0,2); const images=item.images||[];
 const showGallery=()=>{setActiveImage(0);setOpen(true)};
 return <>
  <article className="portfolio-card-v2" style={{'--accent':item.accent||'#22d3ee'}} onClick={showGallery}>
   <div className="portfolio-art">{images[0]?<img src={images[0]} alt=""/>:<><span className="art-grid"/><span className="art-code">{initials}</span></>}<span className="art-year">{item.year}</span><span className="art-arrow">↗</span></div>
   <div className="portfolio-body"><div className="portfolio-topline"><span>{item.client}</span><span>{item.category}</span></div><h3>{item.title}</h3><p>{item.summary}</p><div className="portfolio-bottom"><div className="stack-row">{(item.stack||[]).slice(0,3).map(s=><span className="badge" key={s}>{s}</span>)}</div><div className="portfolio-actions"><button type="button" className="portfolio-view gallery-trigger" onClick={e=>{e.stopPropagation();showGallery()}}>گالری و دموی پروژه ↗</button>{item.liveUrl&&<a className="portfolio-live-link" href={item.liveUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{item.liveLabel||'سایت عملیاتی مشتری'} ↗</a>}</div></div></div>
  </article>
  {open&&<div className="modal-backdrop" onClick={()=>setOpen(false)}><div className="editor-modal portfolio-modal" onClick={e=>e.stopPropagation()}>
   <div className="panel-title"><div><h2>{item.title}</h2><span className="muted">{item.client} · {images.length} تصویر نمونه</span></div><button type="button" onClick={()=>setOpen(false)}>×</button></div>
   {item.demoVideo&&<div className="portfolio-demo"><video controls playsInline preload="metadata" poster="/default-intro-poster.jpg" src={item.demoVideo}/><small>دموی ویدئویی پروژه — برای پخش روی دکمه Play بزنید.</small></div>}
   {images.length>0&&<div className="portfolio-gallery-main"><button type="button" className="gallery-nav" onClick={()=>setActiveImage((activeImage-1+images.length)%images.length)}>‹</button><img src={images[activeImage]} alt={`${item.title} ${activeImage+1}`}/><button type="button" className="gallery-nav" onClick={()=>setActiveImage((activeImage+1)%images.length)}>›</button></div>}
   <div className="portfolio-thumbs">{images.map((x,i)=><button type="button" key={x} className={i===activeImage?'active':''} onClick={()=>setActiveImage(i)}><img src={x} alt=""/></button>)}</div>
  </div></div>}
 </>
}
