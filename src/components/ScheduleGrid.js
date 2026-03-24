import React, { useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import DayHeader from './DayHeader';
import TimeColumn, { TIME_COL_WIDTH, CELL_HEIGHT } from './TimeColumn';
import CourseCell from './CourseCell';
import { PERIODS } from '../constants/config';
import { THEME } from '../constants/colors';

const TOTAL_HEIGHT = PERIODS.length * CELL_HEIGHT;
const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * 渲染单个周的课表网格（不含时间列）
 */
function WeekPage({ grid, occupied, onPressCourse, onPressEmpty }) {
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
  prevGrid, prevOccupied,
  nextGrid, nextOccupied,
  onPressCourse, onPressEmpty,
  onSwipeLeft, onSwipeRight,
}) {
  const hScrollRef = useRef(null);
  const pageWidth = SCREEN_WIDTH - TIME_COL_WIDTH;
  const isRecentering = useRef(false);

  // 初始滚到中间页
  useEffect(() => {
    isRecentering.current = true;
    if (hScrollRef.current) {
      hScrollRef.current.scrollTo({ x: pageWidth, animated: false });
    }
    setTimeout(() => { isRecentering.current = false; }, 100);
  }, [pageWidth]);

  const handleScrollEnd = useCallback((e) => {
    if (isRecentering.current) return;

    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / pageWidth);

    if (page === 0 || page === 2) {
      isRecentering.current = true;
      // 关键：先回到中间页，再更新数据，避免闪烁
      if (hScrollRef.current) {
        hScrollRef.current.scrollTo({ x: pageWidth, animated: false });
      }
      // 延迟一帧再切换数据，确保 scrollTo 已生效
      requestAnimationFrame(() => {
        let ok = false;
        if (page === 0) {
          ok = onSwipeRight && onSwipeRight();
        } else {
          ok = onSwipeLeft && onSwipeLeft();
        }
        if (!ok) {
          // 边界周，已经在中间页了，不需要额外操作
        }
        setTimeout(() => { isRecentering.current = false; }, 150);
      });
    }
  }, [pageWidth, onSwipeLeft, onSwipeRight]);

  return (
    <View style={styles.outerContainer}>
      <DayHeader />
      <ScrollView style={styles.verticalScroll}>
        <View style={styles.body}>
          {/* 左侧时间列固定 */}
          <TimeColumn />
          {/* 右侧三页水平滑动 */}
          <ScrollView
            ref={hScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleScrollEnd}
            style={styles.hScroll}
            contentContainerStyle={{ width: pageWidth * 3 }}
          >
            {/* 上一周 */}
            <View style={{ width: pageWidth }}>
              <WeekPage
                grid={prevGrid}
                occupied={prevOccupied}
                onPressCourse={onPressCourse}
                onPressEmpty={onPressEmpty}
              />
            </View>
            {/* 当前周 */}
            <View style={{ width: pageWidth }}>
              <WeekPage
                grid={grid}
                occupied={occupied}
                onPressCourse={onPressCourse}
                onPressEmpty={onPressEmpty}
              />
            </View>
            {/* 下一周 */}
            <View style={{ width: pageWidth }}>
              <WeekPage
                grid={nextGrid}
                occupied={nextOccupied}
                onPressCourse={onPressCourse}
                onPressEmpty={onPressEmpty}
              />
            </View>
          </ScrollView>
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
  hScroll: {
    flex: 1,
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
