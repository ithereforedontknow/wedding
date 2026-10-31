// Pure helpers derived from the canonical WEDDING config.
// No side effects, no dependencies — safe to use on the server or the client.

/** Parse the canonical wedding date into a Unix timestamp in milliseconds. */
export function getWeddingTimestamp(dateISO) {
  return new Date(dateISO).getTime();
}

/** Format a Date as an ICS UTC date-time, e.g. 20270410T060000Z. */
export function formatIcsDate(date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

/** Escape text for ICS property values (backslashes first, then ;, , and \n). */
export function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** Build a Google Calendar "add event" URL from the wedding config. */
export function buildGoogleCalendarUrl(wedding) {
  const start = new Date(wedding.date);
  const end = new Date(start.getTime() + wedding.durationHours * 60 * 60 * 1000);
  const dates = `${formatIcsDate(start)}/${formatIcsDate(end)}`;
  const text = `${wedding.partner1} & ${wedding.partner2}'s Wedding`;
  const location = `${wedding.venue}, ${wedding.address}`;
  const details = wedding.message?.paragraphs?.join('\n\n') ?? '';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${dates}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;
}

/** Build a full ICS calendar file for the wedding. */
export function buildIcsContent(wedding, { uid, now = new Date() } = {}) {
  const start = new Date(wedding.date);
  const end = new Date(start.getTime() + wedding.durationHours * 60 * 60 * 1000);
  const location = `${wedding.venue}, ${wedding.address}`;
  const details = wedding.message?.paragraphs?.join('\n\n') ?? '';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(`${wedding.partner1} & ${wedding.partner2}'s Wedding`)}`,
    `DESCRIPTION:${escapeIcsText(details)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.join('\r\n')}\r\n`;
}

/** Generate a four-digit pass code using the supplied (or default) random source. */
export function createPassCode(random = Math.random) {
  return String(Math.floor(1000 + random() * 9000));
}
