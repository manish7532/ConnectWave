import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import './CalendarClock.css';

const CalendarClock = () => {
  const [currentDateTime, setCurrentDateTime] = useState(DateTime.local());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(DateTime.local());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-fluid ps-0 pe-0">
      <div className="row m-0 w-100">
        <div className="calendar-clock-container mt-3 col-lg-12 col-md-12 col-sm-12">
          <div className="calendar-clock-content">
            <div className="date">{currentDateTime.toLocaleString(DateTime.DATE_FULL)}</div>
            <div className="time">{currentDateTime.toLocaleString(DateTime.TIME_SIMPLE)}</div>
            <div className="day">{currentDateTime.toFormat('cccc')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarClock;
