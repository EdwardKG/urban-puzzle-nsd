import React from 'react';
import icon from '../data/icon.svg';

/**
 * Fixed overlay header (does not change layout height).
 * Appears at top; map retains full viewport height underneath.
 */
export default function AtlasHeader({ title = 'Brownfield Atlas', imageSrc = icon }) {
  const words = String(title).trim().split(/\s+/);
  return (
    <div className="atlas-header">
      <div className="atlas-header__inner atlas-header--expanded">
        <div className="atlas-header__left">
          <h1 className="atlas-header__title">
            {words.map((w,i) => (
              <span key={i} className="atlas-header__word">{w}</span>
            ))}
          </h1>
        </div>
        <div className="atlas-header__right">
          <img src={imageSrc} alt={title} />
        </div>
      </div>
    </div>
  );
}
