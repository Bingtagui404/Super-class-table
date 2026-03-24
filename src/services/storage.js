import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from '../constants/config';

const COURSES_KEY = '@dlnu_class_table/courses';
const SETTINGS_KEY = '@dlnu_class_table/settings';

export async function loadCourses() {
  try {
    const json = await AsyncStorage.getItem(COURSES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveCourses(courses) {
  await AsyncStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

export async function addCourse(course) {
  const courses = await loadCourses();
  courses.push(course);
  await saveCourses(courses);
  return courses;
}

export async function updateCourse(id, data) {
  const courses = await loadCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx !== -1) {
    courses[idx] = { ...courses[idx], ...data };
  }
  await saveCourses(courses);
  return courses;
}

export async function deleteCourse(id) {
  const courses = await loadCourses();
  const filtered = courses.filter((c) => c.id !== id);
  await saveCourses(filtered);
  return filtered;
}

export async function importCourses(newCourses, semesterId) {
  const courses = await loadCourses();
  const kept = courses.filter(
    (c) => !(c.semesterId === semesterId && c.source === 'imported')
  );
  const merged = [...kept, ...newCourses];
  await saveCourses(merged);
  return merged;
}

export async function clearAllCourses() {
  await AsyncStorage.setItem(COURSES_KEY, JSON.stringify([]));
}

export async function loadSettings() {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
