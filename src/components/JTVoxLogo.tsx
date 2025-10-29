import React from 'react';

interface JTVoxLogoProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

const JTVoxLogo: React.FC<JTVoxLogoProps> = ({ 
  width = '100%', 
  height = 'auto',
  className = '' 
}) => {
  return (
    <svg 
      viewBox="0 0 800 400" 
      xmlns="http://www.w3.org/2000/svg" 
      preserveAspectRatio="xMidYMid meet" 
      role="img"
      width={width}
      height={height}
      className={className}
      aria-label="Hubvox by JT Logo"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#001A47"/>
          <stop offset="100%" stopColor="#000D24"/>
        </linearGradient>
        <linearGradient id="waveBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#003D99"/>
          <stop offset="100%" stopColor="#0074FF"/>
        </linearGradient>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>
          {`
            @keyframes wave1{0%,100%{opacity:.55;stroke-width:7}50%{opacity:.85;stroke-width:8}}
            @keyframes wave2{0%,100%{opacity:.5;stroke-width:6}50%{opacity:.8;stroke-width:7}}
            @keyframes wave3{0%,100%{opacity:.5;stroke-width:5}50%{opacity:.8;stroke-width:6}}
            @keyframes pulse{0%,100%{opacity:.95;r:16}50%{opacity:1;r:19}}
            @keyframes bars{0%,100%{opacity:.7}50%{opacity:1}}
            .w1{animation:wave1 2.6s ease-in-out infinite}
            .w2{animation:wave2 2.6s ease-in-out .25s infinite}
            .w3{animation:wave3 2.6s ease-in-out .5s infinite}
            .p{animation:pulse 2s ease-in-out infinite}
            .b{animation:bars 1.8s ease-in-out infinite}
          `}
        </style>
      </defs>

      <rect width="800" height="400" fill="url(#bgGradient)"/>

      <g transform="translate(400,200)">
        {/* Ícone (H + ondas) */}
        <g transform="translate(-230,0)">
          <path d="M-55-10Q-48-42-32-55" stroke="url(#waveBlue)" strokeWidth="7" fill="none" strokeLinecap="round" className="w1"/>
          <path d="M-55 10Q-48 42-32 55"  stroke="url(#waveBlue)" strokeWidth="7" fill="none" strokeLinecap="round" className="w1"/>
          <path d="M-40-8Q-35-30-22-40"   stroke="url(#waveBlue)" strokeWidth="6" fill="none" strokeLinecap="round" className="w2"/>
          <path d="M-40 8Q-35 30-22 40"   stroke="url(#waveBlue)" strokeWidth="6" fill="none" strokeLinecap="round" className="w2"/>
          <path d="M-28-6Q-24-20-15-28"   stroke="url(#waveBlue)" strokeWidth="5" fill="none" strokeLinecap="round" className="w3"/>
          <path d="M-28 6Q-24 20-15 28"   stroke="url(#waveBlue)" strokeWidth="5" fill="none" strokeLinecap="round" className="w3"/>

          <circle cx="0" cy="0" r="28" fill="#9EFF00" opacity=".12"/>
          <circle cx="0" cy="0" r="22" fill="#9EFF00" opacity=".2"/>
          <circle cx="0" cy="0" r="18" fill="#9EFF00" opacity=".3"/>
          <circle cx="0" cy="0" r="16" fill="#9EFF00" className="p" filter="url(#neonGlow)"/>

          <g filter="url(#neonGlow)">
            <rect x="10" y="-10" width="4.5" height="20" fill="#9EFF00" rx="2.25" className="b">
              <animate attributeName="height" values="20;32;20" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="y" values="-10;-16;-10" dur="1.8s" repeatCount="indefinite"/>
            </rect>
            <rect x="17" y="-13" width="4.5" height="26" fill="#9EFF00" rx="2.25" className="b">
              <animate attributeName="height" values="26;36;26" dur="1.8s" begin=".25s" repeatCount="indefinite"/>
              <animate attributeName="y" values="-13;-18;-13" dur="1.8s" begin=".25s" repeatCount="indefinite"/>
            </rect>
            <rect x="24" y="-9" width="4.5" height="18" fill="#9EFF00" rx="2.25" className="b">
              <animate attributeName="height" values="18;30;18" dur="1.8s" begin=".5s" repeatCount="indefinite"/>
              <animate attributeName="y" values="-9;-15;-9" dur="1.8s" begin=".5s" repeatCount="indefinite"/>
            </rect>
          </g>
        </g>

        {/* Logotipo levemente afastado das ondas */}
        <text 
          x="-190" 
          y="12" 
          fontFamily="'Inter','Poppins','Arial',sans-serif"
          fontSize="64" 
          fontWeight="800" 
          fill="#FFFFFF" 
          letterSpacing="2"
        >
          Hubvox
        </text>

        {/* By JT alinhado abaixo do 'X' */}
        <text 
          x="35" 
          y="52" 
          fontFamily="'Inter','Poppins','Arial',sans-serif"
          fontSize="10" 
          fontWeight="600" 
          fill="#FFFFFF" 
          letterSpacing="0.5" 
          opacity="0.6"
        >
          By JT
        </text>
      </g>
    </svg>
  );
};

export default JTVoxLogo;
