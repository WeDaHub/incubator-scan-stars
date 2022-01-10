// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const { ENV, OPENID, APPID } = cloud.getWXContext();

  const db = wx.cloud.database();
  const params = {
    globalData: event.globalData,
  };

  async function initialFlags () {
    return await db.collection('flags').add({
      data: {
        createTime: new Date().getTime(),
        openid: OPENID,
        globalData: params.globalData,
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [新增记录] 成功: ', res);
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err);
      }
    });
  }
  async function updateFlags () {
    return await db.collection('flags').where({
      openid: OPENID
    }).update({
      data: {
        globalData: params.globalData,
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [更新 flags] 成功: ', res);
        return res;
      },
      fail: err => {
        console.error('[数据库] [更新 flags] 失败：', err);
        return err;
      }
    });
  }
  return {
    initialFlags,
    updateFlags,
  };
};
