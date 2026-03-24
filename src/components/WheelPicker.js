import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { THEME } from '../constants/colors';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

export default function WheelPicker({ items, selectedIndex, onIndexChange, label }) {
  const scrollRef = useRef(null);
  const isUserScrolling = useRef(false);
  const skipNextPropScroll = useRef(false);

  // 滚动到指定索引
  const scrollToIndex = useCallback((idx, animated = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated });
    }
  }, []);

  // prop 变化时同步滚轮位置
  useEffect(() => {
    if (skipNextPropScroll.current) {
      skipNextPropScroll.current = false;
      return;
    }
    // 延迟一点确保 ScrollView 已经 layout
    const timer = setTimeout(() => {
      if (!isUserScrolling.current) {
        scrollToIndex(selectedIndex, false);
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [selectedIndex, scrollToIndex]);

  // 初始定位
  useEffect(() => {
    const timer = setTimeout(() => scrollToIndex(selectedIndex, false), 80);
    return () => clearTimeout(timer);
  }, []);

  const snapToNearest = useCallback((y) => {
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    // 确保对齐
    scrollToIndex(clamped, true);
    if (clamped !== selectedIndex) {
      skipNextPropScroll.current = true;
      onIndexChange(clamped);
    }
    isUserScrolling.current = false;
  }, [items.length, selectedIndex, onIndexChange, scrollToIndex]);

  const handleScrollBeginDrag = () => {
    isUserScrolling.current = true;
  };

  const handleMomentumEnd = (e) => {
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  // 处理慢速拖动（无惯性）的情况
  const handleScrollEndDrag = (e) => {
    // 在 Android 上，如果没有惯性，onMomentumScrollEnd 不会触发
    // 用一个小延迟检查是否有 momentum
    const y = e.nativeEvent.contentOffset.y;
    setTimeout(() => {
      if (isUserScrolling.current) {
        snapToNearest(y);
      }
    }, 120);
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.container}>
        <View style={styles.indicator} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate={Platform.OS === 'ios' ? 'normal' : 0.985}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumEnd}
          onScrollEndDrag={handleScrollEndDrag}
          contentContainerStyle={{ paddingVertical: PADDING }}
          nestedScrollEnabled={true}
        >
          {items.map((item, idx) => (
            <View key={idx} style={styles.item}>
              <Text style={[styles.itemText, idx === selectedIndex && styles.itemTextSelected]}>
                {item}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: THEME.textLight,
    marginBottom: 4,
  },
  container: {
    height: CONTAINER_HEIGHT,
    width: 80,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: THEME.primary,
    borderRadius: 4,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: THEME.textLight,
  },
  itemTextSelected: {
    color: THEME.text,
    fontWeight: 'bold',
  },
});
