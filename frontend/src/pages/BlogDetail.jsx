import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogPost } from '../api/client.js';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getBlogPost(id).then(setPost).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <section className="section"><div className="container"><p className="state-msg">در حال بارگذاری مقاله...</p></div></section>;
  if (error || !post) return <section className="section"><div className="container"><div className="card"><h2>مقاله پیدا نشد</h2><p>این مقاله وجود ندارد یا در دسترس نیست.</p><Link className="btn btn-primary" to="/blog">بازگشت به وبلاگ</Link></div></div></section>;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="blog-detail-kicker">وبلاگ کدسازان · {post.date}</div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
        </div>
      </div>
      <section className="section">
        <div className="container blog-detail-layout">
          <article className="card blog-detail-card">
            <div className="blog-detail-meta">
              <span>نویسنده: {post.author}</span>
              <span>{post.readTime || 'مطالعه مقاله'}</span>
            </div>
            <div className="blog-detail-content">
              {(post.content || post.excerpt).split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>
            <div className="stack-row blog-detail-tags">
              {post.tags.map((t) => <span key={t} className="badge">{t}</span>)}
            </div>
            <Link className="btn btn-secondary" to="/blog">← بازگشت به همه مقالات</Link>
          </article>
        </div>
      </section>
    </>
  );
}
