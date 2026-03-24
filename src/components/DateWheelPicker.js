import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import WheelPicker from './WheelPicker';

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i); // 2020-2030
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function DateWheelPicker({ value, onDateChange }) {
  const parseDate = useCallback((dateStr) => {
    if (!dateStr) return { year: 2025, month: 9, day: 1 };
    const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return { year: 2025, month: 9, day: 1 };
    return { year: parseInt(match[1]), month: parseInt(match[2]), day: parseInt(match[3]) };
  }, []);

  const parsed = parseDate(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  useEffect(() => {
    const p = parseDate(value);
    setYear(p.year);
    setMonth(p.month);
    setDay(p.day);
  }, [value, parseDate]);

  const maxDay = getDaysInMonth(year, month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const clampedDay = Math.min(day, maxDay);

  const emitChange = (y, m, d) => {
    const md = Math.min(d, getDaysInMonth(y, m));
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(md).padStart(2, '0')}`;
    onDateChange(dateStr);
  };

  const handleYearChange = (idx) => {
    const y = YEARS[idx];
    setYear(y);
    emitChange(y, month, day);
  };

  const handleMonthChange = (idx) => {
    const m = MONTHS[idx];
    setMonth(m);
    emitChange(year, m, day);
  };

  const handleDayChange = (idx) => {
    const d = days[idx];
    setDay(d);
    emitChange(year, month, d);
  };

  const yearIdx = YEARS.indexOf(year);
  const monthIdx = month - 1;
  const dayIdx = clampedDay - 1;

  return (
    <View style={styles.container}>
      <WheelPicker
        items={YEARS.map(String)}
        selectedIndex={yearIdx >= 0 ? yearIdx : 5}
        onIndexChange={handleYearChange}
        label="年"
      />
      <WheelPicker
        items={MONTHS.map(String)}
        selectedIndex={monthIdx >= 0 ? monthIdx : 0}
        onIndexChange={handleMonthChange}
        label="月"
      />
      <WheelPicker
        items={days.map(String)}
        selectedIndex={dayIdx >= 0 ? dayIdx : 0}
        onIndexChange={handleDayChange}
        label="日"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
});
