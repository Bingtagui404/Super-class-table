import { useState, useEffect, useCallback } from 'react';
import {
  loadCourses,
  saveCourses,
  loadSettings,
  saveSettings,
  importCourses as importCoursesStorage,
  deleteCourse as deleteCourseStorage,
} from '../services/storage';
import {
  getCurrentWeek,
  filterCoursesForWeek,
  assignColors,
  generateId,
  buildGrid,
} from '../services/courseUtils';
import { COURSE_COLORS } from '../constants/colors';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [settings, setSettings] = useState({ termStartDate: '', currentSemesterId: '' });
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([loadCourses(), loadSettings()]);
    setCourses(c);
    setSettings(s);
    if (s.termStartDate) {
      setCurrentWeek(getCurrentWeek(s.termStartDate));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addCourse = useCallback(
    async (courseData) => {
      const colorIdx = courses.length;
      const newCourse = {
        ...courseData,
        id: generateId(),
        color: courseData.color || COURSE_COLORS[colorIdx % COURSE_COLORS.length],
        source: 'manual',
        semesterId: settings.currentSemesterId,
        // 手动添加的课程：将 weekStart/weekEnd 转为 weekRanges
        weekRanges: courseData.weekRanges || [
          { start: courseData.weekStart || 1, end: courseData.weekEnd || 20, type: 'all' },
        ],
        weekType: courseData.weekType || 'all',
      };
      const updated = [...courses, newCourse];
      await saveCourses(updated);
      setCourses(updated);
      return newCourse;
    },
    [courses, settings.currentSemesterId]
  );

  const editCourse = useCallback(
    async (id, data) => {
      // 如果编辑了 weekStart/weekEnd，同步更新 weekRanges
      const patchedData = { ...data };
      if (data.weekStart !== undefined || data.weekEnd !== undefined) {
        const existing = courses.find((c) => c.id === id);
        const ws = data.weekStart ?? existing?.weekStart ?? 1;
        const we = data.weekEnd ?? existing?.weekEnd ?? 20;
        patchedData.weekRanges = [{ start: ws, end: we, type: data.weekType || 'all' }];
      }
      const updated = courses.map((c) => (c.id === id ? { ...c, ...patchedData } : c));
      await saveCourses(updated);
      setCourses(updated);
    },
    [courses]
  );

  const removeCourse = useCallback(async (id) => {
    const updated = await deleteCourseStorage(id);
    setCourses(updated);
  }, []);

  const doImport = useCallback(
    async (parsedCourses) => {
      const now = Date.now();
      const colored = assignColors(parsedCourses);
      const withMeta = colored.map((c, i) => ({
        ...c,
        id: generateId() + '-' + i,
        source: 'imported',
        semesterId: settings.currentSemesterId,
        lastImportedAt: now,
      }));
      const merged = await importCoursesStorage(withMeta, settings.currentSemesterId);
      setCourses(merged);
      return {
        successCount: withMeta.length,
        failedCount: 0,
        courses: withMeta,
        message: `成功导入 ${withMeta.length} 门课程`,
      };
    },
    [settings.currentSemesterId]
  );

  const updateSettings = useCallback(
    async (newSettings) => {
      const updated = { ...settings, ...newSettings };
      await saveSettings(updated);
      setSettings(updated);
      if (updated.termStartDate) {
        setCurrentWeek(getCurrentWeek(updated.termStartDate));
      }
    },
    [settings]
  );

  const getCoursesForWeek = useCallback(
    (week) => filterCoursesForWeek(courses, week),
    [courses]
  );

  const getGrid = useCallback(
    (week) => buildGrid(filterCoursesForWeek(courses, week)),
    [courses]
  );

  return {
    courses,
    settings,
    currentWeek,
    setCurrentWeek,
    loading,
    addCourse,
    editCourse,
    removeCourse,
    doImport,
    updateSettings,
    getCoursesForWeek,
    getGrid,
    reload: load,
  };
}
