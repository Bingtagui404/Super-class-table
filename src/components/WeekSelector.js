import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { THEME } from '../constants/colors';
import { MAX_WEEKS } from '../constants/config';

const ITEM_WIDTH = 40;
const COLS = 5;

export default function WeekSelector({ currentWeek, selectedWeek, onSelectWeek }) {
  const scrollRef = useRef(null);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const offset = Math.max(0, (selectedWeek - 3) * ITEM_WIDTH);
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [selectedWeek]);

  const weeks = Array.from({ length: MAX_WEEKS }, (_, i) => i + 1);
  const rows = [];
  for (let i = 0; i < weeks.length; i += COLS) {
    rows.push(weeks.slice(i, i + COLS));
  }

  const handleGridSelect = (w) => {
    onSelectWeek(w);
    setShowGrid(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowGrid(true)}>
        <Text style={styles.label}>第{selectedWeek}周</Text>
      </TouchableOpacity>
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

      {/* 周数网格弹窗 */}
      <Modal visible={showGrid} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGrid(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>查看周课表</Text>
              <TouchableOpacity onPress={() => { onSelectWeek(currentWeek); setShowGrid(false); }}>
                <Text style={styles.modalAction}>回到本周</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.grid}>
              {rows.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  {row.map((w) => {
                    const isSelected = w === selectedWeek;
                    const isCurrent = w === currentWeek;
                    return (
                      <TouchableOpacity
                        key={w}
                        style={[
                          styles.gridItem,
                          isSelected && styles.gridItemSelected,
                        ]}
                        onPress={() => handleGridSelect(w)}
                      >
                        <Text
                          style={[
                            styles.gridItemText,
                            isSelected && styles.gridItemTextSelected,
                          ]}
                        >
                          {isCurrent ? '本周' : w}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {/* 补齐最后一行空位 */}
                  {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, i) => (
                    <View key={`pad-${i}`} style={styles.gridItem} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: THEME.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  modalAction: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '500',
  },
  grid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    width: '18%',
    aspectRatio: 1.6,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemSelected: {
    backgroundColor: THEME.primary,
  },
  gridItemText: {
    fontSize: 15,
    color: THEME.text,
    fontWeight: '500',
  },
  gridItemTextSelected: {
    color: THEME.white,
    fontWeight: 'bold',
  },
});
