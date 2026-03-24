import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { THEME } from '../constants/colors';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

export default function WheelPicker({ items, selectedIndex, onIndexChange, label }) {
  const scrollRef = useRef(null);
  const lastUserIdx = useRef(null);

  // 当 selectedIndex 变化时，无条件滚动到对应位置
  useEffect(() => {
    // 跳过用户刚刚手动滚动触发的那次 prop 更新
    if (lastUserIdx.current === selectedIndex) {
      lastUserIdx.current = null;
      return;
    }
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [selectedIndex]);

  // 初始定位
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMomentumEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== selectedIndex) {
      lastUserIdx.current = clamped;
      onIndexChange(clamped);
    }
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
          decelerationRate="fast"
          nestedScrollEnabled={true}
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={{ paddingVertical: PADDING }}
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
    width: 70,
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
    fontSize: 16,
    color: THEME.textLight,
  },
  itemTextSelected: {
    color: THEME.text,
    fontWeight: 'bold',
  },
});
