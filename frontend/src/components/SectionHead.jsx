import React from 'react';

export default function SectionHead({ eyebrow, title, description, center }) {
  return (
    <div className={`section-head${center ? ' center' : ''}`}>
      {eyebrow && <div className="eyebrow"><span className="dot" />{eyebrow}</div>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
