import { Temporal } from "@js-temporal/polyfill";

export type BirthdayEvent = {
  id: string;
  name: string;
  gregorianDate: Temporal.PlainDate;
};

export interface StorageService {
  getEvents: () => BirthdayEvent[];
  addEvent: (event: Omit<BirthdayEvent, "id">) => void;
  // TODO: Add methods for updating and deleting events
}
