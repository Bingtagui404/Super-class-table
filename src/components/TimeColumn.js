import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PERIODS } from '../constants/config';
import { THEME } from '../constants/colors';

export const TIME_COL_WIDTH = 44;
export const CELL_HEIGHT = 65;

export default function TimeColumn() {
  return (
    <View style={styles.container}>
      {PERIODS.map((p) => (
        <View key={p.period} style={styles.cell}>
          <Text style={styles.periodNum}>{p.period}</Text>
          <Text style={styles.timeText}>{p.time}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TIME_COL_WIDTH,
  },
  cell: {
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.gridBorder,
  },
  periodNum: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  timeText: {
    fontSize: 8,
    color: THEME.textLight,
    marginTop: 2,
  },
});
