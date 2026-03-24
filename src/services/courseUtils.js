import { COURSE_COLORS } from '../constants/colors';

export function getCurrentWeek(termStartDate) {
  if (!termStartDate) return 1;
  const start = new Date(termStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = now - start;
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

export function isWeekInRanges(weekNumber, weekRanges, weekType) {
  if (!weekRanges || weekRanges.length === 0) return true;
  for (const range of weekRanges) {
    if (weekNumber >= range.start && weekNumber <= range.end) {
      const type = range.type || weekType || 'all';
      if (type === 'odd' && weekNumber % 2 === 0) continue;
      if (type === 'even' && weekNumber % 2 === 1) continue;
      return true;
    }
  }
  return false;
}

export function filterCoursesForWeek(courses, weekNumber) {
  return courses.filter((c) => isWeekInRanges(weekNumber, c.weekRanges, c.weekType));
}

export function assignColors(courses) {
  const nameColorMap = {};
  let colorIdx = 0;

  return courses.map((c) => {
    if (c.color) return c;
    if (!nameColorMap[c.name]) {
      nameColorMap[c.name] = COURSE_COLORS[colorIdx % COURSE_COLORS.length];
      colorIdx++;
    }
    return { ...c, color: nameColorMap[c.name] };
  });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function buildGrid(coursesForWeek) {
  const grid = {};
  coursesForWeek.forEach((course) => {
    const startPair = Math.ceil(course.startPeriod / 2);
    const endPair = Math.ceil(course.endPeriod / 2);
    for (let pair = startPair; pair <= endPair; pair++) {
      const key = `${course.dayOfWeek}-${pair}`;
      if (!grid[key]) grid[key] = [];
      // 避免重复添加同一课程（跨节课会出现多次）
      if (!grid[key].find((c) => c.id === course.id)) {
        grid[key].push(course);
      }
    }
  });
  return grid;
}

// 将周次范围格式化为可读字符串
export function formatWeekRanges(weekRanges, weekType) {
  if (!weekRanges || weekRanges.length === 0) return '';
  const parts = weekRanges.map((r) =>
    r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`
  );
  let str = parts.join(',') + '周';
  if (weekType === 'odd') str += '（单周）';
  if (weekType === 'even') str += '（双周）';
  return str;
}
