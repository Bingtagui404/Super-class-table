import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PERIOD_PAIRS } from '../constants/config';
import { THEME } from '../constants/colors';

export const TIME_COL_WIDTH = 30;
export const CELL_HEIGHT = 80;

export default function TimeColumn() {
  return (
    <View style={styles.container}>
      {PERIOD_PAIRS.map((p) => (
        <View key={p.label} style={styles.cell}>
          <Text style={styles.text}>{p.label}</Text>
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
  text: {
    fontSize: 10,
    color: THEME.textLight,
  },
});
