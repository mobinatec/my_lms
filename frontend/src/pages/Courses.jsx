import React, { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard.jsx';
import { getCourses,getSiteSettings } from '../api/client.js';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); const [settings,setSettings]=useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(()=>{});
    getCourses().then(setCourses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{settings?.content?.courses?.title || 'دوره‌های آموزشی'}</h1>
          <p>{settings?.content?.courses?.description || 'مسیرهای آموزشی از مقدماتی تا پیشرفته، برای علاقه‌مندان به برنامه‌نویسی و تیم‌های فنی سازمان‌ها.'}</p>
        </div>
      </div>

      <section className="section course-intro-section">
        <div className="container">
          <div className="course-intro card">
            <div><span className="eyebrow">{settings?.content?.courses?.introEyebrow || 'معرفی آکادمی کدسازان'}</span><h2>{settings?.content?.courses?.introTitle || 'مسیر یادگیری واقعی، از شروع تا ساخت پروژه'}</h2><p>{settings?.content?.courses?.introDescription || 'دوره‌ها با درس‌های مرحله‌ای، تمرین، پروژه و امکان ارتباط با مدرس طراحی شده‌اند. برای شروع، یک دوره رایگان برای مهمان‌ها در دسترس است و برای مسیرهای پیشرفته می‌توانید پلن مناسب خود را انتخاب کنید.'}</p></div>
            <div className="course-intro-points"><span>✓ {settings?.content?.courses?.point1 || 'دوره رایگان برای مهمان'}</span><span>✓ {settings?.content?.courses?.point2 || 'مسیرهای مقدماتی تا پیشرفته'}</span><span>✓ {settings?.content?.courses?.point3 || 'تمرین و پروژه عملی'}</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p className="state-msg">{settings?.content?.courses?.loading || 'در حال بارگذاری دوره‌ها...'}</p>
          ) : (
            <div className="grid grid-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
