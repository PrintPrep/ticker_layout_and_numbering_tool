// lib/ticket-layout/optimize.ts

export type LayoutOptions = {
  paperWidthMm: number;
  paperHeightMm: number;
  cardWidthMm: number;
  cardHeightMm: number;
  cardCount?: number;
  
  // Margins (distance from paper edge)
  topMarginMm?: number;
  bottomMarginMm?: number;
  leftMarginMm?: number;
  rightMarginMm?: number;
  
  // Spacing (gap between tickets)
  spacingMm?: number;
  
  // Orientation
  horizontalOnly?: boolean;
  verticalOnly?: boolean;
  autoRotate?: boolean;
};

export type Placement = {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotation: 0 | 90 | 180 | 270;
  row: number;
  col: number;
  index: number;
};

/**
 * Client-side layout optimization
 * Same algorithm as Python backend for real-time preview
 */
export function optimizeLayout(opts: LayoutOptions): { placements: Placement[]; fittedCount: number } {
  // Margins (default to 5mm)
  const topMargin = opts.topMarginMm ?? 5;
  const bottomMargin = opts.bottomMarginMm ?? 5;
  const leftMargin = opts.leftMarginMm ?? 5;
  const rightMargin = opts.rightMarginMm ?? 5;
  
  // Spacing (default to 5mm)
  const spacing = opts.spacingMm ?? 5;
  
  // Calculate usable area
  const usableWidth = Math.max(0, opts.paperWidthMm - leftMargin - rightMargin);
  const usableHeight = Math.max(0, opts.paperHeightMm - topMargin - bottomMargin);
  
  // Card dimensions with spacing
  const cardWithSpacingW = opts.cardWidthMm + spacing;
  const cardWithSpacingH = opts.cardHeightMm + spacing;
  
  // Calculate grid (spacing not counted on last column/row)
  const cols = Math.floor((usableWidth + spacing) / cardWithSpacingW);
  const rows = Math.floor((usableHeight + spacing) / cardWithSpacingH);
  
  const placements: Placement[] = [];
  let index = 0;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Position includes margin offset
      const x = leftMargin + col * cardWithSpacingW;
      const y = topMargin + row * cardWithSpacingH;
      
      placements.push({
        xMm: Number(x.toFixed(6)),
        yMm: Number(y.toFixed(6)),
        widthMm: Number(opts.cardWidthMm.toFixed(6)),
        heightMm: Number(opts.cardHeightMm.toFixed(6)),
        rotation: 0,
        row,
        col,
        index: index++,
      });
      
      // Stop if card count specified and reached
      if (opts.cardCount && index >= opts.cardCount) {
        break;
      }
    }
    
    if (opts.cardCount && index >= opts.cardCount) {
      break;
    }
  }
  
  // Limit to requested count
  let final = placements;
  if (opts.cardCount && opts.cardCount > 0) {
    final = placements.slice(0, opts.cardCount);
  }
  
  return { placements: final, fittedCount: final.length };
}

/**
 * Calculate total sheets needed
 */
export function calculateTotalSheets(
  totalCopies: number,
  ticketsPerSheet: number
): number {
  if (ticketsPerSheet === 0) return 0;
  return Math.ceil(totalCopies / ticketsPerSheet);
}