import React from 'react';
import {Link} from 'react-router-dom';

export default function CourseCard({course}){
  const type=course.courseType||((course.plans||[]).some(p=>p.free===true&&p.guestAllowed!==false)?'free':'paid'); const label=type==='free'?'رایگان':type==='vip'?'VIP':'پولی';
  return <article className="course-card card">
    <div className="course-cover">
      {type!=='paid'&&<span className={`course-ribbon ${type==='free'?'free-ribbon':'vip-ribbon'}`}>{label}</span>}
      <span>{course.level}</span><b>01</b>
    </div>
    <div className="level"><span className="badge">{course.format}</span><span className="badge">{label}</span></div>
    <h3>{course.title}</h3>
    <p>{course.summary}</p>
    <div className="course-card-meta"><span>◷ {course.duration}</span><span>▣ {(course.lessons||[]).length} جلسه</span></div>
    <div className="stack-row">{(course.topics||[]).slice(0,3).map(x=><span className="badge" key={x}>{x}</span>)}</div>
    <Link className="btn btn-outline full-btn" to={`/courses/${course.id}`}>مشاهده جزئیات دوره</Link>
  </article>
}
