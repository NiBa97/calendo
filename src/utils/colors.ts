/**
 * Utility functions for color operations
 */

/**
 * Determines whether text on a given background color should be black or white
 * based on the background's luminance
 * 
 * @param hexColor - Hex color code (e.g. "#FFFFFF")
 * @returns "#000000" for black text or "#FFFFFF" for white text
 */
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
} 