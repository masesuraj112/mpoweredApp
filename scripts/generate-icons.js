/* global __dirname */
// Makes the Android, fallback, notification, favicon and splash PNGs from the logo in the iOS icon
// (assets/mpowered-app-icon.icon/Assets/mpoweredicon.svg). The logo's path is reused unchanged;
// each PNG is a wrapper SVG that sizes, places and colours it. See
// docs/backend/app-icons-and-splash-plan.md section 5.
//
// The renderer is not a project dependency. To run:
//   npm install --no-save @resvg/resvg-js@2.6.2
//   node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/mpowered-app-icon.icon/Assets/mpoweredicon.svg'), 'utf8');

const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(source);
const pathData = /<path d="([^"]+)"/.exec(source);
if (!viewBox || !pathData || (source.match(/<path /g) ?? []).length !== 1) {
  throw new Error('Expected one <path> with a viewBox in mpoweredicon.svg');
}
const logoWidth = Number(viewBox[1]);
const logoHeight = Number(viewBox[2]);

// The icon's colours (icon.json fill and the logo's fill).
const BACKGROUND = '#392C5C';
const LOGO = '#D0BCFE';
const WHITE = '#FFFFFF';

/**
 * A `width`×`height` PNG with the logo `logoPx` wide, centred, in `colour`, on `background`
 * (transparent when null).
 */
function render(file, { width, height = width, logoPx, colour, background = null }) {
  const scale = logoPx / logoWidth;
  const x = (width - logoWidth * scale) / 2;
  const y = (height - logoHeight * scale) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${
    background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : ''
  }<g transform="translate(${x} ${y}) scale(${scale})"><path d="${pathData[1]}" fill="${colour}"/></g></svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng();
  fs.writeFileSync(path.join(root, 'assets/images', file), png);
  console.log(`${file}: ${width}x${height}, logo ${logoPx}px wide`);
}

// Android adaptive icon (108dp canvas; launchers mask it to a circle or squircle). The logo stays well
// inside the 66% safe zone: 440 wide is about 43% of the canvas, so its corners clear a circle mask.
render('android-icon-foreground.png', { width: 1024, logoPx: 440, colour: LOGO });
// Themed icons (Android 13+) use only the shape and tint it, so one flat colour.
render('android-icon-monochrome.png', { width: 1024, logoPx: 440, colour: WHITE });
// The top-level icon, for anything without the adaptive or Icon Composer icon.
render('icon.png', { width: 1024, logoPx: 640, colour: LOGO, background: BACKGROUND });
// Android notification icon: white on transparent (Android draws only the shape).
render('notification-icon.png', { width: 96, logoPx: 80, colour: WHITE });
// Web favicon.
render('favicon.png', { width: 48, logoPx: 38, colour: LOGO, background: BACKGROUND });
// Native splash image: the logo alone; expo-splash-screen sizes it with imageWidth.
render('splash-icon.png', { width: 1024, height: Math.round((1024 * logoHeight) / logoWidth), logoPx: 1024, colour: LOGO });
