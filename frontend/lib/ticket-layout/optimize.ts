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
  const topMargin = opts.topMarginMm ?? 5;
  const bottomMargin = opts.bottomMarginMm ?? 5;
  const leftMargin = opts.leftMarginMm ?? 5;
  const rightMargin = opts.rightMarginMm ?? 5;
  const spacing = opts.spacingMm ?? 5;
  
  const usableWidth = Math.max(0, opts.paperWidthMm - leftMargin - rightMargin);
  const usableHeight = Math.max(0, opts.paperHeightMm - topMargin - bottomMargin);
  
  // Try different orientations
  const layouts: { placements: Placement[]; count: number; orientation: 'horizontal' | 'vertical' }[] = [];
  
  // Horizontal layout
  if (!opts.verticalOnly) {
    const horizontal = calculateGrid(
      usableWidth, usableHeight,
      opts.cardWidthMm, opts.cardHeightMm,
      spacing, leftMargin, topMargin, 0
    );
    layouts.push({ placements: horizontal, count: horizontal.length, orientation: 'horizontal' });
  }
  
  // Vertical layout (90° rotation)
  if (!opts.horizontalOnly && (opts.autoRotate || opts.verticalOnly)) {
    const vertical = calculateGrid(
      usableWidth, usableHeight,
      opts.cardHeightMm, opts.cardWidthMm,  // Swapped dimensions
      spacing, leftMargin, topMargin, 90
    );
    layouts.push({ placements: vertical, count: vertical.length, orientation: 'vertical' });
  }
  
  // Choose best layout
  const bestLayout = layouts.sort((a, b) => b.count - a.count)[0];
  if (!bestLayout) {
    return { placements: [], fittedCount: 0 };
  }
  
  let final = bestLayout.placements;
  if (opts.cardCount && opts.cardCount > 0) {
    final = final.slice(0, opts.cardCount);
  }
  
  return { placements: final, fittedCount: final.length };
}

function calculateGrid(
  usableWidth: number,
  usableHeight: number,
  cardWidth: number,
  cardHeight: number,
  spacing: number,
  leftMargin: number,
  topMargin: number,
  rotation: 0 | 90
): Placement[] {
  const cardWithSpacingW = cardWidth + spacing;
  const cardWithSpacingH = cardHeight + spacing;
  
  const cols = Math.floor((usableWidth + spacing) / cardWithSpacingW);
  const rows = Math.floor((usableHeight + spacing) / cardWithSpacingH);
  
  const placements: Placement[] = [];
  let index = 0;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = leftMargin + col * cardWithSpacingW;
      const y = topMargin + row * cardWithSpacingH;
      
      placements.push({
        xMm: Number(x.toFixed(6)),
        yMm: Number(y.toFixed(6)),
        widthMm: Number(cardWidth.toFixed(6)),
        heightMm: Number(cardHeight.toFixed(6)),
        rotation: rotation,
        row,
        col,
        index: index++,
      });
    }
  }
  
  return placements;
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