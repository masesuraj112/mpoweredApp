import { buildChartSvg, buildHistoryHtml, buildProfileHtml, buildTrackingChartHtml, escapeHtml } from './pdf-export';
import type { ProfileSection } from './profile';

describe('escapeHtml', () => {
  it('escapes characters that would change the markup', () => {
    expect(escapeHtml(`<b>"Tom" & 'Jo'</b>`)).toBe('&lt;b&gt;&quot;Tom&quot; &amp; &#39;Jo&#39;&lt;/b&gt;');
  });
});

describe('buildProfileHtml', () => {
  const sections: ProfileSection[] = [
    {
      id: 'about',
      title: 'About me',
      variant: 'summary',
      complete: true,
      items: [{ label: 'Name', value: '<script>x</script>' }],
    },
    {
      id: 'movement',
      title: 'Impacts to Movement',
      variant: 'detail',
      complete: false,
      items: [],
      incompleteMessage: 'Not completed yet.',
    },
  ];

  it('contains every section, escapes user text and marks incomplete sections', () => {
    const html = buildProfileHtml(sections, { updated: '24 May 2026', generated: '25 May 2026' });
    expect(html).toContain('About me');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('class="incomplete">Not completed yet.');
    expect(html).toContain('Updated 24 May 2026');
  });
});

describe('tracking PDFs', () => {
  it('draws one dot per week on the chart', () => {
    const svg = buildChartSvg([
      { label: '10/05', value: 3 },
      { label: '17/05', value: 7 },
    ]);
    expect(svg.match(/<circle/g)).toHaveLength(2);
    expect(svg).toContain('17/05');
  });

  it('puts the selected metric and location in the chart PDF', () => {
    const html = buildTrackingChartHtml({
      records: [
        {
          weekStart: '2026-05-18',
          rangeLabel: '18–24 May 2026',
          chartLabel: '24/05',
          average: 7,
          worst: 9,
          mildest: 6,
          locations: ['Knee'],
        },
      ],
      points: [{ label: '24/05', value: 9 }],
      metric: 'worst',
      metricLabel: 'Worst',
      location: 'Knee',
      generated: '25 May 2026',
    });
    expect(html).toContain('Worst pain intensity · Knee');
    expect(html).toContain('<td>18–24 May 2026</td><td>9</td>');
  });

  it('marks each assessment in the history PDF', () => {
    const html = buildHistoryHtml(
      [
        {
          weekStart: '2026-05-18',
          rangeLabel: '18–24 May 2026',
          completedCount: 1,
          assessments: [
            { type: 'pain', label: 'Pain', completed: true },
            { type: 'movement', label: 'Movement', completed: false },
          ],
        },
      ],
      '25 May 2026',
    );
    expect(html).toContain('<th>Pain</th><th>Movement</th>');
    expect(html).toContain('Completed</td><td class="missing">Not completed');
  });
});
