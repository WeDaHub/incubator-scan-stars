// pages/addFriends/addFriends.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    showConfirm: false,
    showTopTips: false,
    formData: {},
    error: null,
    textareaValueLength: 0,
    rules: [
      {
        name: 'textarea',
        rules: { required: true, message: '请填写加入我们的理由' },
      },
      {
        name: 'wx',
        rules: { required: true, message: '请填写微信/电话' },
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      });
      return;
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
            }
          });
        }
      }
    });
  },

  textareaChange (e) {
    const { field } = e.currentTarget.dataset;
    const length = e.detail.value.length;
    this.setData({
      [`formData.${field}`]: e.detail.value,
      textareaValueLength: length,
    });
  },
  formInputChange (e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value,
    });
  },
  submitForm () {
    this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors);
      if (!valid) {
        const firstError = Object.keys(errors);
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          });
        }
        console.log("err", firstError, this.data.error);
      } else {
        console.log('formData', this.data.formData);
        this.onDBAdd();
        wx.showToast({
          icon: 'loading',
          title: '提交中',
          duration: 500,
        });
        setTimeout(() => {
          this.setData({
            showConfirm: true,
          });
        }, 800);
      }
    });
  },

  // 写入数据库
  onDBAdd: async function () {
    const db = wx.cloud.database();
    const formatCreateTime = await wx.cloud.callFunction({
      name: 'formattime',
      data: {
        date: new Date()
      }
    });
    db.collection('friends').add({
      data: {
        createTime: new Date().getTime(),
        format_createTime: formatCreateTime.result,
        formData: this.data.formData,
        userInfo: this.data.userInfo,
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

  // 显示二次确认弹窗
  tapConfirmDialogButton: function (e) {
    this.setData({
      showConfirm: false,
    });
    wx.switchTab({
      url: '../my/my',
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});
