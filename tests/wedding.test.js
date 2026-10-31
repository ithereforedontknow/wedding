import test from "node:test";
import assert from "node:assert/strict";
import { WEDDING } from "../src/config.js";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  createPassCode,
  escapeIcsText,
  formatIcsDate,
  getWeddingTimestamp,
} from "../src/lib/wedding.js";

test("canonical date is 2:00 PM Philippine time", () => {
  assert.equal(getWeddingTimestamp(WEDDING.date), Date.UTC(2027, 3, 10, 6, 0, 0));
  assert.equal(WEDDING.dateLabel, "Saturday, April 10, 2027");
  assert.equal(WEDDING.venue, "Casa De Hufana");
  assert.equal(WEDDING.address, "Agoo, La Union, Philippines");
  assert.equal(WEDDING.rsvpDeadline, "March 1, 2027");
});

test("schedule starts at 1:30 PM and the ceremony is 2:00 PM", () => {
  assert.equal(WEDDING.schedule.length, 6);
  assert.equal(WEDDING.schedule[0].time, "1:30 PM");
  assert.equal(WEDDING.schedule[1].time, "2:00 PM");
  assert.equal(WEDDING.schedule[5].time, "8:30 PM");
});

test("Google Calendar URL uses canonical UTC dates and location", () => {
  const url = buildGoogleCalendarUrl(WEDDING);
  assert.match(url, /dates=20270410T060000Z\/20270410T123000Z/);
  assert.match(url, /text=Enjelaine%20%26%20Erwin's%20Wedding/);
  assert.match(url, /location=Casa%20De%20Hufana%2C%20Agoo%2C%20La%20Union%2C%20Philippines/);
});

test("ICS uses CRLF, UTC dates, and escaped text", () => {
  const ics = buildIcsContent(WEDDING, {
    uid: "test@example.com",
    now: new Date("2026-10-28T00:00:00Z"),
  });
  assert.ok(ics.includes("\r\n"));
  assert.ok(ics.includes("UID:test@example.com"));
  assert.ok(ics.includes("DTSTAMP:20261028T000000Z"));
  assert.ok(ics.includes("DTSTART:20270410T060000Z"));
  assert.ok(ics.includes("DTEND:20270410T123000Z"));
  assert.ok(ics.includes("LOCATION:Casa De Hufana\\, Agoo\\, La Union\\, Philippines"));
});

test("ICS text escaping handles commas, semicolons, newlines, and backslashes", () => {
  assert.equal(escapeIcsText("a,b;c\nd\\e"), "a\\,b\\;c\\nd\\\\e");
});

test("pass code is a four-digit string generated from the supplied random source", () => {
  assert.equal(createPassCode(() => 0), "1000");
  assert.equal(createPassCode(() => 0.5), "5500");
});

test("ICS date formatting is UTC and second-precision", () => {
  assert.equal(formatIcsDate(new Date("2027-04-10T06:00:00Z")), "20270410T060000Z");
});
