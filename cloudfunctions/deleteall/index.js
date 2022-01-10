// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { ENV, OPENID, APPID } = cloud.getWXContext();
  console.log('cloud-info', ENV, OPENID, APPID);
  try {
    return await db.collection('stars').where({
      _openid: OPENID,
    })
      .update({
        data: {
          shadow: false,
        },
        success: res => {
          console.log('[数据库] [更新全部记录] 成功: ', res);
          return res;
        },
        fail: err => {
          console.error('[数据库] [更新全部记录] 失败：', err);
          return err;
        }
      });
  } catch (e) {
    console.error(e);
  }
};
