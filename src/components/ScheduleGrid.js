import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import DayHeader from './DayHeader';
import TimeColumn, { TIME_COL_WIDTH, CELL_HEIGHT } from './TimeColumn';
import CourseCell from './CourseCell';
import { PERIODS } from '../constants/config';
import { THEME } from '../constants/colors';

const TOTAL_HEIGHT = PERIODS.length * CELL_HEIGHT;
const SWIPE_THRESHOLD = 80;

export default function ScheduleGrid({ grid, occupied, onPressCourse, onPressEmpty, onSwipeLeft, onSwipeRight }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
    };
    swiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const dx = e.nativeEvent.pageX - touchStart.current.x;
    const dy = e.nativeEvent.pageY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    // 只处理水平滑动：水平距离 > 阈值，水平 > 垂直，时间 < 500ms
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
      swiping.current = true;
      if (dx < 0 && onSwipeLeft) {
        const ok = onSwipeLeft();
        if (ok) {
          Animated.timing(translateX, { toValue: -100, duration: 120, useNativeDriver: true }).start(() => {
            translateX.setValue(100);
            Animated.timing(translateX, { toValue: 0, duration: 150, useNativeDriver: true }).start();
          });
        }
      } else if (dx > 0 && onSwipeRight) {
        const ok = onSwipeRight();
        if (ok) {
          Animated.timing(translateX, { toValue: 100, duration: 120, useNativeDriver: true }).start(() => {
            translateX.setValue(-100);
            Animated.timing(translateX, { toValue: 0, duration: 150, useNativeDriver: true }).start();
          });
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, translateX]);

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

    // 空白可点击区域
    for (let p = 1; p <= PERIODS.length; p++) {
      const key = `${day}-${p}`;
      if (occupied && occupied[key]) continue;
      if (grid && grid[key] && grid[key].length > 0) continue;
      cells.push(
        <View
          key={`empty-${p}`}
          style={[styles.emptyCell, { top: (p - 1) * CELL_HEIGHT, height: CELL_HEIGHT }]}
        >
          <TouchableOpacity
            style={styles.emptyCellTouch}
            activeOpacity={1}
            onPress={() => onPressEmpty(day, p, p)}
          />
        </View>
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
    <ScrollView
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <DayHeader />
      <Animated.View style={[styles.body, { transform: [{ translateX }] }]}>
        <TimeColumn />
        <View style={styles.gridArea}>
          {[1, 2, 3, 4, 5, 6, 7].map(renderDayColumn)}
        </View>
      </Animated.View>
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
    zIndex: 0,
  },
  emptyCellTouch: {
    flex: 1,
  },
  courseWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
