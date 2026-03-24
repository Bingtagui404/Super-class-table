import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DAYS } from '../constants/config';
import { THEME } from '../constants/colors';
import { TIME_COL_WIDTH } from './TimeColumn';

export default function DayHeader() {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <View style={styles.row}>
      <View style={[styles.cell, { width: TIME_COL_WIDTH }]}>
        <Text style={styles.text}></Text>
      </View>
      {DAYS.map((day, idx) => (
        <View key={day} style={[styles.cell, styles.dayCell]}>
          <Text style={[styles.text, idx === todayIdx && styles.today]}>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.gridBorder,
  },
  cell: {
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCell: {
    flex: 1,
  },
  text: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  today: {
    color: THEME.primary,
    fontWeight: 'bold',
  },
});
