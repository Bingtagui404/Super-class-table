import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  const [masking, setMasking] = useState(false);

  // 初始滚到中间页
  useEffect(() => {
    isRecentering.current = true;
    if (hScrollRef.current) {
      hScrollRef.current.scrollTo({ x: pageWidth, animated: false });
    }
    setTimeout(() => { isRecentering.current = false; }, 100);
  }, [pageWidth]);

  // grid 数据变化时（切周后），重置到中间页并移除遮罩
  const prevGridRef = useRef(grid);
  useEffect(() => {
    if (prevGridRef.current !== grid) {
      prevGridRef.current = grid;
      // 数据已更新，立即重置到中间页
      if (hScrollRef.current) {
        hScrollRef.current.scrollTo({ x: pageWidth, animated: false });
      }
      // 给一帧让 scrollTo 生效后移除遮罩
      requestAnimationFrame(() => {
        setMasking(false);
        isRecentering.current = false;
      });
    }
  }, [grid, pageWidth]);

  const handleScrollEnd = useCallback((e) => {
    if (isRecentering.current) return;

    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / pageWidth);

    if (page === 0 || page === 2) {
      isRecentering.current = true;
      // 立即显示白色遮罩，盖住即将闪烁的内容
      setMasking(true);

      // 切换数据（遮罩已经盖住了，不怕闪）
      requestAnimationFrame(() => {
        if (page === 0) {
          onSwipeRight && onSwipeRight();
        } else {
          onSwipeLeft && onSwipeLeft();
        }
        // 遮罩会在 grid 变化的 useEffect 中移除
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
          {/* 白色遮罩：切周时盖住闪烁 */}
          {masking && (
            <View style={styles.mask} pointerEvents="none" />
          )}
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
  mask: {
    position: 'absolute',
    top: 0,
    left: TIME_COL_WIDTH,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.white,
    zIndex: 10,
  },
});
