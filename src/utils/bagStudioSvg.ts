/**
 * Studio-grade SVG Data URI generator for Tas Grosir Import (TGI).
 * Ensures crisp, high-contrast studio product photography illustrations
 * that load instantaneously with zero external network failures, while
 * serving as selectable studio presets or fallback artwork in Admin Mode.
 */

export interface StudioPreset {
  id: string;
  label: string;
  category: string;
  dataUri: string;
}

function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export function createBagStudioSvg(options: {
  variant:
    | 'backpack-black'
    | 'backpack-olive'
    | 'backpack-navy'
    | 'handbag-taupe'
    | 'handbag-espresso'
    | 'handbag-ivory'
    | 'shoulder-caramel'
    | 'shoulder-onyx'
    | 'grosir-bundle';
  sku: string;
  accentLabel?: string;
}): string {
  const { variant, sku, accentLabel = 'IMPORT GRADE A' } = options;

  const palettes: Record<
    typeof variant,
    {
      bgTop: string;
      bgBottom: string;
      pedestal: string;
      pedestalSide: string;
      primary: string;
      secondary: string;
      highlight: string;
      hardware: string;
      tagBg: string;
    }
  > = {
    'backpack-black': {
      bgTop: '#F4F4F5',
      bgBottom: '#E4E4E7',
      pedestal: '#FAFAFA',
      pedestalSide: '#D4D4D8',
      primary: '#18181B',
      secondary: '#27272A',
      highlight: '#3F3F46',
      hardware: '#A1A1AA',
      tagBg: '#FACC15',
    },
    'backpack-olive': {
      bgTop: '#F5F5F4',
      bgBottom: '#E7E5E4',
      pedestal: '#FAFAF9',
      pedestalSide: '#D6D3D1',
      primary: '#2E3A2F',
      secondary: '#1F2820',
      highlight: '#465747',
      hardware: '#D4AF37',
      tagBg: '#FACC15',
    },
    'backpack-navy': {
      bgTop: '#F1F5F9',
      bgBottom: '#E2E8F0',
      pedestal: '#F8FAFC',
      pedestalSide: '#CBD5E1',
      primary: '#1E293B',
      secondary: '#0F172A',
      highlight: '#334155',
      hardware: '#94A3B8',
      tagBg: '#FACC15',
    },
    'handbag-taupe': {
      bgTop: '#F5F3EF',
      bgBottom: '#E6E1DA',
      pedestal: '#FAF8F5',
      pedestalSide: '#D6CFC5',
      primary: '#8C7A6B',
      secondary: '#6E5E51',
      highlight: '#A69383',
      hardware: '#EAB308',
      tagBg: '#FACC15',
    },
    'handbag-espresso': {
      bgTop: '#F5F2EB',
      bgBottom: '#E5DEC9',
      pedestal: '#FAF8F5',
      pedestalSide: '#D5CBB8',
      primary: '#3E2723',
      secondary: '#271714',
      highlight: '#5D4037',
      hardware: '#F59E0B',
      tagBg: '#FACC15',
    },
    'handbag-ivory': {
      bgTop: '#F3F4F6',
      bgBottom: '#E5E7EB',
      pedestal: '#FFFFFF',
      pedestalSide: '#D1D5DB',
      primary: '#E5E0D8',
      secondary: '#C7BFB3',
      highlight: '#F5F2EB',
      hardware: '#D97706',
      tagBg: '#FACC15',
    },
    'shoulder-caramel': {
      bgTop: '#F7F4EF',
      bgBottom: '#EAE3D5',
      pedestal: '#FCFBF9',
      pedestalSide: '#DDD4C3',
      primary: '#9A5B25',
      secondary: '#784419',
      highlight: '#B87333',
      hardware: '#FBBF24',
      tagBg: '#FACC15',
    },
    'shoulder-onyx': {
      bgTop: '#F4F4F5',
      bgBottom: '#E4E4E7',
      pedestal: '#FAFAFA',
      pedestalSide: '#D4D4D8',
      primary: '#18181B',
      secondary: '#09090B',
      highlight: '#3F3F46',
      hardware: '#E4E4E7',
      tagBg: '#FACC15',
    },
    'grosir-bundle': {
      bgTop: '#FEFCE8',
      bgBottom: '#FEF08A',
      pedestal: '#FFFFFF',
      pedestalSide: '#FDE047',
      primary: '#18181B',
      secondary: '#9A5B25',
      highlight: '#52525B',
      hardware: '#FACC15',
      tagBg: '#18181B',
    },
  };

  const p = palettes[variant] || palettes['backpack-black'];

  let bagIllustration = '';

  if (variant.startsWith('backpack')) {
    bagIllustration = `
      <!-- Top Carry Handle -->
      <path d="M 355 130 C 355 92, 445 92, 445 130" fill="none" stroke="${p.secondary}" stroke-width="14" stroke-linecap="round"/>
      <!-- Side Straps Hints -->
      <path d="M 278 260 C 250 310, 255 395, 282 425" fill="none" stroke="${p.secondary}" stroke-width="16" stroke-linecap="round"/>
      <path d="M 522 260 C 550 310, 545 395, 518 425" fill="none" stroke="${p.secondary}" stroke-width="16" stroke-linecap="round"/>
      <!-- Main Backpack Body -->
      <rect x="275" y="125" width="250" height="335" rx="48" fill="url(#bagGrad)" stroke="${p.secondary}" stroke-width="4"/>
      <!-- Upper Zip Seam -->
      <path d="M 285 215 Q 400 232 515 215" fill="none" stroke="${p.hardware}" stroke-width="3" stroke-dasharray="6,4"/>
      <!-- Front Geometric Pocket -->
      <rect x="305" y="255" width="190" height="168" rx="22" fill="${p.secondary}" stroke="${p.highlight}" stroke-width="2.5"/>
      <rect x="305" y="295" width="190" height="5" fill="${p.hardware}" opacity="0.85"/>
      <!-- Metallic Zipper Pulls -->
      <rect x="342" y="295" width="10" height="24" rx="4" fill="${p.hardware}"/>
      <rect x="478" y="208" width="9" height="22" rx="4" fill="${p.hardware}"/>
      <!-- Brand Woven Emblem -->
      <rect x="366" y="162" width="68" height="26" rx="4" fill="${p.secondary}" stroke="${p.hardware}" stroke-width="1.5"/>
      <text x="400" y="179" font-family="monospace" font-size="11" font-weight="700" fill="#FAFAFA" text-anchor="middle" letter-spacing="2">TGI·PRO</text>
      <!-- Side Water Bottle Pockets -->
      <path d="M 262 325 L 275 315 L 275 425 L 262 415 Z" fill="${p.secondary}"/>
      <path d="M 538 325 L 525 315 L 525 425 L 538 415 Z" fill="${p.secondary}"/>
    `;
  } else if (variant.startsWith('handbag')) {
    bagIllustration = `
      <!-- Twin Structured Top Handles -->
      <path d="M 332 215 C 332 108, 468 108, 468 215" fill="none" stroke="${p.secondary}" stroke-width="16" stroke-linecap="round"/>
      <path d="M 348 215 C 348 132, 452 132, 452 215" fill="none" stroke="${p.primary}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
      <!-- Main Trapezoid Luxury Handbag Body -->
      <path d="M 275 215 L 525 215 L 552 448 C 554 460, 544 468, 530 468 L 270 468 C 256 468, 246 460, 248 448 Z" fill="url(#bagGrad)" stroke="${p.secondary}" stroke-width="4"/>
      <!-- Structured Flap & Belted Clasp -->
      <path d="M 275 215 L 525 215 L 505 312 C 498 325, 302 325, 295 312 Z" fill="${p.highlight}" opacity="0.45" stroke="${p.secondary}" stroke-width="2"/>
      <!-- Vertical Leather Strap -->
      <rect x="384" y="215" width="32" height="135" rx="6" fill="${p.secondary}"/>
      <!-- Luxury Gold Turnlock Clasp -->
      <rect x="374" y="302" width="52" height="34" rx="7" fill="${p.hardware}" stroke="${p.secondary}" stroke-width="2"/>
      <circle cx="400" cy="319" r="7" fill="${p.secondary}"/>
      <!-- Handle Mount Rings -->
      <rect x="322" y="205" width="20" height="16" rx="4" fill="${p.hardware}"/>
      <rect x="458" y="205" width="20" height="16" rx="4" fill="${p.hardware}"/>
      <!-- Detachable Leather Key Charm -->
      <path d="M 468 220 L 495 305" stroke="${p.secondary}" stroke-width="5" stroke-linecap="round"/>
      <polygon points="485,298 512,294 518,332 482,335" fill="${p.secondary}" stroke="${p.hardware}" stroke-width="1.5"/>
    `;
  } else if (variant.startsWith('shoulder')) {
    bagIllustration = `
      <!-- Curved Shoulder Strap -->
      <path d="M 255 245 C 260 95, 540 95, 545 245" fill="none" stroke="${p.secondary}" stroke-width="15" stroke-linecap="round"/>
      <!-- Gold Buckle Rings -->
      <circle cx="258" cy="248" r="14" fill="none" stroke="${p.hardware}" stroke-width="6"/>
      <circle cx="542" cy="248" r="14" fill="none" stroke="${p.hardware}" stroke-width="6"/>
      <!-- Crescent Hobo / Shoulder Bag Silhouette -->
      <path d="M 242 248 Q 400 315 558 248 C 578 365, 515 462, 400 462 C 285 462, 222 365, 242 248 Z" fill="url(#bagGrad)" stroke="${p.secondary}" stroke-width="4"/>
      <!-- Subtle Stitching Line -->
      <path d="M 262 274 Q 400 332 538 274 C 552 362, 495 442, 400 442 C 305 442, 248 362, 262 274 Z" fill="none" stroke="${p.highlight}" stroke-width="2" stroke-dasharray="7,5"/>
      <!-- Center Minimalist Gold Emblem -->
      <rect x="372" y="338" width="56" height="22" rx="4" fill="${p.hardware}"/>
      <text x="400" y="353" font-family="sans-serif" font-size="10" font-weight="800" fill="#18181B" text-anchor="middle" letter-spacing="1.5">TGI</text>
    `;
  } else {
    // Wholesale Bundle (3 bags composition)
    bagIllustration = `
      <!-- Left Backpack in Bundle -->
      <rect x="190" y="170" width="165" height="260" rx="32" fill="#18181B" stroke="#3F3F46" stroke-width="3"/>
      <rect x="212" y="275" width="120" height="115" rx="16" fill="#27272A" stroke="#FACC15" stroke-width="2"/>
      <!-- Right Shoulder Bag in Bundle -->
      <path d="M 435 255 Q 535 300 625 255 C 638 345, 595 430, 530 430 C 465 430, 422 345, 435 255 Z" fill="#9A5B25" stroke="#784419" stroke-width="3"/>
      <path d="M 445 255 C 450 155, 610 155, 615 255" fill="none" stroke="#784419" stroke-width="10"/>
      <!-- Center Foreground Handbag -->
      <path d="M 335 225 C 335 140, 445 140, 445 225" fill="none" stroke="#3E2723" stroke-width="13"/>
      <path d="M 290 225 L 490 225 L 512 455 L 268 455 Z" fill="#5D4037" stroke="#271714" stroke-width="4"/>
      <rect x="368" y="305" width="44" height="28" rx="6" fill="#FACC15"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="studioBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${p.bgTop}"/>
          <stop offset="100%" stop-color="${p.bgBottom}"/>
        </linearGradient>
        <linearGradient id="bagGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${p.highlight}"/>
          <stop offset="45%" stop-color="${p.primary}"/>
          <stop offset="100%" stop-color="${p.secondary}"/>
        </linearGradient>
        <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#09090B" stop-opacity="0.38"/>
          <stop offset="70%" stop-color="#09090B" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#09090B" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Studio Cyclorama Backdrop -->
      <rect width="800" height="600" fill="url(#studioBg)"/>
      
      <!-- Architectural Light Beam -->
      <polygon points="0,0 340,0 640,600 0,600" fill="#FFFFFF" opacity="0.28"/>

      <!-- Travertine Studio Pedestal -->
      <ellipse cx="400" cy="485" rx="235" ry="38" fill="${p.pedestalSide}"/>
      <ellipse cx="400" cy="472" rx="235" ry="34" fill="${p.pedestal}"/>
      <ellipse cx="400" cy="466" rx="165" ry="22" fill="url(#floorShadow)"/>

      <!-- Product Render -->
      ${bagIllustration}

      <!-- Studio SKU Watermark Bar Bottom-Right -->
      <rect x="565" y="532" width="195" height="36" rx="8" fill="#18181B" opacity="0.9"/>
      <text x="662" y="555" font-family="monospace" font-size="14" font-weight="700" fill="#FACC15" text-anchor="middle" letter-spacing="1.5">${sku}</text>

      <!-- Top-Right Quality Spec Label -->
      <rect x="595" y="34" width="165" height="30" rx="6" fill="#FFFFFF" opacity="0.85"/>
      <text x="677" y="53" font-family="sans-serif" font-size="11" font-weight="700" fill="#18181B" text-anchor="middle" letter-spacing="1.2">${accentLabel}</text>
    </svg>
  `;

  return svgToDataUri(svg);
}

/**
 * Generates a color-matched Studio SVG for any product and color name so
 * clicking a color dot on a ProductCard immediately updates the product photo
 * to match the selected color variant.
 */
export function createColorMatchedBagSvg(options: {
  category: string;
  sku: string;
  colorName: string;
}): string {
  const { category, sku, colorName } = options;
  const lower = (colorName || '').trim().toLowerCase();

  let primary = '#18181B';
  let secondary = '#09090B';
  let highlight = '#3F3F46';
  let hardware = '#EAB308';
  let bgTop = '#F4F4F5';
  let bgBottom = '#E4E4E7';
  let pedestal = '#FAFAFA';
  let pedestalSide = '#D4D4D8';

  if (
    lower.includes('cream') ||
    lower.includes('krem') ||
    lower.includes('ivory') ||
    lower.includes('oat') ||
    lower.includes('white') ||
    lower.includes('putih')
  ) {
    primary = '#E7E0D6';
    secondary = '#C7B299';
    highlight = '#F7F4EF';
    hardware = '#D97706';
    bgTop = '#F5F3EF';
    bgBottom = '#E6E1DA';
    pedestal = '#FFFFFF';
    pedestalSide = '#D6CFC5';
  } else if (
    lower.includes('mocca') ||
    lower.includes('moka') ||
    lower.includes('mocha') ||
    lower.includes('taupe') ||
    lower.includes('khaki') ||
    lower.includes('sand') ||
    lower.includes('beige')
  ) {
    primary = '#8C735B';
    secondary = '#69533E';
    highlight = '#A88E74';
    hardware = '#F59E0B';
    bgTop = '#F7F4EF';
    bgBottom = '#E8E0D5';
    pedestal = '#FAF8F5';
    pedestalSide = '#D6CFC5';
  } else if (
    lower.includes('caramel') ||
    lower.includes('tan') ||
    lower.includes('camel') ||
    lower.includes('cognac')
  ) {
    primary = '#A45A26';
    secondary = '#7C4218';
    highlight = '#C4733B';
    hardware = '#FBBF24';
    bgTop = '#F8F5F0';
    bgBottom = '#EBE3D5';
    pedestal = '#FCFBF9';
    pedestalSide = '#DDD4C3';
  } else if (
    lower.includes('espresso') ||
    lower.includes('coffee') ||
    lower.includes('coklat') ||
    lower.includes('brown') ||
    lower.includes('choco')
  ) {
    primary = '#432822';
    secondary = '#2A1713';
    highlight = '#5E3B33';
    hardware = '#F59E0B';
    bgTop = '#F5F2EB';
    bgBottom = '#E5DEC9';
    pedestal = '#FAF8F5';
    pedestalSide = '#D5CBB8';
  } else if (lower.includes('navy') || lower.includes('dongker') || lower.includes('blue') || lower.includes('biru')) {
    primary = '#1E293B';
    secondary = '#0F172A';
    highlight = '#334155';
    hardware = '#CBD5E1';
    bgTop = '#F1F5F9';
    bgBottom = '#E2E8F0';
    pedestal = '#F8FAFC';
    pedestalSide = '#CBD5E1';
  } else if (
    lower.includes('olive') ||
    lower.includes('army') ||
    lower.includes('sage') ||
    lower.includes('green') ||
    lower.includes('hijau')
  ) {
    primary = '#364537';
    secondary = '#222C23';
    highlight = '#4E6250';
    hardware = '#EAB308';
    bgTop = '#F5F5F4';
    bgBottom = '#E7E5E4';
    pedestal = '#FAFAF9';
    pedestalSide = '#D6D3D1';
  } else if (
    lower.includes('charcoal') ||
    lower.includes('grey') ||
    lower.includes('gray') ||
    lower.includes('abu') ||
    lower.includes('silver') ||
    lower.includes('slate')
  ) {
    primary = '#52525B';
    secondary = '#3F3F46';
    highlight = '#71717A';
    hardware = '#E4E4E7';
    bgTop = '#F4F4F5';
    bgBottom = '#E4E4E7';
    pedestal = '#FAFAFA';
    pedestalSide = '#D4D4D8';
  } else if (
    lower.includes('burgundy') ||
    lower.includes('maroon') ||
    lower.includes('wine') ||
    lower.includes('red') ||
    lower.includes('merah') ||
    lower.includes('pink') ||
    lower.includes('rose')
  ) {
    primary = '#6B1D2F';
    secondary = '#4A101D';
    highlight = '#8B2940';
    hardware = '#FBBF24';
    bgTop = '#FAF5F6';
    bgBottom = '#EFE2E5';
    pedestal = '#FFFFFF';
    pedestalSide = '#DEC8CD';
  }

  let bagShape = '';
  if (category === 'Backpack') {
    bagShape = `
      <path d="M 355 130 C 355 92, 445 92, 445 130" fill="none" stroke="${secondary}" stroke-width="14" stroke-linecap="round"/>
      <path d="M 278 260 C 250 310, 255 395, 282 425" fill="none" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/>
      <path d="M 522 260 C 550 310, 545 395, 518 425" fill="none" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/>
      <rect x="275" y="125" width="250" height="335" rx="48" fill="url(#bagGrad)" stroke="${secondary}" stroke-width="4"/>
      <path d="M 285 215 Q 400 232 515 215" fill="none" stroke="${hardware}" stroke-width="3" stroke-dasharray="6,4"/>
      <rect x="305" y="255" width="190" height="168" rx="22" fill="${secondary}" stroke="${highlight}" stroke-width="2.5"/>
      <rect x="305" y="295" width="190" height="5" fill="${hardware}" opacity="0.85"/>
      <rect x="342" y="295" width="10" height="24" rx="4" fill="${hardware}"/>
      <rect x="478" y="208" width="9" height="22" rx="4" fill="${hardware}"/>
      <rect x="366" y="162" width="68" height="26" rx="4" fill="${secondary}" stroke="${hardware}" stroke-width="1.5"/>
      <text x="400" y="179" font-family="monospace" font-size="11" font-weight="700" fill="#FAFAFA" text-anchor="middle" letter-spacing="2">TGI·PRO</text>
      <path d="M 262 325 L 275 315 L 275 425 L 262 415 Z" fill="${secondary}"/>
      <path d="M 538 325 L 525 315 L 525 425 L 538 415 Z" fill="${secondary}"/>
    `;
  } else if (category === 'Handbag') {
    bagShape = `
      <path d="M 332 215 C 332 108, 468 108, 468 215" fill="none" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/>
      <path d="M 348 215 C 348 132, 452 132, 452 215" fill="none" stroke="${primary}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
      <path d="M 275 215 L 525 215 L 552 448 C 554 460, 544 468, 530 468 L 270 468 C 256 468, 246 460, 248 448 Z" fill="url(#bagGrad)" stroke="${secondary}" stroke-width="4"/>
      <path d="M 275 215 L 525 215 L 505 312 C 498 325, 302 325, 295 312 Z" fill="${highlight}" opacity="0.45" stroke="${secondary}" stroke-width="2"/>
      <rect x="384" y="215" width="32" height="135" rx="6" fill="${secondary}"/>
      <rect x="374" y="302" width="52" height="34" rx="7" fill="${hardware}" stroke="${secondary}" stroke-width="2"/>
      <circle cx="400" cy="319" r="7" fill="${secondary}"/>
      <rect x="322" y="205" width="20" height="16" rx="4" fill="${hardware}"/>
      <rect x="458" y="205" width="20" height="16" rx="4" fill="${hardware}"/>
      <path d="M 468 220 L 495 305" stroke="${secondary}" stroke-width="5" stroke-linecap="round"/>
      <polygon points="485,298 512,294 518,332 482,335" fill="${secondary}" stroke="${hardware}" stroke-width="1.5"/>
    `;
  } else if (category === 'Shoulder Bag') {
    bagShape = `
      <path d="M 255 245 C 260 95, 540 95, 545 245" fill="none" stroke="${secondary}" stroke-width="15" stroke-linecap="round"/>
      <circle cx="258" cy="248" r="14" fill="none" stroke="${hardware}" stroke-width="6"/>
      <circle cx="542" cy="248" r="14" fill="none" stroke="${hardware}" stroke-width="6"/>
      <path d="M 242 248 Q 400 315 558 248 C 578 365, 515 462, 400 462 C 285 462, 222 365, 242 248 Z" fill="url(#bagGrad)" stroke="${secondary}" stroke-width="4"/>
      <path d="M 262 274 Q 400 332 538 274 C 552 362, 495 442, 400 442 C 305 442, 248 362, 262 274 Z" fill="none" stroke="${highlight}" stroke-width="2" stroke-dasharray="7,5"/>
      <rect x="372" y="338" width="56" height="22" rx="4" fill="${hardware}"/>
      <text x="400" y="353" font-family="sans-serif" font-size="10" font-weight="800" fill="#18181B" text-anchor="middle" letter-spacing="1.5">TGI</text>
    `;
  } else {
    bagShape = `
      <rect x="190" y="170" width="165" height="260" rx="32" fill="${primary}" stroke="${highlight}" stroke-width="3"/>
      <rect x="212" y="275" width="120" height="115" rx="16" fill="${secondary}" stroke="${hardware}" stroke-width="2"/>
      <path d="M 435 255 Q 535 300 625 255 C 638 345, 595 430, 530 430 C 465 430, 422 345, 435 255 Z" fill="${highlight}" stroke="${secondary}" stroke-width="3"/>
      <path d="M 335 225 C 335 140, 445 140, 445 225" fill="none" stroke="${secondary}" stroke-width="13"/>
      <path d="M 290 225 L 490 225 L 512 455 L 268 455 Z" fill="url(#bagGrad)" stroke="${secondary}" stroke-width="4"/>
      <rect x="368" y="305" width="44" height="28" rx="6" fill="${hardware}"/>
    `;
  }

  const cleanColorUpper = (colorName || 'DEFAULT').toUpperCase().slice(0, 22);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="studioBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bgTop}"/>
          <stop offset="100%" stop-color="${bgBottom}"/>
        </linearGradient>
        <linearGradient id="bagGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${highlight}"/>
          <stop offset="45%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
        <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#09090B" stop-opacity="0.38"/>
          <stop offset="70%" stop-color="#09090B" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#09090B" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#studioBg)"/>
      <polygon points="0,0 340,0 640,600 0,600" fill="#FFFFFF" opacity="0.28"/>
      <ellipse cx="400" cy="485" rx="235" ry="38" fill="${pedestalSide}"/>
      <ellipse cx="400" cy="472" rx="235" ry="34" fill="${pedestal}"/>
      <ellipse cx="400" cy="466" rx="165" ry="22" fill="url(#floorShadow)"/>
      ${bagShape}
      <rect x="565" y="532" width="195" height="36" rx="8" fill="#18181B" opacity="0.9"/>
      <text x="662" y="555" font-family="monospace" font-size="14" font-weight="700" fill="#FACC15" text-anchor="middle" letter-spacing="1.5">${sku}</text>
      <rect x="520" y="34" width="240" height="32" rx="8" fill="#18181B" opacity="0.88"/>
      <text x="640" y="55" font-family="sans-serif" font-size="11" font-weight="800" fill="#FACC15" text-anchor="middle" letter-spacing="1.2">WARNA: ${cleanColorUpper}</text>
    </svg>
  `;
  return svgToDataUri(svg);
}

export const HERO_UNSPLASH_PHOTOS: [string, string, string] = [
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=85',
];

export const BENTO_UNSPLASH_PHOTOS: Record<
  'new-arrival-backpack' | 'pickup-gudang',
  string
> = {
  'new-arrival-backpack':
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=85',
  'pickup-gudang':
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85',
};

export function createHeroLookbookSvg(slideIndex: 0 | 1 | 2): string {
  return HERO_UNSPLASH_PHOTOS[slideIndex] || HERO_UNSPLASH_PHOTOS[0];
}

export function createBentoCardCoverSvg(
  variant: 'new-arrival-backpack' | 'pickup-gudang'
): string {
  return BENTO_UNSPLASH_PHOTOS[variant];
}

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: 'backpack-black',
    label: 'Backpack Urban Matte Black',
    category: 'Backpack',
    dataUri: createBagStudioSvg({
      variant: 'backpack-black',
      sku: 'BP-MY-00513',
      accentLabel: 'WATERPROOF NYLON',
    }),
  },
  {
    id: 'handbag-taupe',
    label: 'Handbag Luxury Taupe Leather',
    category: 'Handbag',
    dataUri: createBagStudioSvg({
      variant: 'handbag-taupe',
      sku: 'HB-WQ-10670',
      accentLabel: 'PREMIUM PU LEATHER',
    }),
  },
  {
    id: 'shoulder-caramel',
    label: 'Shoulder Bag Crescent Caramel',
    category: 'Shoulder Bag',
    dataUri: createBagStudioSvg({
      variant: 'shoulder-caramel',
      sku: 'SG-MY-00813',
      accentLabel: 'BEST SELLER IMPORT',
    }),
  },
  {
    id: 'backpack-olive',
    label: 'Backpack Tactical Olive Pro',
    category: 'Backpack',
    dataUri: createBagStudioSvg({
      variant: 'backpack-olive',
      sku: 'BP-TG-00921',
      accentLabel: 'LAPTOP 15.6" READY',
    }),
  },
  {
    id: 'handbag-espresso',
    label: 'Handbag Executive Espresso Tote',
    category: 'Handbag',
    dataUri: createBagStudioSvg({
      variant: 'handbag-espresso',
      sku: 'HB-KL-20415',
      accentLabel: 'GOLD HARDWARE',
    }),
  },
  {
    id: 'shoulder-onyx',
    label: 'Shoulder Bag Minimalist Onyx',
    category: 'Shoulder Bag',
    dataUri: createBagStudioSvg({
      variant: 'shoulder-onyx',
      sku: 'SG-PR-00492',
      accentLabel: 'NEW ARRIVAL',
    }),
  },
  {
    id: 'backpack-navy',
    label: 'Backpack Commuter Midnight Navy',
    category: 'Backpack',
    dataUri: createBagStudioSvg({
      variant: 'backpack-navy',
      sku: 'BP-KR-01104',
      accentLabel: 'USB PORT EDITION',
    }),
  },
  {
    id: 'grosir-bundle',
    label: 'Paket Bundling Grosir Seri Mix',
    category: 'Promo Grosir',
    dataUri: createBagStudioSvg({
      variant: 'grosir-bundle',
      sku: 'PK-GR-00100',
      accentLabel: 'PAKET USAHA 12 PCS',
    }),
  },
];

export function createLiveStudioPosterSvg(variant: 0 | 1 = 0): string {
  const isTiktokTheme = variant === 0;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 540" width="800" height="540">
      <defs>
        <linearGradient id="liveBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#09090B"/>
          <stop offset="55%" stop-color="#18181B"/>
          <stop offset="100%" stop-color="${isTiktokTheme ? '#1E1B4B' : '#431407'}"/>
        </linearGradient>
        <radialGradient id="cyanGlow" cx="20%" cy="25%" r="45%">
          <stop offset="0%" stop-color="${isTiktokTheme ? '#06B6D4' : '#F97316'}" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="pinkGlow" cx="82%" cy="75%" r="48%">
          <stop offset="0%" stop-color="${isTiktokTheme ? '#F43F5E' : '#FACC15'}" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <rect width="800" height="540" fill="url(#liveBg)"/>
      <rect width="800" height="540" fill="url(#cyanGlow)"/>
      <rect width="800" height="540" fill="url(#pinkGlow)"/>

      <!-- Camera Viewfinder Frame Corners -->
      <g stroke="#FAFAFA" stroke-opacity="0.35" stroke-width="3" fill="none">
        <path d="M 36 66 L 36 36 L 66 36"/>
        <path d="M 734 36 L 764 36 L 764 66"/>
        <path d="M 36 474 L 36 504 L 66 504"/>
        <path d="M 734 504 L 764 504 L 764 474"/>
      </g>

      <!-- Top Studio Broadcast Header -->
      <rect x="56" y="54" width="150" height="34" rx="17" fill="#EF4444"/>
      <circle cx="80" cy="71" r="6" fill="#FFFFFF"/>
      <text x="140" y="76" font-family="monospace" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">LIVE STUDIO</text>

      <rect x="220" y="54" width="235" height="34" rx="17" fill="#18181B" stroke="#3F3F46" stroke-width="1.5"/>
      <text x="337" y="76" font-family="monospace" font-size="12" font-weight="700" fill="#FACC15" text-anchor="middle" letter-spacing="1">GUDANG TGI · SPILL REALPICT</text>

      <!-- Studio Table / Display Pedestal -->
      <rect x="110" y="385" width="580" height="95" rx="14" fill="#27272A" stroke="#52525B" stroke-width="2"/>
      <rect x="135" y="368" width="530" height="22" rx="6" fill="#3F3F46"/>

      <!-- Left Bag: Backpack BP-MY-00513 -->
      <g transform="translate(150, 130)">
        <path d="M 55 20 C 55 -8, 105 -8, 105 20" fill="none" stroke="#71717A" stroke-width="10" stroke-linecap="round"/>
        <rect x="10" y="16" width="140" height="205" rx="28" fill="#18181B" stroke="#06B6D4" stroke-width="3"/>
        <rect x="28" y="95" width="104" height="95" rx="14" fill="#27272A" stroke="#FACC15" stroke-width="2"/>
        <rect x="55" y="42" width="50" height="18" rx="4" fill="#FACC15"/>
        <text x="80" y="55" font-family="monospace" font-size="10" font-weight="800" fill="#09090B" text-anchor="middle">TGI</text>
      </g>

      <!-- Center Bag: Luxury Handbag HB-WQ-10670 -->
      <g transform="translate(310, 145)">
        <path d="M 48 45 C 48 -14, 128 -14, 128 45" fill="none" stroke="#D6CFC5" stroke-width="11" stroke-linecap="round"/>
        <path d="M 14 45 L 162 45 L 180 212 L -4 212 Z" fill="#8C7A6B" stroke="#FACC15" stroke-width="3"/>
        <rect x="76" y="45" width="24" height="82" rx="4" fill="#6E5E51"/>
        <rect x="68" y="105" width="40" height="24" rx="5" fill="#FACC15"/>
      </g>

      <!-- Right Bag: Shoulder Bag SG-MY-00813 -->
      <g transform="translate(495, 175)">
        <path d="M 15 55 C 20 -12, 135 -12, 140 55" fill="none" stroke="#FBBF24" stroke-width="10" stroke-linecap="round"/>
        <path d="M 10 55 Q 78 95 145 55 C 158 125, 122 188, 78 188 C 34 188, -2 125, 10 55 Z" fill="#9A5B25" stroke="#F43F5E" stroke-width="3"/>
        <rect x="58" y="108" width="40" height="16" rx="4" fill="#FACC15"/>
      </g>

      <!-- Bottom Banner Strip on Pedestal -->
      <rect x="145" y="405" width="510" height="54" rx="10" fill="#09090B" stroke="#FACC15" stroke-width="1.5"/>
      <text x="400" y="429" font-family="sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">VOUCHER FLASH SALE &amp; HARGA GROSIR SPESIAL LIVE</text>
      <text x="400" y="448" font-family="monospace" font-size="11" font-weight="700" fill="#FACC15" text-anchor="middle" letter-spacing="1">TIKTOK LIVE &amp; SHOPEE LIVE · INTERAKSI LANGSUNG DARI GUDANG</text>
    </svg>
  `;

  return svgToDataUri(svg);
}

