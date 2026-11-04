import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');

describe('tab bars and the phone navigation bar', () => {
  // Screens pad only the top edge and rely on the tab bar to cover the bottom one. A fixed-height bar
  // lets the three-button Android navigation bar sit on top of the tabs (the Settings tab was unreachable).
  it.each([['app/(tabs)/_layout.tsx'], ['app/(support)/_layout.tsx']])(
    '%s adds the bottom safe-area inset to the tab bar',
    (file) => {
      const source = readFileSync(join(root, file), 'utf8');
      expect(source).toContain('useSafeAreaInsets');
      expect(source).toMatch(/insets\.bottom/);
    },
  );
});
