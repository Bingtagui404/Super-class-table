import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CELL_HEIGHT } from './TimeColumn';

export default function CourseCell({ course, height, onPress }) {
  const span = Math.round(height / CELL_HEIGHT);
  const isLarge = span >= 3;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: course.color || '#4A90D9',
          height: height - 4,
          justifyContent: isLarge ? 'center' : 'flex-start',
        },
      ]}
      activeOpacity={0.7}
      onPress={() => onPress(course)}
    >
      <Text style={styles.name} numberOfLines={isLarge ? span * 2 : undefined}>
        {course.name}
      </Text>
      {course.location ? (
        <Text style={styles.location} numberOfLines={isLarge ? 3 : 2}>
          @{course.location}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 1,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  location: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 2,
  },
});
