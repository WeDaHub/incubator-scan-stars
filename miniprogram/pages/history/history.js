// pages/history/history.js
const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    experiments: app.globalData.experiments,
    allResult: [],
    empty: false,
    itemResult: [],
    result: [],
    show: false,
    slideButtons: [{
      type: 'warn',
      text: '删除',
    }],
    showConfirm: false,
    confirmButtons: [{ text: '取消' }, { text: '确定' }],
    current_id: null,
    showDeleteAllConfirm: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      });
    }
    wx.showToast({
      icon: 'loading',
      title: '数据加载中',
      duration: 500,
    });
    this.onQueryAll();
    console.log('experiments', this.data.experiments);
    console.log('globalData', app.globalData);
  },

  onQueryAll: function () {
    // 查询当前用户所有的 counters
    db.collection('stars').where({
      _openid: this.data.openid,
      shadow: false,
    }).orderBy('createTime', 'desc').get({
      success: res => {
        this.setData({
          allResult: res.data,
          empty: res.data.length === 0,
        });
        console.log('[数据库] [查询全部记录] 成功: allResult', res.data);
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        });
        console.error('[数据库] [查询全部记录] 失败：', err);
      }
    });
  },

  onQueryOne: function (_id) {
    // 查询一条数据记录
    db.collection('stars').doc(_id).get({
      success: res => {
        this.setData({
          itemResult: res.data,
          result: res.data.result,
        });
        console.log('[数据库] [查询一条记录] 成功: ', res.data);
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        });
        console.error('[数据库] [查询一条记录] 失败：', err);
      }
    });
  },

  // 更新一条记录
  onUpdateOne: function (_id) {
    db.collection('stars').doc(_id).update({
      data: {
        shadow: true,
      },
      success: res => {
        console.log('[数据库] [更新一条记录] 成功: ', res);
        this.setData({
          itemResult: res.data,
          result: res.data.result,
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        });
        console.error('[数据库] [更新一条记录] 失败：', err);
      }
    });
  },

  slideButtonTap (e) {
    const _id = e.currentTarget.dataset.idx;
    this.setData({
      current_id: _id,
      showConfirm: true,
    });
  },
  // 显示二次确认弹窗
  tapConfirmDialogButton: function (e) {
    if (e.detail.index === 1) {
      this.onUpdateOne(this.data.current_id);
      const _allResult = this.data.allResult.filter((item) => item._id !== this.data.current_id);
      this.setData({
        allResult: _allResult,
        empty: _allResult.length === 0,
        showConfirm: false,
        current_id: null,
      });
    } else {
      this.setData({
        showConfirm: false,
        current_id: null,
      });
    }
  },

  // 更新全部记录
  onUpdateAll: function (_openid) {
    wx.cloud.callFunction({
      name: 'deleteall',
      success: res => {
        console.log('[数据库] [更新全部记录] 成功: ', res);
      },
      fail: err => {
        console.error('删除失败: ', err);
        wx.showToast({
          icon: 'error',
          title: '删除失败',
        });
      }
    });
  },
  // 显示全部删除确认弹窗
  deleteAll: function (e) {
    this.setData({
      showDeleteAllConfirm: true,
    });
  },
  tapConfirmDeleteAllButton: function (e) {
    if (e.detail.index === 1) {
      this.onUpdateAll(this.data.openid);
      this.onQueryAll(this.data.openid);
      const _allResult = this.data.allResult;
      this.setData({
        allResult: _allResult,
        empty: _allResult.length === 0,
        showDeleteAllConfirm: false,
      });
    } else {
      this.setData({
        showDeleteAllConfirm: false,
      });
    }
  },
  // 获取弹窗
  showDialog: function (e) {
    const _id = e.currentTarget.dataset.idx;
    console.log(e);
    this.onQueryOne(_id);
    this.setData({
      show: true,
    });
  },

  // 隐藏弹窗
  hideDialog: function () {
    this.setData({
      itemResult: [],
      show: false,
    });
  },
  onShowGallery: function () {
    this.setData({
      showGallery: true,
    });
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
    return {
      title: '拍一下鉴名人',
      path: '/page/index/index',
      imageUrl: app.globalData.poster,
    };
  }
});
