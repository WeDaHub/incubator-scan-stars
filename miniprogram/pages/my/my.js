// pages/my/my.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    userInfo: {},
    show: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    versioncount: app.globalData.versioncount,
    openExp: app.globalData.__debug__,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log('setting', res);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('res-avatar', res);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
            }
          });
        }
      }
    });
    // 获取版本信息
    this.setData({
      accountInfo: wx.getAccountInfoSync(),
    });
    console.log(this.data.accountInfo);
  },

  showDialog: function () {
    this.setData({
      show: true,
    });
  },
  closeDialog: function () {
    this.setData({
      show: false,
    });
  },

  onVersionClick: function (e) {
    console.log('v', e.currentTarget);
    this.setData({
      versioncount: this.data.versioncount + 1,
    });
    if (this.data.versioncount >= 5) {
      app.globalData.__debug__ = true;
      this.setData({
        openExp: app.globalData.__debug__,
      });
    }
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
      openExp: app.globalData.__debug__,
      versioncount: app.globalData.versioncount,
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
