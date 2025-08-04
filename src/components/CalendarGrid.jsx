import React from 'react';
import './CalendarGrid.css';

function CalendarGrid({ year, month, reservations, onDayClick }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth = new Date(year, month, 1);
  const jsDay = firstDayOfMonth.getDay();
  const startDay = jsDay === 0 ? 6 : jsDay - 1;

  // ✅ Tarihi 'YYYY-MM-DD' formatına çeviriyoruz (UTC etkisinden kurtulmak için)
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const getDayStatus = (day) => {
    const targetDate = normalizeDate(new Date(year, month, day));

    return reservations.some((res) => {
      const checkIn = normalizeDate(res.checkIn);
      const checkOut = normalizeDate(res.checkOut);
      return targetDate >= checkIn && targetDate < checkOut;
    }) ? 'dolu' : 'bos';
  };

  const getReservationForDay = (day) => {
    const targetDate = normalizeDate(new Date(year, month, day));

    return reservations.find((res) => {
      const checkIn = normalizeDate(res.checkIn);
      const checkOut = normalizeDate(res.checkOut);
      return targetDate >= checkIn && targetDate < checkOut;
    });
  };

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="calendar-grid">
      {daysOfWeek.map((d, i) => (
        <div key={i} className="calendar-header">{d}</div>
      ))}

      {days.map((day, index) => {
        if (day === null) return <div key={index} className="calendar-cell empty"></div>;

        const status = getDayStatus(day);
        const reservation = getReservationForDay(day);
        const isFull = status === 'dolu';
        const hasNote = !!reservation?.note;

        return (
          <div
            key={index}
            className={`calendar-cell ${isFull ? 'full' : 'empty'}`}
            style={{
              backgroundColor: isFull ? '#ffe5e5' : '#fff',
              color: isFull ? '#c80000' : '#000',
              fontWeight: isFull ? 'bold' : 'normal',
              borderRadius: '6px',
              textAlign: 'center',
              padding: '10px',
              cursor: 'pointer',
              border: '1px solid #ddd',
              position: 'relative'
            }}
            onClick={() => onDayClick?.(day, status, reservation)}
          >
            {day}
            {hasNote && <span className="note-dot"></span>}
          </div>
        );
      })}
    </div>
  );
}

export default CalendarGrid;
