// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
// 云函数入口函数
exports.main = async (event, context) => {
  const params = {
    date: event.date,
  };
  const time = new Date(params.date);
  const yy = time.getFullYear();
  const _MM = time.getMonth() + 1;
  const MM = _MM > 9 ? _MM : `0${_MM}`;
  const _dd = time.getDate();
  const dd = _dd > 9 ? _dd : `0${_dd}`;
  return `${yy}-${MM}-${dd}`;
};
