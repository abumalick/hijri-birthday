import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { LocalStorageService } from '../services/LocalStorageService';
import type { BirthdayEvent } from '../services/types';
import { getAge, getHijriDate, getNextBirthday } from '../utils/dates';

export const Route = createFileRoute('/')({
  component: BirthdayList,
});

function BirthdayList() {
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const storageService = useMemo(() => new LocalStorageService(), []);

  useEffect(() => {
    const storedEvents = storageService.getEvents();
    const sortedEvents = storedEvents.sort((a, b) => {
      const nextBirthdayA = getNextBirthday(a.gregorianDate);
      const nextBirthdayB = getNextBirthday(b.gregorianDate);
      return nextBirthdayA.since(nextBirthdayB).total({ unit: 'day' });
    });
    setEvents(sortedEvents);
  }, [storageService]);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-4xl font-bold">Upcoming Birthdays</h1>
      {events.length === 0 ? (
        <p>No birthdays yet. Add one to get started!</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 shadow-lg card bg-base-100">
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-bold">Gregorian</p>
                  <p>{event.gregorianDate.toString()}</p>
                  <p>Age: {getAge(event.gregorianDate)}</p>
                </div>
                <div>
                  <p className="font-bold">Hijri</p>
                  <p>{getHijriDate(event.gregorianDate).toString()}</p>
                  <p>
                    Age: {getAge(getHijriDate(event.gregorianDate))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/add" className="btn btn-primary btn-circle fixed bottom-4 right-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v12m6-6H6"
          />
        </svg>
      </Link>
    </div>
  );
}
