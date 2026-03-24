import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DayHeader from './DayHeader';
import TimeColumn, { TIME_COL_WIDTH, CELL_HEIGHT } from './TimeColumn';
import CourseCell from './CourseCell';
import { PERIOD_PAIRS } from '../constants/config';
import { THEME } from '../constants/colors';

export default function ScheduleGrid({ grid, onPressCourse, onPressEmpty }) {
  return (
    <ScrollView style={styles.container}>
      <DayHeader />
      <View style={styles.body}>
        <TimeColumn />
        <View style={styles.gridArea}>
          {PERIOD_PAIRS.map((period, rowIdx) => (
            <View key={period.label} style={styles.row}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const key = `${day}-${rowIdx + 1}`;
                const coursesInCell = grid[key];
                const course = coursesInCell && coursesInCell[0];

                return (
                  <View key={day} style={styles.cell}>
                    {course ? (
                      <CourseCell course={course} onPress={onPressCourse} />
                    ) : (
                      <TouchableOpacity
                        style={styles.emptyCell}
                        activeOpacity={0.3}
                        onPress={() => onPressEmpty(day, period.start, period.end)}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  body: {
    flexDirection: 'row',
  },
  gridArea: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    height: CELL_HEIGHT,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.gridBorder,
  },
  cell: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: THEME.gridBorder,
  },
  emptyCell: {
    flex: 1,
    height: CELL_HEIGHT - 2,
  },
});
