import { Temporal } from "@js-temporal/polyfill";

export function getHijriDate(
  gregorianDate: Temporal.PlainDate
): Temporal.PlainDate {
  return gregorianDate.withCalendar("islamic-umalqura");
}

export function getGregorianDate(
  hijriDate: Temporal.PlainDate
): Temporal.PlainDate {
  return hijriDate.withCalendar("gregory");
}

export function getAge(birthDate: Temporal.PlainDate): number {
  const today = Temporal.Now.plainDateISO();
  return today.since(birthDate).years;
}

export function getNextBirthday(
  birthDate: Temporal.PlainDate
): Temporal.PlainDate {
  const today = Temporal.Now.plainDateISO();
  const todayInCalendar = today.withCalendar(birthDate.calendarId);

  let nextBirthday = birthDate.with({ year: todayInCalendar.year });

  if (Temporal.PlainDate.compare(nextBirthday, todayInCalendar) < 0) {
    nextBirthday = nextBirthday.add({ years: 1 });
  }

  return nextBirthday;
}
