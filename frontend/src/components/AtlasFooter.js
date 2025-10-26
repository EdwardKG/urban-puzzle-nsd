import React from 'react';
import icon from '../data/icon.svg';

/**
 * Static footer banner displayed under all content.
 * Shows big heading on the left and a wide image on the right.
 */
export default function AtlasFooter({ title = 'Bronfield Atlas', imageSrc = icon }) {
  return (
    <footer className="atlas-footer">
      <div className="atlas-footer__inner">
        <div className="atlas-footer__left">
          <h1>{title}</h1>
          <p className="atlas-footer__tagline">Exploring redevelopment potential of urban brownfields.</p>
        </div>
        <div className="atlas-footer__right">
          <img src={imageSrc} alt={title} />
        </div>
      </div>
    </footer>
  );
}

