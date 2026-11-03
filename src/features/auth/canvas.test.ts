import { CANVAS_HEIGHT, CANVAS_WIDTH, fitCanvas } from './canvas';

const noInsets = { top: 0, bottom: 0 };

describe('fitCanvas', () => {
  it('does not scale the canvas up on a large window, and centres it', () => {
    const layout = fitCanvas({ width: 500, height: 1000 }, noInsets);

    expect(layout.scale).toBe(1);
    expect(layout.canvasWidth).toBe(CANVAS_WIDTH);
    expect(layout.canvasHeight).toBe(CANVAS_HEIGHT);
    expect(layout.left).toBe((500 - CANVAS_WIDTH) / 2);
    expect(layout.top).toBe((1000 - CANVAS_HEIGHT) / 2);
  });

  it('scales down to the height left once the system bars are taken out', () => {
    // A phone with on-screen navigation buttons: 24 for the status bar, 48 for the buttons.
    const layout = fitCanvas({ width: 360, height: 780 }, { top: 24, bottom: 48 });

    expect(layout.scale).toBeCloseTo((780 - 24 - 48) / CANVAS_HEIGHT);
    expect(layout.top).toBeCloseTo(24);
    expect(layout.top + layout.canvasHeight).toBeCloseTo(780 - 48);
  });

  it('is limited by the width on a narrow window', () => {
    const layout = fitCanvas({ width: 300, height: 900 }, noInsets);

    expect(layout.scale).toBeCloseTo(300 / CANVAS_WIDTH);
    expect(layout.left).toBeCloseTo(0);
  });

  it.each([
    [{ width: 360, height: 640 }, { top: 24, bottom: 48 }],
    [{ width: 412, height: 915 }, { top: 32, bottom: 24 }],
    [{ width: 390, height: 844 }, { top: 47, bottom: 34 }],
    [{ width: 320, height: 480 }, { top: 20, bottom: 0 }],
  ])('keeps the canvas inside the safe area for %j with insets %j', (window, insets) => {
    const layout = fitCanvas(window, insets);

    expect(layout.top).toBeGreaterThanOrEqual(insets.top - 1e-9);
    expect(layout.top + layout.canvasHeight).toBeLessThanOrEqual(
      window.height - insets.bottom + 1e-9,
    );
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.left + layout.canvasWidth).toBeLessThanOrEqual(window.width + 1e-9);
  });

  it('gives a zero-size canvas, not NaN, when the insets leave no room', () => {
    const layout = fitCanvas({ width: 360, height: 60 }, { top: 40, bottom: 40 });

    expect(layout.scale).toBe(0);
    expect(Number.isNaN(layout.top)).toBe(false);
  });
});
