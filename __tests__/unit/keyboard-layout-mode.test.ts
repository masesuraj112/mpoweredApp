import appJson from '../../app.json';

describe('keyboard layout on Android', () => {
  it('pans instead of resizing, so the keyboard covers the tab bar and the bar never moves', () => {
    // With the default "resize", Android shrinks the window and lifts the bottom tab bar on top of the keyboard.
    expect(appJson.expo.android.softwareKeyboardLayoutMode).toBe('pan');
  });
});
