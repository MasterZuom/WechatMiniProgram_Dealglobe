// export const showTimeStream = (date) => {
//   var publishDate = Date.parse(new Date(date));
//   var nowDate = Date.parse(new Date());
//   var intervalTime = nowDate - publishDate;
//   var minute = 60 * 1000;
//   var hour = 60 * minute;
//   if (intervalTime < 1 * minute) {
//     return "刚刚"
//   } else if (intervalTime < 60 * minute) {
//     var time = (intervalTime / minute).toFixed(0)
//     return time + "分钟之前"
//   } else if (intervalTime < 24 * hour) {
//     var time = (intervalTime / hour).toFixed(0)
//     return time + "小时之前"
//   } else if (intervalTime < 48 * hour) {
//     return "昨天"
//   } else {
//     var d = new Date(date);
//     return (parseInt(d.getMonth()) + 1) + '月' + d.getDate() + '日';
//   }
// }