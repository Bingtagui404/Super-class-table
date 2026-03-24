import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CELL_HEIGHT } from './TimeColumn';

export default function CourseCell({ course, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: course.color || '#4A90D9' }]}
      activeOpacity={0.7}
      onPress={() => onPress(course)}
    >
      <Text style={styles.name} numberOfLines={2}>
        {course.name}
      </Text>
      {course.location ? (
        <Text style={styles.location} numberOfLines={1}>
          {course.location}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: CELL_HEIGHT - 4,
    margin: 1,
    borderRadius: 4,
    padding: 3,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  location: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 2,
  },
});
