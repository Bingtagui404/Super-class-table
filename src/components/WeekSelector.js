import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/colors';
import { MAX_WEEKS } from '../constants/config';

const ITEM_WIDTH = 40;

export default function WeekSelector({ currentWeek, selectedWeek, onSelectWeek }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const offset = Math.max(0, (selectedWeek - 3) * ITEM_WIDTH);
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [selectedWeek]);

  const weeks = Array.from({ length: MAX_WEEKS }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>第{selectedWeek}周</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {weeks.map((w) => {
          const isSelected = w === selectedWeek;
          const isCurrent = w === currentWeek;
          return (
            <TouchableOpacity
              key={w}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
                isCurrent && !isSelected && styles.itemCurrent,
              ]}
              onPress={() => onSelectWeek(w)}
            >
              <Text
                style={[
                  styles.itemText,
                  isSelected && styles.itemTextSelected,
                ]}
              >
                {w}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    paddingVertical: 8,
    paddingLeft: 12,
  },
  label: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginRight: 8,
    width: 50,
  },
  scroll: {
    paddingRight: 12,
  },
  item: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  itemSelected: {
    backgroundColor: THEME.primary,
  },
  itemCurrent: {
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  itemText: {
    fontSize: 13,
    color: THEME.text,
  },
  itemTextSelected: {
    color: THEME.white,
    fontWeight: 'bold',
  },
});
