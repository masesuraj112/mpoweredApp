import { exportFileContents, exportFileName } from './exportFile';

describe('exportFileName', () => {
  it('uses the local calendar date', () => {
    // 11:30pm local time must not roll over to the next day (no UTC conversion)
    expect(exportFileName(new Date(2026, 9, 29, 23, 30))).toBe('mpowered-my-data-2026-10-29.json');
  });

  it('pads the month and day', () => {
    expect(exportFileName(new Date(2026, 0, 5))).toBe('mpowered-my-data-2026-01-05.json');
  });
});

describe('exportFileContents', () => {
  it('pretty-prints the JSON with a trailing newline', () => {
    expect(exportFileContents({ profile: { name: 'Sam' } })).toBe('{\n  "profile": {\n    "name": "Sam"\n  }\n}\n');
  });

  it('round-trips the data', () => {
    const data = { pain_assessments: [{ date: '2026-10-26', locations: ['Knee'] }], patient: null };
    expect(JSON.parse(exportFileContents(data))).toEqual(data);
  });
});
