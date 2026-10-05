import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogCard({ post }) {
  return (
    <article className="card blog-card">
      <div className="blog-meta">
        <span>{post.author}</span>
        <span>{post.date}</span>
      </div>
      <h3>
        <Link to={`/blog/${post.id}`}>{post.title}</Link>
      </h3>
      <p>{post.excerpt}</p>
      <div className="stack-row">
        {post.tags.map((t) => <span key={t} className="badge">{t}</span>)}
      </div>
      <div className="blog-card-footer">
        <span className="muted">{post.readTime || 'مطالعه مقاله'}</span>
        <Link className="btn btn-secondary btn-small" to={`/blog/${post.id}`}>ادامه مطلب ←</Link>
      </div>
    </article>
  );
}
