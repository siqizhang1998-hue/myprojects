
import React from 'react';
import { TileType } from './types';

export const GRID_SIZE = 8;
export const TILE_TYPES = [
  TileType.MASK,
  TileType.SQUID,
  TileType.CUP,
  TileType.NAIL,
  TileType.HEART,
  TileType.STAR
];

export const COLORS = {
  [TileType.MASK]: 'text-red-600',
  [TileType.SQUID]: 'text-green-500',
  [TileType.CUP]: 'text-amber-400',
  [TileType.NAIL]: 'text-slate-300',
  [TileType.HEART]: 'text-pink-600',
  [TileType.STAR]: 'text-cyan-400',
};

// Definitions for SVG Gradients and Filters
export const SVG_DEFS = (
  <defs>
    {/* --- PERSONA STYLE --- */}
    <linearGradient id="gradP5Red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#d91c2f" />
      <stop offset="100%" stopColor="#87000e" />
    </linearGradient>
    <pattern id="p5Halftone" width="4" height="4" patternUnits="userSpaceOnUse">
       <circle cx="2" cy="2" r="1.5" fill="black" fillOpacity="0.2"/>
    </pattern>
    
    {/* --- SPLATOON STYLE --- */}
    <linearGradient id="gradSquidBody" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="#8bff55" /> 
      <stop offset="50%" stopColor="#00d43b" />
      <stop offset="100%" stopColor="#00962a" />
    </linearGradient>
    <filter id="liquidGloss" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
      <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="25" lightingColor="#ffffff" result="specOut">
        <fePointLight x="-50" y="-100" z="200" />
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
    </filter>
    
    {/* --- CUPHEAD STYLE --- */}
    <filter id="retroInk">
       <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
       <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
    </filter>
    <linearGradient id="gradRetroCup" x1="0%" y1="0%" x2="0%" y2="100%">
       <stop offset="20%" stopColor="#ffffff" />
       <stop offset="100%" stopColor="#e8e8e8" />
    </linearGradient>

    {/* --- HOLLOW KNIGHT STYLE --- */}
    <linearGradient id="gradVoid" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stopColor="#000000" />
      <stop offset="80%" stopColor="#2d3748" />
    </linearGradient>
    <filter id="glowWhite" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>

    {/* --- GRAFFITI STYLE --- */}
    <linearGradient id="gradGraffiti" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ff00cc" />
      <stop offset="100%" stopColor="#333399" />
    </linearGradient>
    <filter id="sprayPaint">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7" in="noise" result="coloredNoise"/>
        <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="grainyGraphic"/>
        <feMerge>
            <feMergeNode in="SourceGraphic"/>
            <feMergeNode in="grainyGraphic"/>
        </feMerge>
    </filter>

    {/* --- CYBER STAR --- */}
    <linearGradient id="gradCyber" x1="0%" y1="0%" x2="100%" y2="100%">
       <stop offset="0%" stopColor="#00ffff" />
       <stop offset="50%" stopColor="#0099ff" />
       <stop offset="100%" stopColor="#0033cc" />
    </linearGradient>

    {/* Common Drop Shadow for "Sticker" feel */}
    <filter id="strongShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.6)" />
    </filter>
  </defs>
);

export const DECORATION_SVGS = {
    splat: (
        <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
            <path d="M92.6,9.5c-6.8,4.9-3.2,16-11.2,19.3C70.1,33.5,63.1,19.8,51,24.1c-14.4,5.1-9.9,25.9-20.9,32.4
                c-9.1,5.3-22.3-1.6-27.1,8.3c-4.9,10,8.7,16.5,7,27.1c-1.8,11.5-16.7,16.2-14.7,28c1.9,11.5,18.1,13.2,23.1,23.3
                c5.5,11.2-5.7,25.8,2,35.2c8.3,10.2,22-2.9,32.3,4.4c9.1,6.5,8.8,20.8,19.6,23.7c13.2,3.5,19.4-11.9,32.1-13
                c11.9-1,19.1,13.2,30.3,8.7c11.5-4.6,8.2-19.4,18.2-26.7c9.3-6.8,23.2,0.6,29.9-8.4c6.7-9.1-3.6-20.3-0.5-30.9
                c3.3-11.2,18.9-13.8,18.2-25.5c-0.6-11-14.7-14.1-18.4-24.6c-3.9-11.2,7.7-23.7,0.7-33.1c-6.6-8.8-20.2-1.3-28.7-8.4
                c-9.2-7.7-6.2-22.4-17.1-27.1c-12.7-5.5-19.5,10.1-31.5,8.4C102.7,11.9,99.9,4.2,92.6,9.5z"/>
        </svg>
    ),
    stripes: (
        <svg width="100%" height="100%">
            <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" style={{stroke:'currentColor', strokeWidth:1}} />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalHatch)" />
        </svg>
    )
};

