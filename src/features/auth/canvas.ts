/** The fixed-size design canvas (412 x 823) that the older sign-in screens are laid out on. */
export const CANVAS_WIDTH = 412;
export const CANVAS_HEIGHT = 823;

type Size = { width: number; height: number };
type Insets = { top: number; bottom: number };

/**
 * Fits the canvas inside the window without the status bar at the top or the system navigation
 * buttons at the bottom: scaled down (never up) and centred in the space that is left.
 * `left` and `top` are the canvas's position in window coordinates.
 */
export function fitCanvas(window: Size, insets: Insets) {
  const availableHeight = Math.max(0, window.height - insets.top - insets.bottom);
  const scale = Math.min(1, window.width / CANVAS_WIDTH, availableHeight / CANVAS_HEIGHT);
  const canvasWidth = CANVAS_WIDTH * scale;
  const canvasHeight = CANVAS_HEIGHT * scale;
  return {
    scale,
    canvasWidth,
    canvasHeight,
    left: (window.width - canvasWidth) / 2,
    top: insets.top + (availableHeight - canvasHeight) / 2,
  };
}
