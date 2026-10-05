from pathlib import Path
root=Path('/mnt/data/cz600_work')

p=root/'backend/src/modules/siteSettings/siteSettings.service.js'
p.write_text(r'''const { getPool } = require('../../infra/database');
const defaults={
  siteName:'کدسازان',tagline:'توسعه نرم‌افزار، مشاوره فناوری و آموزش',logo:'',phone:'',email:'',address:'',website:'',instagram:'',telegram:'',about:'',
  content:{
    global:{home:'خانه',services:'خدمات',portfolio:'پورتفولیو',courses:'دوره‌ها',subscriptions:'اشتراک‌ها',blog:'وبلاگ',about:'تیم ما',contact:'تماس',login:'ثبت‌نام / ورود',cart:'سبد',panel:'پنل'},
    home:{eyebrow:'توسعه نرم‌افزار · مشاوره فناوری · آموزش',title:'ایده شما را به محصولی',titleAccent:'آماده اجرا',description:'کدسازان تیمی از توسعه‌دهندگان و مشاوران فناوری است که وب‌سایت، اپلیکیشن و زیرساخت سازمان شما را طراحی، می‌سازد و آموزش می‌دهد.',primary:'شروع همکاری',secondary:'مشاهده نمونه‌کارها',servicesEyebrow:'خدمات ما',servicesTitle:'یک تیم، سه نقش: سازنده، مشاور، معلم',servicesDescription:'از ساخت محصول گرفته تا مشاوره فنی و آموزش تیم داخلی شما.',portfolioEyebrow:'نمونه‌کارها',portfolioTitle:'پروژه‌هایی که ساخته‌ایم',portfolioDescription:'نمونه‌ای از محصولاتی که برای کسب‌وکارهای مختلف طراحی و توسعه داده‌ایم.',processEyebrow:'روش کار',processTitle:'چهار گام تا تحویل محصول',quoteTitle:'آماده‌ایم پروژه بعدی را با هم شروع کنیم.'},
    about:{kicker:'THE PEOPLE BEHIND THE CODE',title:'تیمی که پشت محصول شما ایستاده',description:'توسعه‌دهندگان، طراحان و مهندسانی که از تحلیل ایده تا استقرار و پشتیبانی کنار شما هستند.',teamEyebrow:'اعضای تیم',teamTitle:'آدم‌ها، نه فقط رزومه‌ها',teamDescription:'با تیمی آشنا شوید که مسئولیت فنی و تجربه محصول شما را بر عهده می‌گیرد.',storyEyebrow:'داستان ما',storyTitle:'از یک تیم کوچک تا یک استودیو محصول',storyDescription:'کدسازان با تمرکز بر توسعه وب شروع کرد و به‌مرور تیم‌های طراحی، بک‌اند، زیرساخت و آموزش را کنار هم قرار داد.'},
    services:{title:'خدمات کدسازان',description:'از ساخت محصول نرم‌افزاری گرفته تا مشاوره فنی و آموزش تیم داخلی سازمان شما.',ctaTitle:'نمی‌دانید کدام خدمت را نیاز دارید؟',ctaDescription:'در یک جلسه مشاوره کوتاه، مسیر مناسب پروژه شما را با هم مشخص می‌کنیم.',ctaButton:'رزرو مشاوره رایگان'},
    portfolio:{title:'نمونه‌کارها',description:'مروری بر پروژه‌هایی که تیم کدسازان برای مشتریان مختلف طراحی و توسعه داده است.',loading:'در حال بارگذاری نمونه‌کارها...',empty:'نمونه‌کاری در این دسته یافت نشد.'},
    courses:{title:'دوره‌های آموزشی',description:'مسیرهای آموزشی از مقدماتی تا پیشرفته، برای علاقه‌مندان به برنامه‌نویسی و تیم‌های فنی سازمان‌ها.',introEyebrow:'معرفی آکادمی کدسازان',introTitle:'مسیر یادگیری واقعی، از شروع تا ساخت پروژه',introDescription:'دوره‌ها با درس‌های مرحله‌ای، تمرین، پروژه و امکان ارتباط با مدرس طراحی شده‌اند. برای شروع، یک دوره رایگان برای مهمان‌ها در دسترس است و برای مسیرهای پیشرفته می‌توانید پلن مناسب خود را انتخاب کنید.',point1:'دوره رایگان برای مهمان',point2:'مسیرهای مقدماتی تا پیشرفته',point3:'تمرین و پروژه عملی'},
    blog:{title:'وبلاگ کدسازان',description:'یادداشت‌های فنی و مشاوره‌ای تیم ما درباره توسعه نرم‌افزار، معماری و مسیر یادگیری برنامه‌نویسی.',loading:'در حال بارگذاری مقالات...'},
    contact:{title:'تماس با کدسازان',description:'برای شروع پروژه، درخواست مشاوره یا ثبت‌نام در دوره‌ها، فرم زیر را پر کنید یا مستقیم تماس بگیرید.',addressLabel:'آدرس دفتر',addressValue:'تهران، خیابان کارگر شمالی، برج فناوری، طبقه ۶',phoneLabel:'تلفن',phoneValue:'021-88990011 | 0912-0000000',emailLabel:'ایمیل',emailValue:'hello@codesazan.dev',hoursLabel:'ساعات پاسخگویی',hoursValue:'شنبه تا چهارشنبه، ۹:۰۰ تا ۱۸:۰۰'},
    footer:{servicesTitle:'خدمات',companyTitle:'شرکت',contactTitle:'ارتباط',copyright:'© 1403 codesazan.dev — تمامی حقوق محفوظ است',tech:'Built with React · Node.js · Docker'}
  }
};
async function get(){const r=await getPool().query("SELECT value FROM site_settings WHERE key='main'");return deepMerge(defaults,r.rows[0]?.value||{});}
function deepMerge(base, extra){if(!extra||typeof extra!=='object')return base;const out={...base};for(const [k,v] of Object.entries(extra)){if(v&&typeof v==='object'&&!Array.isArray(v)&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))out[k]=deepMerge(base[k],v);else out[k]=v;}return out;}
async function update(payload){const v=deepMerge(await get(),payload||{});await getPool().query(`INSERT INTO site_settings(key,value) VALUES('main',$1::jsonb) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,[JSON.stringify(v)]);return v;}
module.exports={get,update};
''',encoding='utf-8')

