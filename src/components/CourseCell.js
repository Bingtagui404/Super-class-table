import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CourseCell({ course, height, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: course.color || '#4A90D9', height: height - 4 }]}
      activeOpacity={0.7}
      onPress={() => onPress(course)}
    >
      <Text style={styles.name}>{course.name}</Text>
      {course.location ? (
        <Text style={styles.location} numberOfLines={2}>
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
    padding: 4,
    justifyContent: 'center',
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
