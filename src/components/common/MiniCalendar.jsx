import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { getPhNow } from '../../utils/dateUtils';

export default function MiniCalendar({ activeDays = [8, 12, 19, 25], onDayClick, onFullCalendar }) {
  const phNow = getPhNow();
  const [currentYear, setCurrentYear] = useState(phNow.yearNum);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(phNow.monthIndex);
  const [selectedDay, setSelectedDay] = useState(phNow.dayOfMonth);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  // Generate days grid
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonthIdx, 0).getDate();
  
  // Day of week of 1st day (0 = Sun, 1 = Mon ... 6 = Sat)
  const firstDay = new Date(currentYear, currentMonthIdx, 1).getDay();
  // Monday-aligned offset: Mon=0, Tue=1, ..., Sun=6
  const startOffset = (firstDay + 6) % 7;

  const calendarDays = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarDays.push({
      num: daysInPrevMonth - i,
      currentMonth: false
    });
  }

  // Current month days
  const isCurrentMonthNow = currentYear === phNow.yearNum && currentMonthIdx === phNow.monthIndex;

  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = isCurrentMonthNow && i === phNow.dayOfMonth;
    calendarDays.push({
      num: i,
      currentMonth: true,
      isToday,
      hasEvent: activeDays.includes(i) || isToday
    });
  }

  // Next month leading days to complete full rows (multiple of 7)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      num: i,
      currentMonth: false
    });
  }

  const currentMonthLabel = `${monthNames[currentMonthIdx]}, ${currentYear}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      {/* Month Header */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <span className="font-heading font-semibold text-slate-800 text-sm block">
              {currentMonthLabel}
            </span>
          </div>

          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Philippine Standard Time Indicator */}
        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-3 font-mono">
          <Globe className="w-2.5 h-2.5 text-blue-500" />
          <span>PH Time (GMT+8)</span>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 mb-1">
        {daysOfWeek.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {calendarDays.map((d, i) => {
          const isSelected = d.currentMonth && d.num === selectedDay;
          return (
            <button
              key={i}
              onClick={() => {
                if (d.currentMonth) {
                  setSelectedDay(d.num);
                  onDayClick && onDayClick(d.num);
                }
              }}
              className={`
                h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all text-[11px]
                ${!d.currentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-blue-50 cursor-pointer'}
                ${isSelected ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm' : ''}
                ${d.isToday && !isSelected ? 'ring-1.5 ring-blue-500 font-bold text-blue-600' : ''}
              `}
            >
              <span>{d.num}</span>
              {d.hasEvent && !isSelected && (
                <span className={`w-1 h-1 rounded-full absolute bottom-1 ${d.isToday ? 'bg-emerald-500' : 'bg-blue-600'}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Full Calendar Link */}
      <div className="text-center mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-mono">
          Today: {phNow.dateStr}
        </span>
        <button 
          onClick={onFullCalendar}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          Full Calendar
        </button>
      </div>
    </div>
  );
}
