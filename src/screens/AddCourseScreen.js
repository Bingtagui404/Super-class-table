import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useCourses } from '../hooks/useCourses';
import { THEME } from '../constants/colors';
import { DAYS } from '../constants/config';

const WEEK_TYPES = [
  { value: 'all', label: '每周' },
  { value: 'odd', label: '单周' },
  { value: 'even', label: '双周' },
];

export default function AddCourseScreen({ navigation, route }) {
  const existing = route.params?.course;
  const isEdit = !!existing;

  const { addCourse, editCourse, removeCourse } = useCourses();

  const [name, setName] = useState(existing?.name || '');
  const [teacher, setTeacher] = useState(existing?.teacher || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [dayOfWeek, setDayOfWeek] = useState(
    existing?.dayOfWeek || route.params?.dayOfWeek || 1
  );
  const [startPeriod, setStartPeriod] = useState(
    String(existing?.startPeriod || route.params?.startPeriod || 1)
  );
  const [endPeriod, setEndPeriod] = useState(
    String(existing?.endPeriod || route.params?.endPeriod || 2)
  );
  const [weekStart, setWeekStart] = useState(String(existing?.weekStart || 1));
  const [weekEnd, setWeekEnd] = useState(String(existing?.weekEnd || 16));
  const [weekType, setWeekType] = useState(existing?.weekType || 'all');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入课程名称');
      return;
    }
    const sp = parseInt(startPeriod) || 1;
    const ep = parseInt(endPeriod) || sp;
    const ws = parseInt(weekStart) || 1;
    const we = parseInt(weekEnd) || ws;

    if (ep < sp) {
      Alert.alert('提示', '结束节次不能小于开始节次');
      return;
    }

    const data = {
      name: name.trim(),
      teacher: teacher.trim(),
      location: location.trim(),
      dayOfWeek,
      startPeriod: sp,
      endPeriod: ep,
      weekStart: ws,
      weekEnd: we,
      weekRanges: [{ start: ws, end: we, type: 'all' }],
      weekType,
    };

    if (isEdit) {
      await editCourse(existing.id, data);
    } else {
      await addCourse(data);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('删除课程', `确定删除"${name}"吗？`, [
      { text: '取消' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeCourse(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? '编辑课程' : '添加课程'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>保存</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <Text style={styles.label}>课程名称 *</Text>
        <TextInput
          style={styles.input}
          placeholder="如：高等数学A"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>教师</Text>
        <TextInput
          style={styles.input}
          placeholder="选填"
          value={teacher}
          onChangeText={setTeacher}
        />

        <Text style={styles.label}>教室</Text>
        <TextInput
          style={styles.input}
          placeholder="选填，如 21B 502"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>星期</Text>
        <View style={styles.chipRow}>
          {DAYS.map((d, idx) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, dayOfWeek === idx + 1 && styles.chipActive]}
              onPress={() => setDayOfWeek(idx + 1)}
            >
              <Text
                style={[styles.chipText, dayOfWeek === idx + 1 && styles.chipTextActive]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>开始节次</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={startPeriod}
              onChangeText={setStartPeriod}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>结束节次</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={endPeriod}
              onChangeText={setEndPeriod}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>开始周</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={weekStart}
              onChangeText={setWeekStart}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>结束周</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={weekEnd}
              onChangeText={setWeekEnd}
            />
          </View>
        </View>

        <Text style={styles.label}>周类型</Text>
        <View style={styles.chipRow}>
          {WEEK_TYPES.map((wt) => (
            <TouchableOpacity
              key={wt.value}
              style={[styles.chip, weekType === wt.value && styles.chipActive]}
              onPress={() => setWeekType(wt.value)}
            >
              <Text
                style={[styles.chipText, weekType === wt.value && styles.chipTextActive]}
              >
                {wt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>删除课程</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: THEME.white,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
  cancelBtn: { fontSize: 15, color: THEME.textSecondary },
  saveBtn: { fontSize: 15, color: THEME.primary, fontWeight: 'bold' },
  form: { flex: 1 },
  formContent: { padding: 16 },
  label: { fontSize: 14, color: THEME.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  chipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  chipText: { fontSize: 13, color: THEME.text },
  chipTextActive: { color: THEME.white },
  deleteBtn: {
    marginTop: 30,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.danger,
  },
  deleteBtnText: { color: THEME.danger, fontSize: 15 },
});
