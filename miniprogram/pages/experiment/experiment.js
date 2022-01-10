// pages/experiment/experiment.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    __debug__: false,
    experiments: {
      mark_current_star: false,
      mark_all_stars: false,
      delete_all_history: false,
      top_ten_stars: false,
      gen_current_poster: false,
    },
    showExpDialog: false,
    checkboxItems: [
      { name: '🧪 标记当前明星脸部位置', value: 'mark_current_star' },
      { name: '🧪 大图标记所有明星脸部位置', value: 'mark_all_stars' },
      { name: '🧪 删除所有历史记录的入口', value: 'delete_all_history' },
      { name: '🧪 识别量前十的名人/明星', value: 'top_ten_stars' },
      { name: '🧪 生成分享海报(将替换分享功能)', value: 'gen_current_poster' },
      { name: '🧪 加入我们开发上传照片入口', value: 'allow_upload_poster' },
    ],
    confirmButtons: [{ text: '取消' }, { text: '确定' }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.openid) {

    }
    wx.cloud.callFunction({
      name: 'openapi',
      success: res => {
        console.log('openapi success', res);
      },
      fail: err => {
        console.error('openapi fail', err);
      }
    });
    this.setData({
      openid: app.globalData.openid,
    });
    // this.onDBAdd()
    // this.onDBGet()
  },

  showExpCloseDialog: function () {
    this.setData({
      showExpDialog: true,
    });
  },
  tapConfirmCloseExpButton: function (e) {
    if (e.detail.index === 1) {
      this.setData({
        showExpDialog: false,
      });
      app.globalData.__debug__ = false;
      app.globalData.versioncount = 0;
      wx.switchTab({
        url: '../my/my',
      });
    } else {
      this.setData({
        showExpDialog: false,
      });
    }
  },

  onDBAdd: function () {
    const db = wx.cloud.database();
    db.collection('flags').add({
      data: {
        createTime: new Date().getTime(),
        format_createTime: new Date(),
        __debug__: this.data.__debug__,
        versioncount: app.globalData.versioncount,
        experiments: this.data.experiments,
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [新增记录] 成功: ', res);
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err);
      }
    });
  },

  onDBGet: function () {
    const db = wx.cloud.database();
    db.collection('flags').doc(this.data.openid).get({

      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [查询] 成功: ', res);
      },
      fail: err => {
        console.error('[数据库] [查询] 失败：', err);
      }
    });
  },

  onDBUpdate: function () {
    const db = wx.cloud.database();
    db.collection('flags').doc(this.data.openid).update({
      data: {
        __debug__: this.data.__debug__,
        versioncount: app.globalData.versioncount,
        experiments: this.data.experiments,
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [更新记录] 成功: ', res);
      },
      fail: err => {
        console.error('[数据库] [更新记录] 失败：', err);
      }
    });
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    const checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (let i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          this.setData({
            [`experiments.${values[j]}`]: true
          });
          break;
        }
      }
    }
    console.log('experiments', this.data.experiments);
    this.onDBUpdate();

    this.setData({
      checkboxItems: checkboxItems,
      [`formData.checkbox`]: e.detail.value
    });

    console.log('app.globalData', app.globalData);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      experiments: app.globalData.experiments,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});
