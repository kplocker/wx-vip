// pages/setting/setting.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // autoAddErrorBook: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(app.data.autoAddErrorBook)
    var autoAddErrorBookFlag = wx.getStorageSync('autoAddErrorBookFlag')
    if (autoAddErrorBookFlag != null) {
      this.setData({
        autoAddErrorBook: autoAddErrorBookFlag
      })
    } else {
      this.setData({
        autoAddErrorBook: true
      })
    }
  },

  autoAddErrorBookSwitchChange: function(e) {
  
    try {
      wx.setStorageSync('autoAddErrorBookFlag', e.detail.value)
    } catch (err) { console.log(err)}
    
  }
})