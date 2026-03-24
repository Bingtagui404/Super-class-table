# 民大课表

> 专为**大连民族大学**学生打造的课程表 App，解决"超级课程表"无法导入新版教务系统课程的问题。

## 为什么做这个？

学校升级了新版教务系统（强智科技），市面上的课表 App（超级课程表等）都无法正确导入课程。与其等第三方适配，不如自己动手做一个。

## 功能

- **一键导课** — 在 App 内登录教务系统，自动解析课表页面，一键导入所有课程
- **周课表视图** — 左右滑动切换周次（像切手机桌面一样），自动高亮当前周
- **周次网格选择** — 点击顶部周数可弹出 1-25 周网格，快速跳转
- **手动加课** — 点击空白格子手动添加课程（社团、补习等）(未测试)
- **课程详情弹窗** — 点击课程查看完整信息（教师、教室、周次）
- **切换账号** — 支持多人共用一部手机导课
- **本地存储** — 导入一次，离线随时查看

## 适配信息

| 项目 | 说明 |
|------|------|
| 教务系统 | 强智教务系统新版（`jwxt.dlnu.edu.cn`） |
| 校区 | 金石滩校区时间表 |
| 节次 | 6 大节（08:30 ~ 21:50） |
| 周次 | 最多 25 周，支持逗号分隔多段周次（如 10-13,17-18周） |

## 技术栈

- **React Native + Expo SDK 55**
- **WebView** — 内嵌教务系统登录页，通过 JS 注入解析课表 HTML
- **AsyncStorage** — 本地持久化课程数据和设置
- **React Navigation** — 页面路由

## 安装使用

### 方式一：直接安装 APK

从 [Releases](https://github.com/Bingtagui404/Super-class-table/releases) 下载最新 APK，传到安卓手机安装即可。

### 方式二：本地开发

```bash
# 克隆项目
git clone https://github.com/Bingtagui404/Super-class-table.git
cd Super-class-table

# 安装依赖
npm install

# 启动开发服务器（需要 Expo Go）
npx expo start

# 本地构建 APK（需要 Android Studio）
npx expo run:android --variant release
```

## 导课流程

1. 打开 App → 点击"导入课表"
2. 在 WebView 中登录教务系统
3. 进入 **培养服务 → 我的课表 → 学期理论课表**
4. 点击顶部"导入课表"按钮
5. 等待解析完成，自动返回课表页面

## 项目结构

```
src/
├── screens/
│   ├── HomeScreen.js      # 主页（课表 + 设置 + 周选择）
│   ├── ImportScreen.js     # WebView 导课页
│   └── AddCourseScreen.js  # 手动加课页
├── components/
│   ├── ScheduleGrid.js     # 课表网格（三页 ViewPager 滑动）
│   ├── CourseCell.js        # 单个课程格子
│   ├── TimeColumn.js        # 左侧时间列
│   ├── DayHeader.js         # 顶部星期栏
│   ├── WeekSelector.js      # 周次选择器 + 网格弹窗
│   ├── WheelPicker.js       # 滚轮选择器
│   └── DateWheelPicker.js   # 日期滚轮选择器
├── services/
│   ├── parser.js            # 教务系统 HTML 解析器（核心）
│   ├── courseUtils.js        # 课程数据处理
│   └── storage.js           # AsyncStorage 封装
├── hooks/
│   └── useCourses.js        # 课程数据 Hook
└── constants/
    ├── config.js             # 节次时间、教务系统 URL 等配置
    └── colors.js             # 主题颜色
```

## 解析器说明

教务系统页面有两种 HTML 结构，解析器（`parser.js`）兼容两种：

- **方式一**：课程信息在多个 `<div class="qz-hasCourse-detailitem">` 中分开存放
- **方式二**：课程信息合并在 `<span class="qz-hasCourse-abbrinfo">` 中

解析流程：自动将周次选择器切到"全部" → 等待页面刷新 → 遍历 `table.qz-weeklyTable` 提取课程数据。

## 反馈

如果遇到问题或有建议：

- **GitHub Issues**: [提交 Issue](https://github.com/Bingtagui404/Super-class-table/issues)
- **邮箱**: 527196771@qq.com
- **开发者**: 白小纯（大连民族大学）

## 致谢

本项目由 [Claude Code](https://claude.ai/claude-code)（Anthropic）辅助开发。

## License

MIT
