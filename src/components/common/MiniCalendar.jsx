import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({ activeDays = [7, 12, 19, 25], onDayClick, onFullCalendar }) {
  const [currentMonth, setCurrentMonth] = useState('January, 2026');
  const [selectedDay, setSelectedDay] = useState(25);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Days matrix for January
  const calendarDays = [
    { num: 29, currentMonth: false },
    { num: 30, currentMonth: false },
    { num: 31, currentMonth: false },
    { num: 1, currentMonth: true },
    { num: 2, currentMonth: true },
    { num: 3, currentMonth: true },
    { num: 4, currentMonth: true },
    { num: 5, currentMonth: true },
    { num: 6, currentMonth: true },
    { num: 7, currentMonth: true, hasEvent: true },
    { num: 8, currentMonth: true },
    { num: 9, currentMonth: true },
    { num: 10, currentMonth: true },
    { num: 11, currentMonth: true },
    { num: 12, currentMonth: true, hasEvent: true },
    { num: 13, currentMonth: true },
    { num: 14, currentMonth: true },
    { num: 15, currentMonth: true },
    { num: 16, currentMonth: true },
    { num: 17, currentMonth: true },
    { num: 18, currentMonth: true },
    { num: 19, currentMonth: true, hasEvent: true },
    { num: 20, currentMonth: true },
    { num: 21, currentMonth: true },
    { num: 22, currentMonth: true },
    { num: 23, currentMonth: true },
    { num: 24, currentMonth: true },
    { num: 25, currentMonth: true, hasEvent: true },
    { num: 26, currentMonth: true },
    { num: 27, currentMonth: true },
    { num: 28, currentMonth: true },
    { num: 29, currentMonth: true },
    { num: 30, currentMonth: true },
    { num: 31, currentMonth: true },
    { num: 1, currentMonth: false }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={() => {}}
          className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-heading font-semibold text-slate-800 text-sm">{currentMonth}</span>
        <button 
          onClick={() => {}}
          className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
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
              `}
            >
              <span>{d.num}</span>
              {d.hasEvent && !isSelected && (
                <span className="w-1 h-1 bg-blue-600 rounded-full absolute bottom-1"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Full Calendar Link */}
      <div className="text-center mt-3 pt-2 border-t border-slate-100">
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
