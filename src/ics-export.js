// .ics calendar export for Stegus deadline reminders.
// Pure functions — no side effects except the download trigger in exportIcs.

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateIcs(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Stegus//Arrival Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Stegus Arrival Deadlines',
    'X-WR-TIMEZONE:Europe/Berlin',
  ];
  events.forEach((ev, i) => {
    const uid = `stegus-${i}-${Date.now()}@stegus.local`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const start = ev.start.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `SUMMARY:${escapeHtml(ev.summary)}`,
      `DESCRIPTION:${escapeHtml(ev.description)}`,
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(icsText, filename) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
