// Builds the HTML that expo-print turns into a PDF: the pain profile, the tracking chart and
// table, and the tracking history.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { ProfileSection } from './profile';
import type { ChartPoint, HistoryWeek, PainMetric, WeeklyPainRecord } from './tracking';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapes text and keeps the line breaks used for bulleted statements. */
function text(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1D1B20; margin: 32px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 16px; margin: 0 0 4px; }
  .muted { color: #79747E; font-size: 12px; }
  .section { border: 1px solid #CAC4D0; border-radius: 8px; padding: 12px 16px; margin-top: 16px; page-break-inside: avoid; }
  .item { margin-top: 10px; }
  .label { font-size: 11px; font-weight: 600; color: #49454F; }
  .value { font-size: 13px; margin-top: 2px; }
  .incomplete { font-size: 13px; font-style: italic; color: #79747E; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #E5E5E5; }
  th { color: #49454F; }
  .done { color: #2E7D32; font-weight: 600; }
  .missing { color: #B3261E; font-weight: 600; }
  svg { margin-top: 16px; }
`;

function page(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${STYLES}</style>
</head>
<body>${body}</body>
</html>`;
}

function updatedLine(updated: string | null, generated: string): string {
  const updatedText = updated ? `Updated ${escapeHtml(updated)}` : 'Not updated yet';
  return `<div class="muted">${updatedText} · Generated ${escapeHtml(generated)}</div>`;
}

export function buildProfileHtml(
  sections: ProfileSection[],
  options: { updated: string | null; generated: string },
): string {
  const body = sections
    .map((section) => {
      const heading = `<h2>${escapeHtml(section.title)}</h2>${
        section.period ? `<div class="muted">Period: ${escapeHtml(section.period)}</div>` : ''
      }`;
      const content = section.complete
        ? section.items
            .map(
              (item) =>
                `<div class="item"><div class="label">${text(item.label)}</div><div class="value">${text(item.value)}</div></div>`,
            )
            .join('')
        : `<div class="incomplete">${text(section.incompleteMessage ?? 'Not completed yet.')}</div>`;
      return `<div class="section">${heading}${content}</div>`;
    })
    .join('');
  return page(
    'My Pain Profile',
    `<h1>My Pain Profile</h1>${updatedLine(options.updated, options.generated)}${body}`,
  );
}

/** A simple 0-10 line chart drawn as inline SVG, oldest week on the left. */
export function buildChartSvg(points: ChartPoint[], width = 520, height = 220): string {
  const left = 28;
  const right = 16;
  const top = 10;
  const bottom = 26;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = (index: number) =>
    left + (points.length > 1 ? (index * plotWidth) / (points.length - 1) : plotWidth / 2);
  const y = (value: number) => top + plotHeight - (value / 10) * plotHeight;

  const grid = [0, 2, 4, 6, 8, 10]
    .map(
      (value) =>
        `<line x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}" stroke="#E0E0E0" />` +
        `<text x="${left - 8}" y="${y(value) + 4}" font-size="10" text-anchor="end" fill="#525252">${value}</text>`,
    )
    .join('');
  const line = points.length
    ? `<polyline fill="none" stroke="#6750A4" stroke-width="2" points="${points
        .map((p, i) => `${x(i)},${y(p.value)}`)
        .join(' ')}" />`
    : '';
  const dots = points
    .map(
      (p, i) =>
        `<circle cx="${x(i)}" cy="${y(p.value)}" r="4" fill="#6750A4" />` +
        `<text x="${x(i)}" y="${height - 8}" font-size="10" text-anchor="middle" fill="#525252">${escapeHtml(p.label)}</text>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${grid}${line}${dots}</svg>`;
}

export function buildTrackingChartHtml(options: {
  records: WeeklyPainRecord[];
  points: ChartPoint[];
  metric: PainMetric;
  metricLabel: string;
  location: string | null;
  generated: string;
}): string {
  const rows = options.records
    .map(
      (record) =>
        `<tr><td>${escapeHtml(record.rangeLabel)}</td><td>${record[options.metric]}</td><td>${escapeHtml(record.locations.join(', '))}</td></tr>`,
    )
    .join('');
  const filter = escapeHtml(options.location ?? 'All locations');
  const body = `<h1>My Health Tracking Records</h1>
<div class="muted">${escapeHtml(options.metricLabel)} pain intensity · ${filter} · Generated ${escapeHtml(options.generated)}</div>
${options.points.length ? buildChartSvg(options.points) : '<div class="incomplete">No records for this location.</div>'}
<table><thead><tr><th>Week</th><th>${escapeHtml(options.metricLabel)} pain (0-10)</th><th>Locations</th></tr></thead><tbody>${rows}</tbody></table>`;
  return page('My Health Tracking Records', body);
}

export function buildHistoryHtml(weeks: HistoryWeek[], generated: string): string {
  const header = weeks[0]?.assessments.map((a) => `<th>${escapeHtml(a.label)}</th>`).join('') ?? '';
  const rows = weeks
    .map(
      (week) =>
        `<tr><td>${escapeHtml(week.rangeLabel)}</td>${week.assessments
          .map((a) =>
            a.completed ? '<td class="done">Completed</td>' : '<td class="missing">Not completed</td>',
          )
          .join('')}</tr>`,
    )
    .join('');
  const body = `<h1>My Health Tracking History</h1>
<div class="muted">Generated ${escapeHtml(generated)}</div>
<table><thead><tr><th>Week</th>${header}</tr></thead><tbody>${rows}</tbody></table>`;
  return page('My Health Tracking History', body);
}
