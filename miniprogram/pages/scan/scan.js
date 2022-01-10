// pages/scan/scan.js
const app = getApp();
const mockImg = 'https://7363-scan-star-9g936she293719d9-1306033714.tcb.qcloud.la/stars/star-1621938374598.jpg';
const mockRes = {
  BasicInfo: "中国台湾，男性，歌手、制作人、导演",
  ID: "40000054",
  Labels: ["娱乐明星", "歌手"],
  Name: "周杰伦",
  user_requestID: "9efbb048-bd64-11eb-a19c-525400742e8d",
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    deviceBack: true,
    origin_result: null,
    // imgUrl: mockImg || null,
    // result: Array(5).fill(mockRes) || null,
    imgUrl: null,
    result: null,
    names: [],
    format_names: null,
    createTime: null,
    format_createTime: null,
    cloudImg: {},
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

  // 转换摄像头
  onTrans: function () {
    this.setData({
      deviceBack: !this.data.deviceBack,
    });
  },

  // 重新拍摄
  onReset: function () {
    console.log('reset');
    this.setData({
      imgUrl: null,
      result: null,
    });
  },

  // 调用相机拍照
  takePhoto () {
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'normal',
      success: (res) => {
        this.setData({
          imgUrl: res.tempImagePath
        });
        this.onUploadCloud({
          type: 'takePhoto',
          res
        });
      }
    });
  },

  // 从相册选择
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          imgUrl: res.tempFilePaths[0]
        });
        this.onUploadCloud({
          type: 'doUpload',
          res
        });
      },
      fail: res => {
        console.error('error', res);
      }
    });
  },

  // 识别名人/明星
  onDetect: function () {
    wx.showToast({
      icon: 'loading',
      title: '图像分析中',
    });
    wx.cloud.callFunction({
      name: 'stardetect',
      data: {
        ImageUrl: this.data.cloudImg.downloadPath,
      },
      success: res => {
        console.log('[腾讯云接口返回数据] ', res);
        if (res.result.Faces.length === 0) {
          wx.showToast({
            icon: 'error',
            title: '未识别到人脸',
          });
          this.onReset();
        } else {
          const _result = [];
          res.result.Faces.map((face) => {
            const {
              ID,
              Name,
              BasicInfo,
              Labels
            } = face;
            const _resultFace = {
              user_requestID: res.requestID,
              ID,
              Name,
              BasicInfo,
              Labels: Object.values(Labels[0])
            };
            _result.push(_resultFace);
          });

          this.setData({
            origin_result: res,
            result: _result,
            names: this.getAttrs(res.result.Faces, 'Name'),
            format_names: this.getAttrs(res.result.Faces, 'Name').join('、'),
          });
          console.log('[格式化后生成的数据] ', _result);
        }
        this.onDBAdd();
      },
      fail: err => {
        console.error('接口调用失败: ', err);
        wx.showToast({
          icon: 'error',
          title: '调用失败',
        });
      }
    });
  },

  // 上传图片到服务器并返回识别结果
  onUploadCloud: function ({
    type = 'takePhoto',
    res
  }) {
    wx.showLoading({
      title: '图像分析中',
    });
    let filePath = null;
    if (type === 'takePhoto') {
      filePath = res.tempImagePath;
    } else {
      filePath = res.tempFilePaths[0];
    }

    const cloudPath = `stars/star-${new Date().getTime()}${filePath.match(/\.[^.]+?$/)[0]}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res);

        const getDownloadPath = (fileID) => {
          const tmp = fileID.replace('cloud://scan-star-9g936she293719d9.', 'https://').split('/stars/');
          const domain = '.tcb.qcloud.la/stars/';
          tmp.splice(1, 0, domain);
          return tmp.join('');
        };

        this.setData({
          cloudImg: {
            fileID: res.fileID,
            cloudPath: cloudPath,
            imagePath: filePath,
            downloadPath: getDownloadPath(res.fileID),
          }
        }, this.onDetect.bind(this));
      },
      fail: e => {
        console.error('[上传文件] 失败：', e);
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        });
      },
      complete: () => {
        wx.hideLoading();
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
    db.collection('stars').add({
      data: {
        createTime: new Date().getTime(),
        format_createTime: formatCreateTime.result,
        cloudImg: this.data.cloudImg,
        userInfo: this.data.userInfo,
        origin_result: this.data.origin_result,
        result: this.data.result,
        names: this.data.names,
        format_names: this.data.format_names,
        shadow: false, // 是否已被删除
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
  // 工具函数： 获取数组对象特定属性的值的集合
  getAttrs: function (arr, key) {
    return arr.map(item => item[key]);
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