// High-Fidelity Artistic Icons
export const ICONS: Record<TileType, React.ReactNode> = {
  [TileType.MASK]: (
    // Persona 5: Stylish, sharp, red/black/white
    <svg viewBox="0 0 100 100" filter="url(#strongShadow)" className="w-full h-full overflow-visible">
        {/* Calling Card Backing */}
        <path d="M50,15 L90,40 L50,85 L10,60 Z" fill="url(#gradP5Red)" stroke="white" strokeWidth="2" transform="rotate(-5 50 50)"/>
        <path d="M50,15 L90,40 L50,85 L10,60 Z" fill="url(#p5Halftone)" opacity="0.4" transform="rotate(-5 50 50)"/>
        
        {/* The Mask */}
        <path d="M20,45 C20,35 40,30 50,30 C60,30 80,35 80,45 C80,45 85,35 90,30 L85,60 C75,70 65,75 50,75 C35,75 25,70 15,60 L10,30 C15,35 20,45 20,45 Z" fill="black" stroke="white" strokeWidth="2"/>
        
        {/* Eyes (Stylized) */}
        <path d="M25,50 L40,45 L35,55 Z" fill="white" />
        <path d="M75,50 L60,45 L65,55 Z" fill="white" />
        
        {/* Splash Accent */}
        <path d="M85,15 L95,5 L80,10" fill="#d91c2f" stroke="none" />
    </svg>
  ),
  [TileType.SQUID]: (
    // Splatoon: Glossy, rounded, liquid
    <svg viewBox="0 0 100 100" filter="url(#strongShadow)" className="w-full h-full overflow-visible">
        <g filter="url(#liquidGloss)">
          {/* Main Body */}
          <path d="M50,10 C30,10 15,30 15,50 C15,70 10,80 5,90 L30,90 C30,80 35,75 50,75 C65,75 70,80 70,90 L95,90 C90,80 85,70 85,50 C85,30 70,10 50,10 Z" fill="url(#gradSquidBody)" stroke="black" strokeWidth="1" />
          {/* Tentacle Shadows */}
          <path d="M15,50 Q20,60 25,50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
        </g>
        
        {/* Eyes (Masked) */}
        <path d="M30,40 C25,40 25,60 30,60 C35,60 40,65 50,65 C60,65 65,60 70,60 C75,60 75,40 70,40 C65,40 60,35 50,35 C40,35 35,40 30,40" fill="black" />
        <circle cx="38" cy="50" r="7" fill="white" />
        <circle cx="62" cy="50" r="7" fill="white" />
        <circle cx="39" cy="50" r="3" fill="black" />
        <circle cx="61" cy="50" r="3" fill="black" />
    </svg>
  ),
  [TileType.CUP]: (
    // Cuphead: Rubber Hose, Retro, Thick Lines
    <svg viewBox="0 0 100 100" filter="url(#strongShadow)" className="w-full h-full overflow-visible">
        <g filter="url(#retroInk)">
            {/* Straw */}
            <path d="M60,25 L75,5 L85,10 L70,30" fill="white" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
            <line x1="68" y1="14" x2="80" y2="20" stroke="#d91c2f" strokeWidth="4" />
            
            {/* Handle */}
            <path d="M80,45 C98,45 98,70 80,70" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round"/>
            
            {/* Cup Body */}
            <path d="M20,30 L80,30 L75,70 C70,90 30,90 25,70 L20,30 Z" fill="url(#gradRetroCup)" stroke="black" strokeWidth="4" strokeLinejoin="round"/>
            
            {/* Pie Eyes */}
            <ellipse cx="40" cy="50" rx="6" ry="10" fill="black"/>
            <path d="M40,50 L46,55 L46,45 Z" fill="white"/> {/* Pie cut */}
            
            <ellipse cx="60" cy="50" rx="6" ry="10" fill="black"/>
            <path d="M60,50 L66,55 L66,45 Z" fill="white"/> {/* Pie cut */}
            
            {/* Nose */}
            <circle cx="50" cy="62" r="4" fill="#d91c2f" stroke="black" strokeWidth="2" />
            
            {/* Mouth */}
            <path d="M40,75 Q50,82 60,75" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>
        </g>
    </svg>
  ),
  [TileType.NAIL]: (
    // Hollow Knight: Matte, Void, Simple Shapes
    <svg viewBox="0 0 100 100" filter="url(#strongShadow)" className="w-full h-full overflow-visible">
        {/* Void Particles */}
        <circle cx="20" cy="80" r="5" fill="black" opacity="0.6">
             <animate attributeName="cy" from="85" to="75" dur="2s" repeatCount="indefinite" />
             <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
         <circle cx="80" cy="85" r="3" fill="black" opacity="0.6">
             <animate attributeName="cy" from="90" to="80" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
             <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>

        {/* The Shell */}
        <path d="M25,25 Q35,5 50,20 Q65,5 75,25 Q80,45 75,65 Q70,90 50,90 Q30,90 25,65 Q20,45 25,25 Z" fill="#e2e8f0" stroke="black" strokeWidth="3" />
        
        {/* The Horns Top Layer Fix */}
        <path d="M25,25 Q35,5 50,20 Q65,5 75,25" fill="#e2e8f0" stroke="black" strokeWidth="3" />

        {/* Eyes (Void) */}
        <path d="M32,45 C32,45 35,35 45,45 C55,55 40,65 32,45 Z" fill="black" />
        <path d="M68,45 C68,45 65,35 55,45 C45,55 60,65 68,45 Z" fill="black" />
    </svg>
  ),
  [TileType.HEART]: (
    // Graffiti: Drips, Stencil, Punk
    <svg viewBox="0 0 100 100" filter="url(#strongShadow)" className="w-full h-full overflow-visible">
        <g filter="url(#sprayPaint)">
           <path d="M50,90 C50,90 10,60 10,35 C10,15 35,15 50,30 C65,15 90,15 90,35 C90,60 50,90 50,90 Z" fill="url(#gradGraffiti)" stroke="white" strokeWidth="3" />
        </g>
        {/* Drips */}
        <path d="M30,70 L30,85" stroke="#ff00cc" strokeWidth="4" strokeLinecap="round" />
        <path d="M70,70 L70,80" stroke="#333399" strokeWidth="4" strokeLinecap="round" />
        
        {/* Shine */}
        <path d="M25,30 Q35,25 40,40" fill="none" stroke="white" strokeWidth="3" opacity="0.8" strokeLinecap="round" />
        
        {/* X Mark */}
        <path d="M60,30 L70,40 M70,30 L60,40" stroke="black" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
  [TileType.STAR]: (
    // Cyber/Pop Star: Sharp, Metallic
    <svg viewBox="0 0 100 100" filter="url(#strongShadow)" className="w-full h-full overflow-visible">
        <path d="M50,2 L65,35 L98,35 L73,58 L83,90 L50,70 L17,90 L27,58 L2,35 L35,35 Z" fill="url(#gradCyber)" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        
        {/* Inner Facets for 3D effect */}
        <path d="M50,50 L50,2 L65,35 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M50,50 L98,35 L73,58 Z" fill="rgba(0,0,0,0.2)" />
        <path d="M50,50 L83,90 L50,70 Z" fill="rgba(0,0,0,0.4)" />
        <path d="M50,50 L17,90 L27,58 Z" fill="rgba(0,0,0,0.3)" />
        <path d="M50,50 L2,35 L35,35 Z" fill="rgba(255,255,255,0.2)" />
        
        <circle cx="50" cy="50" r="5" fill="white" />
    </svg>
  ),
};
