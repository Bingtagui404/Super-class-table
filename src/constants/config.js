export const JWXT_URL = 'http://jwxt.dlnu.edu.cn/jsxsd/';

export const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 金石滩校区各节次上课时间
export const PERIODS = [
  { period: 1, time: '08:30' },
  { period: 2, time: '09:20' },
  { period: 3, time: '10:20' },
  { period: 4, time: '11:10' },
  { period: 5, time: '12:10' },
  { period: 6, time: '12:55' },
  { period: 7, time: '13:30' },
  { period: 8, time: '14:20' },
  { period: 9, time: '15:20' },
  { period: 10, time: '16:10' },
  { period: 11, time: '17:10' },
  { period: 12, time: '17:55' },
];

// 保留供 AddCourseScreen 等使用
// 大节时间（金石滩校区）
export const PERIOD_PAIR_TIMES = [
  { pair: 1, periods: [1, 2],   start: '08:30', end: '10:00' },
  { pair: 2, periods: [3, 4],   start: '10:20', end: '11:50' },
  { pair: 3, periods: [5, 6],   start: '12:10', end: '12:55' },
  { pair: 4, periods: [7, 8],   start: '13:30', end: '15:00' },
  { pair: 5, periods: [9, 10],  start: '15:20', end: '16:50' },
  { pair: 6, periods: [11, 12], start: '17:10', end: '17:55' },
];

// 保留供 AddCourseScreen 等使用
export const PERIOD_PAIRS = [
  { label: '1-2', start: 1, end: 2 },
  { label: '3-4', start: 3, end: 4 },
  { label: '5-6', start: 5, end: 6 },
  { label: '7-8', start: 7, end: 8 },
  { label: '9-10', start: 9, end: 10 },
  { label: '11-12', start: 11, end: 12 },
];

export const MAX_WEEKS = 25;

export const DEFAULT_SETTINGS = {
  termStartDate: '',
  currentSemesterId: '',
};
