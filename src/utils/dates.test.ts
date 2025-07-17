import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import {
  getHijriDate,
  getGregorianDate,
  getAge,
  getNextBirthday,
} from "./dates";

describe("Date Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  describe("getHijriDate", () => {
    it("should convert a Gregorian date to Hijri (Umm al-Qura)", () => {
      const gregorianDate = Temporal.PlainDate.from("2024-07-17");
      const hijriDate = getHijriDate(gregorianDate);
      expect(hijriDate.calendarId).toBe("islamic-umalqura");
      expect(hijriDate.year).toBe(1446);
      expect(hijriDate.month).toBe(1);
      expect(hijriDate.day).toBe(11);
    });
  });

  describe("getGregorianDate", () => {
    it("should convert a Hijri date to Gregorian", () => {
      const hijriDate = Temporal.PlainDate.from({
        year: 1446,
        month: 1,
        day: 11,
        calendar: "islamic-umalqura",
      });
      const gregorianDate = getGregorianDate(hijriDate);
      expect(gregorianDate.calendarId).toBe("gregory");
      expect(gregorianDate.year).toBe(2024);
      expect(gregorianDate.month).toBe(7);
      expect(gregorianDate.day).toBe(17);
    });
  });

  describe("getAge", () => {
    it("should calculate the correct age", () => {
      const mockToday = Temporal.PlainDate.from("2024-07-17");
      vi.setSystemTime(
        new Date(mockToday.toZonedDateTime("UTC").toInstant().epochMilliseconds)
      );

      const birthDate = Temporal.PlainDate.from("1990-01-15");
      const age = getAge(birthDate);
      expect(age).toBe(34);
    });

    it("should return age 0 for a date in the same year", () => {
      const mockToday = Temporal.PlainDate.from("2024-07-17");
      vi.setSystemTime(
        new Date(mockToday.toZonedDateTime("UTC").toInstant().epochMilliseconds)
      );

      const birthDate = Temporal.PlainDate.from("2024-01-15");
      const age = getAge(birthDate);
      expect(age).toBe(0);
    });
  });
  it("should calculate the correct age in Hijri years", () => {
    // Today is 2024-07-17 Gregorian, which is 1446-01-11 Hijri.
    const mockToday = Temporal.PlainDate.from("2024-07-17");
    vi.setSystemTime(
      new Date(mockToday.toZonedDateTime("UTC").toInstant().epochMilliseconds)
    );

    // Birth date is 1990-08-22 Gregorian, which corresponds to 1411-02-01 Hijri.
    // A person born on this date would be 33 in Gregorian years.
    // In Hijri years, they are 34, as their birthday for 1446 has not yet passed.
    const birthDate = Temporal.PlainDate.from({
      year: 1411,
      month: 2,
      day: 1,
      calendar: "islamic-umalqura",
    });
    const age = getAge(birthDate);
    expect(age).toBe(34);
  });

  describe("getNextBirthday", () => {
    it("should return the upcoming birthday for the current year if it has not passed", () => {
      const mockToday = Temporal.PlainDate.from("2024-07-17");
      vi.setSystemTime(
        new Date(mockToday.toZonedDateTime("UTC").toInstant().epochMilliseconds)
      );

      const birthDate = Temporal.PlainDate.from({
        year: 1410,
        month: 12,
        day: 15,
        calendar: "islamic-umalqura",
      }); // Approx 1990-07-08

      const nextBirthday = getNextBirthday(birthDate);
      // The next birthday will be in 1446 AH, as 1445 has passed.
      expect(nextBirthday.year).toBe(1446);
      expect(nextBirthday.month).toBe(12);
      expect(nextBirthday.day).toBe(15);
    });

    it("should return the birthday for the next year if it has already passed this year", () => {
      const mockToday = Temporal.PlainDate.from("2024-07-17"); // 1446-01-11
      vi.setSystemTime(
        new Date(mockToday.toZonedDateTime("UTC").toInstant().epochMilliseconds)
      );

      const birthDate = Temporal.PlainDate.from({
        year: 1410,
        month: 1,
        day: 1,
        calendar: "islamic-umalqura",
      });

      const nextBirthday = getNextBirthday(birthDate);
      expect(nextBirthday.year).toBe(1447);
      expect(nextBirthday.month).toBe(1);
      expect(nextBirthday.day).toBe(1);
    });

    it("should return today's date if the birthday is today", () => {
      const mockToday = Temporal.PlainDate.from("2024-07-17"); // 1446-01-11
      vi.setSystemTime(
        new Date(mockToday.toZonedDateTime("UTC").toInstant().epochMilliseconds)
      );

      const birthDate = Temporal.PlainDate.from({
        year: 1410,
        month: 1,
        day: 11,
        calendar: "islamic-umalqura",
      });

      const nextBirthday = getNextBirthday(birthDate);
      expect(nextBirthday.year).toBe(1446);
      expect(nextBirthday.month).toBe(1);
      expect(nextBirthday.day).toBe(11);
      expect(
        nextBirthday.equals(mockToday.withCalendar("islamic-umalqura"))
      ).toBe(true);
    });
  });
});
