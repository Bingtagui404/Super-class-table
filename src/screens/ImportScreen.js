import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { PARSE_SCHEDULE_JS } from '../services/parser';
import { useCourses } from '../hooks/useCourses';
import { JWXT_URL } from '../constants/config';
import { THEME } from '../constants/colors';

export default function ImportScreen({ navigation }) {
  const webViewRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState('');
  const retryTimer = useRef(null);
  const { doImport } = useCourses();

  const handleImport = () => {
    if (importing) return;
    setImporting(true);
    setStatus('正在解析课表...');
    webViewRef.current?.injectJavaScript(PARSE_SCHEDULE_JS);
  };

  const handleMessage = async (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === 'courses') {
        if (msg.count === 0) {
          Alert.alert('提示', '未解析到课程数据，请确认已进入"学期理论课表"页面');
          setImporting(false);
          setStatus('');
          return;
        }
        const result = await doImport(msg.data);
        const noteMsg = msg.note ? `\n\n备注：${msg.note}` : '';
        Alert.alert('导入成功', result.message + noteMsg, [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else if (msg.type === 'retry') {
        // 周次选择器被切换，等待页面刷新后重试
        setStatus(msg.message || '正在切换周次...');
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => {
          webViewRef.current?.injectJavaScript(PARSE_SCHEDULE_JS);
        }, 1500);
      } else if (msg.type === 'error') {
        Alert.alert('导入失败', msg.message);
        setImporting(false);
        setStatus('');
      }
    } catch (e) {
      Alert.alert('错误', '数据解析异常：' + e.message);
      setImporting(false);
      setStatus('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>教务系统</Text>
        <TouchableOpacity
          style={[styles.importBtn, importing && styles.importBtnDisabled]}
          onPress={handleImport}
          disabled={importing}
        >
          <Text style={styles.importBtnText}>
            {importing ? '导入中...' : '导入课表'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        {status || '请登录后进入"培养服务→我的课表→学期理论课表"，然后点击"导入课表"'}
      </Text>
      <WebView
        ref={webViewRef}
        source={{ uri: JWXT_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        onMessage={handleMessage}
        originWhitelist={['*']}
        userAgent="Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: THEME.white,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  backBtn: { fontSize: 16, color: THEME.primary },
  title: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
  importBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  importBtnDisabled: {
    backgroundColor: THEME.textLight,
  },
  importBtnText: { color: THEME.white, fontSize: 14, fontWeight: 'bold' },
  hint: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
  },
  webview: { flex: 1 },
});
