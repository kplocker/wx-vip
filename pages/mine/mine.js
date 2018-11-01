// pages/mine/mine.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 点击获取图像信息
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    console.log(this.data)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  naviToAbout: function() {
    wx.navigateTo({
      url: '../about/about'
    })
  },
  naviToUpload: function () {
    wx.navigateTo({
      url: '../uploadQ/uploadQ'
    })
  }

})