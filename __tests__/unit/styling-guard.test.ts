// Keeps the styling rules true as the app grows (docs/ui/styling.md). A new screen that hard-codes a colour,
// or reaches for a removed helper, fails here with the file and line instead of slipping through review.
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(__dirname, '..', '..');

/** Every .ts and .tsx file under a folder, except tests. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const files = [...sourceFiles(join(ROOT, 'app')), ...sourceFiles(join(ROOT, 'src'))];
const rel = (path: string) => relative(ROOT, path).replace(/\\/g, '/');

/** The lines of every source file that match a pattern, as "file:line: text". */
function matches(pattern: RegExp, skip: (file: string) => boolean = () => false): string[] {
  return files.flatMap((file) => {
    if (skip(rel(file))) return [];
    return readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .flatMap((line, index) => (pattern.test(line) ? [`${rel(file)}:${index + 1}: ${line.trim()}`] : []));
  });
}

describe('styling rules', () => {
  it('has no hard-coded colours outside the theme (and the PDF builder, which makes its own page)', () => {
    const colour = /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/;
    const allowed = (file: string) => file === 'src/constants/theme.ts' || file === 'src/features/health-profile/pdf-export.ts';

    expect(matches(colour, allowed)).toEqual([]);
  });

  it('does not use the removed screen-width scaling helpers or the fixed sign-in canvas', () => {
    const removed = /services\/scale|scaleWidth\(|scaleHeight\(|scaleFont\(|features\/auth\/canvas|fitCanvas/;

    expect(matches(removed)).toEqual([]);
  });

  it('does not use the removed components/mpowered folder', () => {
    expect(matches(/components\/mpowered/)).toEqual([]);
  });

  it('does not use absolute pixel positions for layout in screens', () => {
    // A screen lays itself out with flex. Overlays (badges, sliders, artwork) belong in components.
    const absolute = /position:\s*'absolute'/;
    const screens = (file: string) => !file.startsWith('app/');

    expect(matches(absolute, screens)).toEqual([]);
  });
});
