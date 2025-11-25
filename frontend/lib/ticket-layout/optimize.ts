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
  
  // Orientation flags
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

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Client-side layout optimization with three fill methods
 * Matches Python backend algorithm exactly
 */
export function optimizeLayout(opts: LayoutOptions): { 
  placements: Placement[]; 
  fittedCount: number;
  ticketsPerSheet: number;
  totalSheets: number;
  usableWidthMm: number;
  usableHeightMm: number;
} {
  const topMargin = opts.topMarginMm ?? 5;
  const bottomMargin = opts.bottomMarginMm ?? 5;
  const leftMargin = opts.leftMarginMm ?? 5;
  const rightMargin = opts.rightMarginMm ?? 5;
  const spacing = opts.spacingMm ?? 5;
  
  const usableWidth = Math.max(0, opts.paperWidthMm - leftMargin - rightMargin);
  const usableHeight = Math.max(0, opts.paperHeightMm - topMargin - bottomMargin);
  
  // Determine fill mode from boolean flags
  let fillMode: 'horizontal' | 'vertical' | 'auto-rotate';
  if (opts.horizontalOnly) {
    fillMode = 'horizontal';
  } else if (opts.verticalOnly) {
    fillMode = 'vertical';
  } else if (opts.autoRotate !== false) {  // Default to autoRotate if not specified
    fillMode = 'auto-rotate';
  } else {
    fillMode = 'horizontal';
  }
  
  let placements: Placement[] = [];
  
  // Calculate placements based on fill mode
  if (fillMode === 'horizontal') {
    placements = calculateGridLayout(
      usableWidth, usableHeight,
      opts.cardWidthMm, opts.cardHeightMm,
      spacing, leftMargin, topMargin, 0
    );
  } else if (fillMode === 'vertical') {
    placements = calculateGridLayout(
      usableWidth, usableHeight,
      opts.cardHeightMm, opts.cardWidthMm, // Swapped
      spacing, leftMargin, topMargin, 90
    );
  } else {
    placements = calculateMixedOrientationLayout(
      usableWidth, usableHeight,
      opts.cardWidthMm, opts.cardHeightMm,
      spacing, leftMargin, topMargin
    );
  }
  
  // Apply card count limit if specified
  if (opts.cardCount && opts.cardCount > 0) {
    placements = placements.slice(0, opts.cardCount);
  }
  
  const fittedCount = placements.length;
  const ticketsPerSheet = placements.length;
  const totalSheets = opts.cardCount 
    ? Math.ceil(opts.cardCount / ticketsPerSheet)
    : 1;
  
  return {
    placements,
    fittedCount,
    ticketsPerSheet,
    totalSheets,
    usableWidthMm: usableWidth,
    usableHeightMm: usableHeight
  };
}

/**
 * Grid-based layout (for horizontal or vertical only)
 */
function calculateGridLayout(
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
 * Mixed-orientation layout using guillotine bin packing
 * This allows both horizontal and vertical cards on the same page
 */
function calculateMixedOrientationLayout(
  usableWidth: number,
  usableHeight: number,
  cardWidth: number,
  cardHeight: number,
  spacing: number,
  leftMargin: number,
  topMargin: number
): Placement[] {
  const placements: Placement[] = [];
  const freeRectangles: Rectangle[] = [
    { x: 0, y: 0, width: usableWidth, height: usableHeight }
  ];
  
  let index = 0;
  let gridRow = 0;
  let gridCol = 0;
  
  // Keep trying to place cards until no more space
  while (freeRectangles.length > 0) {
    // Find best rectangle and orientation
    let bestRect: Rectangle | null = null;
    let bestRectIndex = -1;
    let bestRotation: 0 | 90 = 0;
    let bestFit = Infinity;
    
    // Try each free rectangle
    for (let i = 0; i < freeRectangles.length; i++) {
      const rect = freeRectangles[i];
      
      // Try horizontal orientation (0°)
      if (rect.width >= cardWidth && rect.height >= cardHeight) {
        const wastedSpace = (rect.width * rect.height) - (cardWidth * cardHeight);
        if (wastedSpace < bestFit) {
          bestFit = wastedSpace;
          bestRect = rect;
          bestRectIndex = i;
          bestRotation = 0;
        }
      }
      
      // Try vertical orientation (90°)
      if (rect.width >= cardHeight && rect.height >= cardWidth) {
        const wastedSpace = (rect.width * rect.height) - (cardHeight * cardWidth);
        if (wastedSpace < bestFit) {
          bestFit = wastedSpace;
          bestRect = rect;
          bestRectIndex = i;
          bestRotation = 90;
        }
      }
    }
    
    // No more space available
    if (!bestRect) break;
    
    // Determine actual card dimensions based on rotation
    const actualWidth = bestRotation === 0 ? cardWidth : cardHeight;
    const actualHeight = bestRotation === 0 ? cardHeight : cardWidth;
    
    // FIX: Use the correct dimensions for space calculation
    const placedWidth = bestRotation === 0 ? cardWidth : cardHeight;
    const placedHeight = bestRotation === 0 ? cardHeight : cardWidth;
    
    // Place the card
    placements.push({
      xMm: Number((leftMargin + bestRect.x).toFixed(6)),
      yMm: Number((topMargin + bestRect.y).toFixed(6)),
      widthMm: Number(placedWidth.toFixed(6)),  // Use placedWidth instead of actualWidth
      heightMm: Number(placedHeight.toFixed(6)), // Use placedHeight instead of actualHeight
      rotation: bestRotation,
      row: gridRow,
      col: gridCol,
      index: index++,
    });
    
    // Remove used rectangle
    freeRectangles.splice(bestRectIndex, 1);
    
    // Split remaining space using guillotine cuts
    // FIX: Use placed dimensions for space calculation
    const remainingRight = bestRect.width - placedWidth - spacing;
    const remainingBottom = bestRect.height - placedHeight - spacing;
    
    // Add right rectangle if there's space
    if (remainingRight > 0) {
      freeRectangles.push({
        x: bestRect.x + placedWidth + spacing,
        y: bestRect.y,
        width: remainingRight,
        height: bestRect.height
      });
    }
    
    // Add bottom rectangle if there's space
    if (remainingBottom > 0) {
      freeRectangles.push({
        x: bestRect.x,
        y: bestRect.y + placedHeight + spacing,
        width: bestRect.width,  // FIX: Use full width, not just placed width
        height: remainingBottom
      });
    }
    
    // Update grid position (approximate)
    gridCol++;
    if (gridCol > 5) { // Arbitrary wrap for display purposes
      gridCol = 0;
      gridRow++;
    }
    
    // Sort rectangles by area (larger first) for better packing
    freeRectangles.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    // Safety limit to prevent infinite loops
    if (index > 1000) break;
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