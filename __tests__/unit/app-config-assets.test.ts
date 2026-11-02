/// <reference types="node" />
// Guard for app.json (docs/backend/app-icons-and-splash-plan.md, step I6a). Every icon, splash and
// favicon path it names must exist: a missing one only fails when a native build runs, and the icon
// files have gone missing before (a2f3df2 restored them).

import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const appJson = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8'));

/** Every string in the config that is a path into the project's assets, with where it was found. */
function assetPaths(value: unknown, where = 'expo'): { path: string; where: string }[] {
  if (typeof value === 'string') return value.startsWith('./assets/') ? [{ path: value, where }] : [];
  if (Array.isArray(value)) return value.flatMap((item, index) => assetPaths(item, `${where}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => assetPaths(item, `${where}.${key}`));
  }
  return [];
}

const paths = assetPaths(appJson.expo);

describe('app.json assets', () => {
  it('names the icons and splash images', () => {
    const where = paths.map((p) => p.where);
    expect(where).toEqual(
      expect.arrayContaining([
        'expo.icon',
        'expo.ios.icon',
        'expo.android.adaptiveIcon.foregroundImage',
        'expo.android.adaptiveIcon.monochromeImage',
        'expo.web.favicon',
      ]),
    );
    expect(where.some((w) => w.endsWith('.image'))).toBe(true);
  });

  it.each(paths.map((p) => [p.where, p.path]))('%s (%s) exists', (_, path) => {
    expect(existsSync(join(ROOT, path))).toBe(true);
  });

  it('points iOS at a complete Icon Composer file', () => {
    const icon = join(ROOT, appJson.expo.ios.icon);
    expect(statSync(icon).isDirectory()).toBe(true);
    const { groups } = JSON.parse(readFileSync(join(icon, 'icon.json'), 'utf8'));
    for (const layer of groups.flatMap((group: { layers: { 'image-name': string }[] }) => group.layers)) {
      expect(existsSync(join(icon, 'Assets', layer['image-name']))).toBe(true);
    }
  });

  it('shows the name MPowered under the icon', () => {
    expect(appJson.expo.name).toBe('MPowered');
  });
});
