import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import DayHeader from './DayHeader';
import TimeColumn, { TIME_COL_WIDTH, CELL_HEIGHT } from './TimeColumn';
import CourseCell from './CourseCell';
import { PERIODS } from '../constants/config';
import { THEME } from '../constants/colors';

const TOTAL_HEIGHT = PERIODS.length * CELL_HEIGHT;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 60;
const SWIPE_RATIO = 1.2;

/**
 * 渲染单个周的课表网格
 */
function WeekGrid({ grid, occupied, onPressCourse, onPressEmpty }) {
  const renderDayColumn = (day) => {
    const cells = [];

    for (let p = 0; p < PERIODS.length; p++) {
      cells.push(
        <View
          key={`bg-${p}`}
          style={[styles.gridLine, { top: p * CELL_HEIGHT, height: CELL_HEIGHT }]}
        />
      );
    }

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
    <View style={styles.gridArea}>
      {[1, 2, 3, 4, 5, 6, 7].map(renderDayColumn)}
    </View>
  );
}

export default function ScheduleGrid({
  grid, occupied,
  onPressCourse, onPressEmpty,
  onSwipeLeft, onSwipeRight,
}) {
  const pageWidth = SCREEN_WIDTH - TIME_COL_WIDTH;
  const translateX = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const touchStart = useRef({ x: 0, y: 0, t: 0 });

  const animateSwipe = useCallback((direction) => {
    if (isAnimating.current) return;

    // direction: -1 = 左滑(下一周), 1 = 右滑(上一周)
    const callback = direction === -1 ? onSwipeLeft : onSwipeRight;
    if (!callback) return;

    isAnimating.current = true;

    // 第一段：当前内容滑出屏幕
    Animated.timing(translateX, {
      toValue: -direction * pageWidth,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // 此时视图完全离屏，安全切换数据
      const ok = callback();
      if (!ok) {
        // 边界周，弹回原位
        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start(() => { isAnimating.current = false; });
        return;
      }

      // 立即把视图放到另一侧（瞬间，无动画）
      translateX.setValue(direction * pageWidth);

      // 第二段：新内容从另一侧滑入
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => { isAnimating.current = false; });
    });
  }, [pageWidth, translateX, onSwipeLeft, onSwipeRight]);

  const handleTouchStart = (e) => {
    if (isAnimating.current) return;
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      t: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (isAnimating.current) return;
    const dx = e.nativeEvent.pageX - touchStart.current.x;
    const dy = e.nativeEvent.pageY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;

    if (dt > 500) return; // 太慢不算滑动
    if (Math.abs(dx) < SWIPE_THRESHOLD) return; // 距离不够
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return; // 不是水平方向

    if (dx < 0) {
      animateSwipe(-1); // 左滑 → 下一周
    } else {
      animateSwipe(1);  // 右滑 → 上一周
    }
  };

  return (
    <View style={styles.outerContainer}>
      <DayHeader />
      <ScrollView
        style={styles.verticalScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.body}>
          <TimeColumn />
          <Animated.View style={[styles.gridContainer, { transform: [{ translateX }] }]}>
            <WeekGrid
              grid={grid}
              occupied={occupied}
              onPressCourse={onPressCourse}
              onPressEmpty={onPressEmpty}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  verticalScroll: {
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    height: TOTAL_HEIGHT,
  },
  gridContainer: {
    flex: 1,
    height: TOTAL_HEIGHT,
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
