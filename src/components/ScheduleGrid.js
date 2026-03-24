import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder } from 'react-native';
import DayHeader from './DayHeader';
import TimeColumn, { TIME_COL_WIDTH, CELL_HEIGHT } from './TimeColumn';
import CourseCell from './CourseCell';
import { PERIODS } from '../constants/config';
import { THEME } from '../constants/colors';

const TOTAL_HEIGHT = PERIODS.length * CELL_HEIGHT;
const SWIPE_THRESHOLD = 50;

export default function ScheduleGrid({ grid, occupied, onPressCourse, onPressEmpty, onSwipeLeft, onSwipeRight }) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx * 0.3);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD && onSwipeLeft) {
          Animated.timing(translateX, { toValue: -80, duration: 150, useNativeDriver: true }).start(() => {
            onSwipeLeft();
            translateX.setValue(80);
            Animated.timing(translateX, { toValue: 0, duration: 150, useNativeDriver: true }).start();
          });
        } else if (gs.dx > SWIPE_THRESHOLD && onSwipeRight) {
          Animated.timing(translateX, { toValue: 80, duration: 150, useNativeDriver: true }).start(() => {
            onSwipeRight();
            translateX.setValue(-80);
            Animated.timing(translateX, { toValue: 0, duration: 150, useNativeDriver: true }).start();
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const renderDayColumn = (day) => {
    const cells = [];

    // 网格线背景
    for (let p = 0; p < PERIODS.length; p++) {
      cells.push(
        <View
          key={`bg-${p}`}
          style={[styles.gridLine, { top: p * CELL_HEIGHT, height: CELL_HEIGHT }]}
        />
      );
    }

    // 空白可点击区域（只渲染未被占据且无课的格子）
    for (let p = 1; p <= PERIODS.length; p++) {
      const key = `${day}-${p}`;
      if (occupied && occupied[key]) continue;
      if (grid && grid[key] && grid[key].length > 0) continue;
      cells.push(
        <TouchableOpacity
          key={`empty-${p}`}
          style={[styles.emptyCell, { top: (p - 1) * CELL_HEIGHT, height: CELL_HEIGHT }]}
          activeOpacity={0.3}
          onPress={() => onPressEmpty(day, p, p)}
        />
      );
    }

    // 课程
    if (grid) {
      for (let p = 1; p <= PERIODS.length; p++) {
        const key = `${day}-${p}`;
        const coursesInCell = grid[key];
        if (!coursesInCell || coursesInCell.length === 0) continue;
        const course = coursesInCell[0];
        const span = course.span || 1;
        const cellH = span * CELL_HEIGHT;
        cells.push(
          <View key={`course-${p}`} style={[styles.courseWrap, { top: (p - 1) * CELL_HEIGHT, height: cellH }]}>
            <CourseCell course={course} height={cellH} onPress={onPressCourse} />
          </View>
        );
      }
    }

    return (
      <View key={day} style={styles.dayColumn}>
        {cells}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <DayHeader />
      <View {...panResponder.panHandlers}>
        <Animated.View style={[styles.body, { transform: [{ translateX }] }]}>
          <TimeColumn />
          <View style={styles.gridArea}>
            {[1, 2, 3, 4, 5, 6, 7].map(renderDayColumn)}
          </View>
        </Animated.View>
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
    flexDirection: 'row',
    height: TOTAL_HEIGHT,
  },
  dayColumn: {
    flex: 1,
    height: TOTAL_HEIGHT,
    position: 'relative',
    borderRightWidth: 0.5,
    borderRightColor: THEME.gridBorder,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.gridBorder,
  },
  emptyCell: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  courseWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
