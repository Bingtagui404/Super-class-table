import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PERIOD_PAIR_TIMES } from '../constants/config';
import { THEME } from '../constants/colors';

export const TIME_COL_WIDTH = 48;
export const CELL_HEIGHT = 82;

export default function TimeColumn() {
  return (
    <View style={styles.container}>
      {PERIOD_PAIR_TIMES.map((p) => (
        <View key={p.pair} style={styles.cell}>
          <Text style={styles.pairNum}>{p.pair}</Text>
          <Text style={styles.timeText}>{p.start}</Text>
          <Text style={styles.timeText}>{p.end}</Text>
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
    height: CELL_HEIGHT * 2, // 每大节占两个小节的高度
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.gridBorder,
  },
  pairNum: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  timeText: {
    fontSize: 9,
    color: THEME.textLight,
    marginTop: 2,
  },
});
