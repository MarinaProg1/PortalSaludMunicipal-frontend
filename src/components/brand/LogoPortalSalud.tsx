import { useId } from 'react';
import './LogoPortalSalud.css';

/**
 * Isotipo + nombre institucional.
 * Se usa en el login y en el sidebar del dashboard para mantener la misma identidad.
 */
export const LogoPortalSalud: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const gradId = `psLogoGrad-${uid}`;
  const shineId = `psLogoShine-${uid}`;

  return (
    <div className="ps-logo">
      <svg
        width="56"
        height="56"
        viewBox="0 0 72 72"
        role="img"
        aria-label="Portal Salud"
        className="ps-logo-mark"
      >
        <defs>
          <linearGradient id={gradId} x1="10" y1="6" x2="64" y2="68" gradientUnits="userSpaceOnUse">
            <stop stopColor="#57ECE0" />
            <stop offset="0.48" stopColor="#00C2C7" />
            <stop offset="1" stopColor="#0E7FAE" />
          </linearGradient>
          <linearGradient id={shineId} x1="36" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.38" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="64" height="64" rx="20" fill={`url(#${gradId})`} />
        <rect x="4" y="4" width="64" height="64" rx="20" fill={`url(#${shineId})`} />
        <rect
          x="4.75"
          y="4.75"
          width="62.5"
          height="62.5"
          rx="19.25"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />

        {/* Cruz médica */}
        <path d="M36 18v30M21 33h30" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" />

        {/* Línea de pulso */}
        <path
          d="M13 55h9.5l4.2-7.4 5.2 13.2 4.1-6.2H59"
          fill="none"
          stroke="#043C5C"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>

      <div className="ps-logo-text">
        <span className="ps-logo-name">
          Portal <strong>Salud</strong>
        </span>
        <span className="ps-logo-sub">Municipal</span>
      </div>
    </div>
  );
};

export default LogoPortalSalud;