# Admin SiteSettingsPanel replacement
admin=root/'frontend/src/pages/Admin.jsx'
s=admin.read_text(encoding='utf-8')
start=s.index('function SiteSettingsPanel(')
end=s.index('\nfunction ', start+10)
new=r'''function SiteSettingsPanel({value,onSave,busy}){
 const [v,setV]=useState(value||{}); const [saved,setSaved]=useState('');
 useEffect(()=>setV(value||{}),[value]);
 const set=(path,x)=>{const a=path.split('.');setV(prev=>{const next={...prev};let cur=next;for(let i=0;i<a.length-1;i++){cur[a[i]]={...(cur[a[i]]||{})};cur=cur[a[i]];}cur[a[a.length-1]]=x;return next})};
 const field=(label,path,area=false)=><Field l={label} v={path.split('.').reduce((o,k)=>o?.[k]??'',v)} s={x=>set(path,x)} a={area}/>;
 const save=async()=>{setSaved('');try{await onSave(v);setSaved('تنظیمات با موفقیت ذخیره شد و در سایت قابل مشاهده است.')}catch(e){setSaved(e?.response?.data?.message||e.message||'ذخیره تنظیمات ناموفق بود')}};
 const setLogo=e=>{const f=e.target.files?.[0];if(!f)return;readFile(f).then(d=>set('logo',d))};
 const sections=[
  ['عمومی','siteName','نام سایت'],['عمومی','tagline','شعار سایت'],['عمومی','phone','شماره تماس'],['عمومی','email','ایمیل'],['عمومی','address','آدرس'],['عمومی','website','دامنه / آدرس سایت'],['عمومی','instagram','اینستاگرام'],['عمومی','telegram','تلگرام'],['عمومی','about','معرفی سایت'],
  ['خانه','content.home.eyebrow','برچسب بالای صفحه'],['خانه','content.home.title','عنوان اصلی'],['خانه','content.home.titleAccent','تأکید عنوان'],['خانه','content.home.description','توضیح اصلی'],['خانه','content.home.primary','دکمه اصلی'],['خانه','content.home.secondary','دکمه دوم'],['خانه','content.home.servicesEyebrow','برچسب خدمات'],['خانه','content.home.servicesTitle','عنوان خدمات'],['خانه','content.home.servicesDescription','توضیح خدمات'],['خانه','content.home.portfolioEyebrow','برچسب نمونه‌کار'],['خانه','content.home.portfolioTitle','عنوان نمونه‌کار'],['خانه','content.home.portfolioDescription','توضیح نمونه‌کار'],['خانه','content.home.processEyebrow','برچسب روش کار'],['خانه','content.home.processTitle','عنوان روش کار'],['خانه','content.home.quoteTitle','متن دعوت به همکاری'],
  ['درباره ما','content.about.kicker','برچسب صفحه'],['درباره ما','content.about.title','عنوان صفحه'],['درباره ما','content.about.description','توضیح صفحه'],['درباره ما','content.about.teamEyebrow','برچسب تیم'],['درباره ما','content.about.teamTitle','عنوان تیم'],['درباره ما','content.about.teamDescription','توضیح تیم'],['درباره ما','content.about.storyEyebrow','برچسب داستان'],['درباره ما','content.about.storyTitle','عنوان داستان'],['درباره ما','content.about.storyDescription','توضیح داستان'],
  ['خدمات','content.services.title','عنوان صفحه'],['خدمات','content.services.description','توضیح صفحه'],['خدمات','content.services.ctaTitle','عنوان دعوت به اقدام'],['خدمات','content.services.ctaDescription','توضیح دعوت به اقدام'],['خدمات','content.services.ctaButton','متن دکمه'],
  ['نمونه‌کارها','content.portfolio.title','عنوان صفحه'],['نمونه‌کارها','content.portfolio.description','توضیح صفحه'],['نمونه‌کارها','content.portfolio.loading','متن بارگذاری'],['نمونه‌کارها','content.portfolio.empty','متن نبود نتیجه'],
  ['دوره‌ها','content.courses.title','عنوان صفحه'],['دوره‌ها','content.courses.description','توضیح صفحه'],['دوره‌ها','content.courses.introEyebrow','برچسب معرفی'],['دوره‌ها','content.courses.introTitle','عنوان معرفی'],['دوره‌ها','content.courses.introDescription','توضیح معرفی'],['دوره‌ها','content.courses.point1','مزیت اول'],['دوره‌ها','content.courses.point2','مزیت دوم'],['دوره‌ها','content.courses.point3','مزیت سوم'],
  ['وبلاگ','content.blog.title','عنوان صفحه'],['وبلاگ','content.blog.description','توضیح صفحه'],['وبلاگ','content.blog.loading','متن بارگذاری'],
  ['تماس','content.contact.title','عنوان صفحه'],['تماس','content.contact.description','توضیح صفحه'],['تماس','content.contact.addressLabel','عنوان آدرس'],['تماس','content.contact.addressValue','متن آدرس'],['تماس','content.contact.phoneLabel','عنوان تلفن'],['تماس','content.contact.phoneValue','متن تلفن'],['تماس','content.contact.emailLabel','عنوان ایمیل'],['تماس','content.contact.emailValue','متن ایمیل'],['تماس','content.contact.hoursLabel','عنوان ساعات'],['تماس','content.contact.hoursValue','متن ساعات'],
  ['پاورقی','content.footer.servicesTitle','عنوان خدمات'],['پاورقی','content.footer.companyTitle','عنوان شرکت'],['پاورقی','content.footer.contactTitle','عنوان ارتباط'],['پاورقی','content.footer.copyright','متن کپی‌رایت'],['پاورقی','content.footer.tech','متن تکنولوژی']
 ];
 return <div className="admin-panel settings-panel settings-v60" dir="rtl">
   <div className="settings-sticky-head"><div><span className="eyebrow">مدیریت محتوای سایت · 6.0.0</span><h2>تنظیمات و متن‌های سایت</h2><p className="muted">متن‌های اصلی صفحات سایت را از همین‌جا ویرایش کنید. تغییرات در PostgreSQL ذخیره می‌شوند.</p></div><button className="btn btn-primary settings-save-top" disabled={busy} onClick={save}>{busy?'در حال ذخیره...':'ذخیره تنظیمات'}</button></div>
   {saved&&<div className={`form-msg show ${saved.includes('ناموفق')?'err':'ok'}`}>{saved}</div>}
   <div className="settings-basic-grid">{field('نام سایت','siteName')}{field('شعار سایت','tagline')}{field('شماره تماس','phone')}{field('ایمیل','email')}{field('آدرس','address',true)}{field('دامنه','website')}{field('اینستاگرام','instagram')}{field('تلگرام','telegram')}{field('معرفی سایت','about',true)}</div>
   <label className="file-field"><span>لوگوی سایت</span><input type="file" accept="image/*" onChange={setLogo}/></label>{v.logo&&<img src={v.logo} className="settings-logo-preview" alt="logo"/>}
   {['خانه','درباره ما','خدمات','نمونه‌کارها','دوره‌ها','وبلاگ','تماس','پاورقی'].map(section=><div className="settings-section-editor" key={section}><div className="settings-section-title"><span>{section}</span><small>متن‌های قابل ویرایش</small></div><div className="settings-editor-grid">{sections.filter(x=>x[0]===section).map(([,path,label])=><div key={path}>{field(label,path,label.includes('توضیح')||label.includes('شرح')||label.includes('معرفی')||label.includes('آدرس')||label.includes('متن')||label.includes('عنوان اصلی'))}</div>)}</div></div>)}
   <div className="settings-bottom-save"><button className="btn btn-primary" disabled={busy} onClick={save}>{busy?'در حال ذخیره...':'ذخیره تنظیمات'}</button></div>
 </div>
}
'''
s=s[:start]+new+s[end:]
admin.write_text(s,encoding='utf-8')
