import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import DayHeader from './DayHeader';
import TimeColumn, { TIME_COL_WIDTH, CELL_HEIGHT } from './TimeColumn';
import CourseCell from './CourseCell';
import { PERIODS } from '../constants/config';
import { THEME } from '../constants/colors';

const TOTAL_HEIGHT = PERIODS.length * CELL_HEIGHT;
const SWIPE_THRESHOLD = 80;
const DAMPING = 0.4;

export default function ScheduleGrid({ grid, occupied, onPressCourse, onPressEmpty, onSwipeLeft, onSwipeRight }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const isHorizontal = useRef(null); // null=未确定, true=水平, false=垂直

  const handleTouchStart = useCallback((e) => {
    translateX.stopAnimation();
    translateX.setValue(0);
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
    };
    isHorizontal.current = null;
  }, [translateX]);

  const handleTouchMove = useCallback((e) => {
    const dx = e.nativeEvent.pageX - touchStart.current.x;
    const dy = e.nativeEvent.pageY - touchStart.current.y;

    // 首次移动超过10px时确定方向
    if (isHorizontal.current === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    // 确认为水平方向才跟手
    if (isHorizontal.current === true) {
      translateX.setValue(dx * DAMPING);
    }
  }, [translateX]);

  const handleTouchEnd = useCallback((e) => {
    if (isHorizontal.current !== true) return;

    const dx = e.nativeEvent.pageX - touchStart.current.x;
    const absDx = Math.abs(dx);

    if (absDx > SWIPE_THRESHOLD) {
      if (dx < 0 && onSwipeLeft) {
        const ok = onSwipeLeft();
        if (ok) {
          // 滑出 → 切数据 → 从反方向弹入
          Animated.timing(translateX, { toValue: -120, duration: 100, useNativeDriver: true }).start(() => {
            translateX.setValue(120);
            Animated.spring(translateX, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }).start();
          });
        } else {
          // 边界弹回
          Animated.spring(translateX, { toValue: 0, friction: 6, tension: 100, useNativeDriver: true }).start();
        }
      } else if (dx > 0 && onSwipeRight) {
        const ok = onSwipeRight();
        if (ok) {
          Animated.timing(translateX, { toValue: 120, duration: 100, useNativeDriver: true }).start(() => {
            translateX.setValue(-120);
            Animated.spring(translateX, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }).start();
          });
        } else {
          Animated.spring(translateX, { toValue: 0, friction: 6, tension: 100, useNativeDriver: true }).start();
        }
      } else {
        Animated.spring(translateX, { toValue: 0, friction: 6, tension: 100, useNativeDriver: true }).start();
      }
    } else {
      // 未达阈值，弹回
      Animated.spring(translateX, { toValue: 0, friction: 6, tension: 100, useNativeDriver: true }).start();
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
    <View style={styles.outerContainer}>
      {/* DayHeader 固定在顶部不随纵向滚动 */}
      <DayHeader />
      <ScrollView
        style={styles.scrollView}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Animated.View style={[styles.body, { transform: [{ translateX }] }]}>
          <TimeColumn />
          <View style={styles.gridArea}>
            {[1, 2, 3, 4, 5, 6, 7].map(renderDayColumn)}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  scrollView: {
    flex: 1,
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
