// index.js
const app = getApp();

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    list: [{
      text: "主页",
      iconPath: "cloud://scan-star-9g936she293719d9.7363-scan-star-9g936she293719d9-1306033714/icons/home.png",
      selectedIconPath: "cloud://scan-star-9g936she293719d9.7363-scan-star-9g936she293719d9-1306033714/icons/home-selected.png",
    }, {
      text: "我的",
      iconPath: "cloud://scan-star-9g936she293719d9.7363-scan-star-9g936she293719d9-1306033714/icons/my.png",
      selectedIconPath: "cloud://scan-star-9g936she293719d9.7363-scan-star-9g936she293719d9-1306033714/icons/my-selected.png",
    }],
    __debug__: app.globalData.__debug__,
  },

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

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      });
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
        wx.navigateTo({
          url: '../userConsole/userConsole',
        });
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err);
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        });
      }
    });
  },
  tabChange: function (e) {
    if (e.detail.index === 0) {
      wx.navigateTo({
        url: '../history/history',
      });
    } else if (e.detail.index === 1) {
      wx.navigateTo({
        url: '../my/my',
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '拍一下鉴名人',
      path: '/page/index/index',
      imageUrl: app.globalData.poster,
    };
  }
});
