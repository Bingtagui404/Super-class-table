import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated as RNAnimated,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import ScheduleGrid from '../components/ScheduleGrid';
import WeekSelector from '../components/WeekSelector';
import { useCourses } from '../hooks/useCourses';
import { formatWeekRanges } from '../services/courseUtils';
import { THEME } from '../constants/colors';
import { MAX_WEEKS } from '../constants/config';
import DateWheelPicker from '../components/DateWheelPicker';

export default function HomeScreen({ navigation }) {
  const {
    courses,
    settings,
    currentWeek,
    setCurrentWeek,
    loading,
    removeCourse,
    updateSettings,
    getGrid,
    reload,
  } = useCourses();

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dateInput, setDateInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const week = selectedWeek || currentWeek;
  const { grid, occupied } = getGrid(week);
  const prevWeekData = week > 1 ? getGrid(week - 1) : { grid: {}, occupied: {} };
  const nextWeekData = week < MAX_WEEKS ? getGrid(week + 1) : { grid: {}, occupied: {} };

  const needSetup = !settings.termStartDate;

  const handleSwipeLeft = () => {
    if (week >= MAX_WEEKS) return false;
    setSelectedWeek(week + 1);
    return true;
  };

  const handleSwipeRight = () => {
    if (week <= 1) return false;
    setSelectedWeek(week - 1);
    return true;
  };

  const modalScale = useRef(new RNAnimated.Value(0.7)).current;
  const modalOpacity = useRef(new RNAnimated.Value(0)).current;

  const handlePressCourse = (course) => {
    modalScale.setValue(0.7);
    modalOpacity.setValue(0);
    setDetailCourse(course);
  };

  // 在 Modal 的 onShow 回调中启动入场动画，确保内容已渲染
  const handleModalShow = () => {
    RNAnimated.parallel([
      RNAnimated.spring(modalScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      RNAnimated.timing(modalOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  // 关闭时先播退场动画，再真正隐藏
  const handleCloseModal = () => {
    RNAnimated.parallel([
      RNAnimated.timing(modalScale, { toValue: 0.7, duration: 150, useNativeDriver: true }),
      RNAnimated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setDetailCourse(null);
    });
  };

  const handlePressEmpty = (day, startPeriod, endPeriod) => {
    navigation.navigate('AddCourse', { dayOfWeek: day, startPeriod, endPeriod });
  };

  const handleEdit = () => {
    if (detailCourse) {
      setDetailCourse(null);
      navigation.navigate('AddCourse', { course: detailCourse });
    }
  };

  const handleDelete = () => {
    if (!detailCourse) return;
    Alert.alert('删除课程', `确定删除"${detailCourse.name}"吗？`, [
      { text: '取消' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeCourse(detailCourse.id);
          setDetailCourse(null);
        },
      },
    ]);
  };

  const normalizeDateInput = (input) => {
    const match = input.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) return null;
    const [, y, m, d] = match;
    const month = parseInt(m);
    const day = parseInt(d);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleSaveDate = async () => {
    const normalized = normalizeDateInput(dateInput);
    if (!normalized) {
      Alert.alert('格式错误', '请输入日期，如 2025-9-1 或 2025-09-01');
      return;
    }
    await updateSettings({
      termStartDate: normalized,
      currentSemesterId: normalized.slice(0, 4) + '-' + (parseInt(normalized.slice(5, 7)) > 6 ? '1' : '2'),
    });
    setShowSettings(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {settings.currentSemesterId || '民大课表'}
        </Text>
        <TouchableOpacity onPress={() => {
          setDateInput(settings.termStartDate || '');
          setShowSettings(true);
        }}>
          <Text style={styles.settingsBtn}>设置</Text>
        </TouchableOpacity>
      </View>

      {/* Setup prompt */}
      {needSetup && (
        <TouchableOpacity
          style={styles.setupBanner}
          onPress={() => {
            setDateInput('');
            setShowSettings(true);
          }}
        >
          <Text style={styles.setupText}>请先设置开学日期</Text>
        </TouchableOpacity>
      )}

      {/* Week Selector */}
      <WeekSelector
        currentWeek={currentWeek}
        selectedWeek={week}
        onSelectWeek={setSelectedWeek}
      />

      {/* Schedule Grid */}
      <ScheduleGrid
        grid={grid}
        occupied={occupied}
        prevGrid={prevWeekData.grid}
        prevOccupied={prevWeekData.occupied}
        nextGrid={nextWeekData.grid}
        nextOccupied={nextWeekData.occupied}
        onPressCourse={handlePressCourse}
        onPressEmpty={handlePressEmpty}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />

      {/* Import FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Import')}
      >
        <Text style={styles.fabText}>导入课表</Text>
      </TouchableOpacity>

      {/* Course Detail Modal */}
      <Modal visible={!!detailCourse} transparent animationType="none" onShow={handleModalShow}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <RNAnimated.View style={[styles.modalContent, { transform: [{ scale: modalScale }], opacity: modalOpacity }]} onStartShouldSetResponder={() => true}>
            {detailCourse && (
              <>
                <Text style={styles.modalTitle}>{detailCourse.name}</Text>
                {detailCourse.teacher ? (
                  <Text style={styles.modalInfo}>教师：{detailCourse.teacher}</Text>
                ) : null}
                {detailCourse.location ? (
                  <Text style={styles.modalInfo}>教室：{detailCourse.location}</Text>
                ) : null}
                <Text style={styles.modalInfo}>
                  周次：{formatWeekRanges(detailCourse.weekRanges, detailCourse.weekType)}
                </Text>
                <Text style={styles.modalInfo}>
                  节次：第{detailCourse.startPeriod}-{detailCourse.endPeriod}节
                </Text>
                <Text style={styles.modalInfo}>
                  来源：{detailCourse.source === 'imported' ? '导入' : '手动添加'}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                    <Text style={styles.editBtnText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </RNAnimated.View>
        </TouchableOpacity>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsContent} onStartShouldSetResponder={() => true}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
            <Text style={styles.modalTitle}>设置</Text>
            <Text style={styles.modalInfo}>开学日期</Text>
            <TextInput
              style={styles.input}
              placeholder="例如 2025-9-1 或 2025-09-01"
              value={dateInput}
              onChangeText={setDateInput}
            />
            <DateWheelPicker
              value={dateInput}
              onDateChange={(d) => setDateInput(d)}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDate}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                Alert.alert('清除数据', '确定清除所有课程吗？此操作不可撤销。', [
                  { text: '取消' },
                  {
                    text: '清除',
                    style: 'destructive',
                    onPress: async () => {
                      const { clearAllCourses } = require('../services/storage');
                      await clearAllCourses();
                      reload();
                      setShowSettings(false);
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.clearBtnText}>清除所有课程</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedbackBtn}
              onPress={() => {
                Alert.alert(
                  '反馈问题',
                  '开发者：白小纯\n邮箱：527196771@qq.com',
                  [
                    {
                      text: '复制邮箱',
                      onPress: () => {
                        Clipboard.setStringAsync('527196771@qq.com');
                        Alert.alert('已复制', '邮箱已复制到剪贴板');
                      },
                    },
                    { text: '关闭' },
                  ]
                );
              }}
            >
              <Text style={styles.feedbackBtnText}>反馈问题</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: THEME.white,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  settingsBtn: { fontSize: 14, color: THEME.primary },
  setupBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    alignItems: 'center',
  },
  setupText: { color: '#856404', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: THEME.white, fontSize: 15, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginBottom: 12 },
  modalInfo: { fontSize: 14, color: THEME.textSecondary, marginBottom: 6 },
  modalActions: { flexDirection: 'row', marginTop: 16, justifyContent: 'flex-end' },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.primary,
    borderRadius: 6,
    marginRight: 10,
  },
  editBtnText: { color: THEME.white, fontSize: 14 },
  deleteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.danger,
    borderRadius: 6,
  },
  deleteBtnText: { color: THEME.white, fontSize: 14 },
  settingsContent: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: THEME.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: THEME.white, fontSize: 16, fontWeight: 'bold' },
  clearBtn: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.danger,
  },
  clearBtnText: { color: THEME.danger, fontSize: 14 },
  feedbackBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  feedbackBtnText: { color: THEME.primary, fontSize: 14 },
});
