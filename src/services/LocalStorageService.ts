import { Temporal } from "@js-temporal/polyfill";
import type { BirthdayEvent, StorageService } from "./types";

const STORAGE_KEY = "birthdayEvents";

export class LocalStorageService implements StorageService {
  getEvents(): BirthdayEvent[] {
    const eventsJson = localStorage.getItem(STORAGE_KEY);
    if (!eventsJson) {
      return [];
    }
    const events = JSON.parse(eventsJson) as any[];
    return events.map((event) => ({
      ...event,
      gregorianDate: Temporal.PlainDate.from(event.gregorianDate),
    }));
  }

  addEvent(event: Omit<BirthdayEvent, "id">): void {
    const events = this.getEvents();
    const newEvent: BirthdayEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...events, newEvent]));
  }
}
