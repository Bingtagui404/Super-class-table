import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WheelPicker from './WheelPicker';

const YEARS = Array.from({ length: 21 }, (_, i) => 2020 + i); // 2020-2040
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function DateWheelPicker({ value, onDateChange }) {
  // 兼容 YYYY-MM-DD 和 YYYY/M/D 等格式
  const parseDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) return null;
    const y = parseInt(match[1]);
    const m = parseInt(match[2]);
    const d = parseInt(match[3]);
    // 年份不在滚轮范围内则视为无效
    if (y < YEARS[0] || y > YEARS[YEARS.length - 1]) return null;
    if (m < 1 || m > 12) return null;
    const maxD = getDaysInMonth(y, m);
    if (d < 1 || d > maxD) return null;
    return { year: y, month: m, day: d };
  }, []);

  const parsed = parseDate(value);
  const now = new Date();
  const defaultDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const initial = parsed || defaultDate;
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [hasValue, setHasValue] = useState(!!parsed);

  useEffect(() => {
    const p = parseDate(value);
    if (p) {
      setYear(p.year);
      setMonth(p.month);
      setDay(p.day);
      setHasValue(true);
    } else {
      // 重置到当天，但标记为无值
      const n = new Date();
      setYear(n.getFullYear());
      setMonth(n.getMonth() + 1);
      setDay(n.getDate());
      setHasValue(false);
    }
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
      {!hasValue && (
        <Text style={styles.hint}>滑动选择开学日期</Text>
      )}
      <View style={[styles.wheelRow, !hasValue && styles.dimmed]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  wheelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dimmed: {
    opacity: 0.4,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
});
