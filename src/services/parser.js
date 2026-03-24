// 大连民族大学强智教务系统课表解析器
// 兼容两种页面结构：
//   方式一：person iframe 直接渲染（div 分开存放）
//   方式二：多层 iframe 嵌套（span.qz-hasCourse-abbrinfo 合并存放）

export const PARSE_SCHEDULE_JS = `
(function() {
  try {
    // === 查找课表表格 ===
    function findScheduleTable(doc) {
      if (!doc) return null;
      var t = doc.querySelector('table.qz-weeklyTable');
      if (t) return { doc: doc, table: t };
      return null;
    }

    function searchFrames(doc) {
      var result = findScheduleTable(doc);
      if (result) return result;
      try {
        var frames = doc.querySelectorAll('iframe, frame');
        for (var i = 0; i < frames.length; i++) {
          try {
            var fDoc = frames[i].contentDocument || frames[i].contentWindow.document;
            result = searchFrames(fDoc);
            if (result) return result;
          } catch(e) {}
        }
      } catch(e) {}
      return null;
    }

    // 从当前文档开始查找
    var found = searchFrames(document);
    if (!found) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: '未找到课表，请先进入"学期理论课表"页面'
      }));
      return;
    }

    var doc2 = found.doc;
    var table = found.table;

    // === 尝试切换周次到"全部" ===
    var weekSel = doc2.querySelector('#week') || doc2.querySelector('select[name="week"]');
    if (weekSel && weekSel.value !== '') {
      weekSel.value = '';
      weekSel.dispatchEvent(new Event('change', { bubbles: true }));
      // 通知 App 需要等待刷新后重试
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'retry',
        message: '正在切换到全部周次，请稍候...'
      }));
      return;
    }

    // 也检查嵌套 iframe 内的周次选择器
    var zcSel = doc2.querySelector('#zc') || doc2.querySelector('select[name="zc"]');
    if (zcSel && zcSel.value !== '') {
      zcSel.value = '';
      var form = doc2.querySelector('#searchFrom');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'retry',
        message: '正在切换到全部周次，请稍候...'
      }));
      return;
    }

    // === 解析课表 ===
    var trs = table.querySelectorAll('tr');
    var occupied = {};
    var courses = [];
    var periodIdx = 0;
    var periodMap = [[1,2],[3,4],[5,6],[7,8],[9,10],[11,12]];

    for (var r = 0; r < trs.length; r++) {
      // 找到有节次标签的行（数据行）
      var labelTd = trs[r].querySelector('td.qz-weeklyTable-label');
      if (!labelTd) continue;

      var period = periodMap[periodIdx] || [periodIdx * 2 + 1, periodIdx * 2 + 2];
      var dataTds = trs[r].querySelectorAll('td.qz-hasCourse');
      // 如果没有 qz-hasCourse 类，尝试 name="kbDataTd"
      if (dataTds.length === 0) {
        dataTds = trs[r].querySelectorAll('td[name="kbDataTd"]');
      }

      var col = 0;
      for (var d = 0; d < dataTds.length; d++) {
        // 跳过被 rowspan 占据的列
        while (occupied[periodIdx + '-' + col]) col++;

        var rs = parseInt(dataTds[d].getAttribute('rowspan')) || 1;
        if (rs > 1) {
          for (var x = 1; x < rs; x++) {
            occupied[(periodIdx + x) + '-' + col] = true;
          }
        }

        var dayOfWeek = col + 1;
        var items = dataTds[d].querySelectorAll('li.courselists-item');

        for (var k = 0; k < items.length; k++) {
          var nameEl = items[k].querySelector('.qz-hasCourse-title');
          if (!nameEl) continue;
          var courseName = nameEl.textContent.trim();
          if (!courseName) continue;

          var teacher = '';
          var location = '';
          var weeks = '';
          var startP = period[0];
          var endP = period[1];
          var weekType = 'all';

          // === 方式一：div 分开存放 ===
          var detailDivs = items[k].querySelectorAll('.qz-hasCourse-detailitem');
          if (detailDivs.length > 0) {
            for (var i = 0; i < detailDivs.length; i++) {
              var txt = detailDivs[i].textContent.trim();
              var disp = detailDivs[i].style ? detailDivs[i].style.display : '';
              if (disp === 'none') continue;
              if (txt.indexOf('教师') === 0) {
                teacher = txt.replace(/^教师[：:]/, '').trim();
              } else if (txt.indexOf('[') !== -1 && txt.indexOf('周') !== -1) {
                weeks = txt;
              } else if (txt.indexOf('小节') !== -1) {
                var pMatch = txt.match(/(\\d+)~(\\d+)/);
                if (pMatch) {
                  startP = parseInt(pMatch[1]);
                  endP = parseInt(pMatch[2]);
                }
              } else if (txt && txt.indexOf('群号') === -1 && txt.indexOf('链接') === -1) {
                location = txt;
              }
            }
          }

          // === 方式二：span 合并存放（备用） ===
          if (!weeks) {
            var abbrSpan = items[k].querySelector('.qz-hasCourse-abbrinfo');
            if (abbrSpan) {
              var info = abbrSpan.textContent.trim();
              var tM = info.match(/老师:([^;]+)/);
              if (tM) teacher = tM[1].trim();
              var timeM = info.match(/时间:([^;]+)/);
              if (timeM) {
                weeks = timeM[1].trim();
                var pM2 = weeks.match(/\\[(\\d+)-(\\d+)节\\]/);
                if (pM2) {
                  startP = parseInt(pM2[1]);
                  endP = parseInt(pM2[2]);
                }
              }
              var locM = info.match(/地点:([^;]*)/);
              if (locM) location = locM[1].trim();
            }
          }

          // === 解析周次字符串 ===
          // 格式: "[1-8周] 星期二" 或 "[10-13,17-18周] 星期二" 或 "1-8周[3-4节]"
          var weekRanges = [];
          var weekClean = weeks.replace(/\\[|\\]/g, '').replace(/星期./, '').replace('周', '').trim();
          // 也处理 "1-8周[3-4节]" 格式
          var altClean = weekClean.replace(/\\[.*?\\]/, '').trim();
          if (altClean) weekClean = altClean;

          var segments = weekClean.split(',');
          for (var s = 0; s < segments.length; s++) {
            var seg = segments[s].trim();
            if (!seg) continue;
            var rangeM = seg.match(/(\\d+)-(\\d+)/);
            if (rangeM) {
              weekRanges.push({ start: parseInt(rangeM[1]), end: parseInt(rangeM[2]), type: 'all' });
            } else {
              var singleM = seg.match(/(\\d+)/);
              if (singleM) {
                var w = parseInt(singleM[1]);
                weekRanges.push({ start: w, end: w, type: 'all' });
              }
            }
          }

          // 检查单双周
          if (weeks.indexOf('单') !== -1) weekType = 'odd';
          else if (weeks.indexOf('双') !== -1) weekType = 'even';

          // 如果没有解析到周次，默认 1-20
          if (weekRanges.length === 0) {
            weekRanges.push({ start: 1, end: 20, type: 'all' });
          }

          // 清理教师职称
          var teacherClean = teacher
            .replace(/教授|副教授|讲师（高校）|讲师\\（高校\\）|助教（高校）|助教\\（高校\\）/g, '')
            .replace(/,\\s*/g, ', ')
            .trim();

          // 清理地点（去掉重复的楼名）
          var locClean = location
            .replace(/(致新楼|弘德楼[A-Z]?区|鼎新楼)\\1/, '$1')
            .trim();

          courses.push({
            name: courseName,
            teacher: teacherClean,
            location: locClean,
            dayOfWeek: dayOfWeek,
            startPeriod: startP,
            endPeriod: endP,
            weekRanges: weekRanges,
            weekType: weekType
          });
        }
        col++;
      }
      periodIdx++;
    }

    // === 查找备注栏的无课表课程 ===
    var note = '';
    var allTds = doc2.querySelectorAll('td');
    for (var t2 = 0; t2 < allTds.length; t2++) {
      var tdText = allTds[t2].textContent;
      if (tdText && tdText.indexOf('备注') !== -1) {
        note = tdText.trim();
        break;
      }
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'courses',
      data: courses,
      count: courses.length,
      note: note
    }));

  } catch(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'error',
      message: '解析出错: ' + e.message
    }));
  }
})();
true;
`;
