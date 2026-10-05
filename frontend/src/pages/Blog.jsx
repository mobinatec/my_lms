import React, { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard.jsx';
import { getBlogPosts,getSiteSettings } from '../api/client.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); const [settings,setSettings]=useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(()=>{});
    getBlogPosts().then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{settings?.content?.blog?.title || 'وبلاگ کدسازان'}</h1>
          <p>{settings?.content?.blog?.description || 'یادداشت‌های فنی و مشاوره‌ای تیم ما درباره توسعه نرم‌افزار، معماری و مسیر یادگیری برنامه‌نویسی.'}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <p className="state-msg">{settings?.content?.blog?.loading || 'در حال بارگذاری مقالات...'}</p>
          ) : (
            <div className="grid grid-2">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
