// pages/collection/collection.js

const db = wx.cloud.database()
const app = getApp()
const openId = app.globalData.openId

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionItems: [],
    questionType: 0,
    questionCount: '',
    currentQuestionCount: 0,
    questionItem: {
      question: '',
      answer: [],
      item1: '',
      item2: '',
      item3: '',
      item4: ''
    },
    answerFlag: [1, 1, 1, 1], //没有回答1 正确2 多选选择3 错误0
    loadingFlag: 0,
    dataEmptyFlag: 0 //没有错题时
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var questionItems = [];
    var CurrentPagesSrc = getCurrentPages()

    db.collection('collection').where({
      _openid: openId
    })
      .get()
      .then(res => {
        this.setData({
          questionItems: res.data,
          questionType: res.data[0].questionType,
          questionCount: res.data.length,
          questionItem: {
            question: res.data[0].question,
            answer: res.data[0].answer,
            item1: res.data[0].item1,
            item2: res.data[0].item2,
            item3: res.data[0].item3,
            item4: res.data[0].item4
          },
          loadingFlag: 1
        })
        for (var i = 0; i < this.data.questionItem.answer.length; i++) {
          
          if (this.data.questionItem.answer[i]) {
            this.setData({
              ["answerFlag[" + this.data.questionItem.answer[i] + "]"]: 2
            })
          }
        }
      })
      .catch(error => {
        this.setData({
          loadingFlag: 1,
          dataEmptyFlag: 1
        })
      })


  },

  /**
   * 用户点击答案事件的处理函数
   */

  changePageData: function (currentQuestionCount, delay) {
    var that = this
    setTimeout(() => {
      this.setData({
        currentQuestionCount: currentQuestionCount,
        questionType: that.data.questionItems[currentQuestionCount].questionType,
        questionCount: that.data.questionItems.length,
        questionItem: {
          question: that.data.questionItems[currentQuestionCount].question,
          answer: that.data.questionItems[currentQuestionCount].answer.sort(),
          item1: that.data.questionItems[currentQuestionCount].item1,
          item2: that.data.questionItems[currentQuestionCount].item2,
          item3: that.data.questionItems[currentQuestionCount].item3,
          item4: that.data.questionItems[currentQuestionCount].item4
        },
        answerFlag: [1, 1, 1, 1], //没有回答1 正确2 错误0
        clickFlag: 0,
        subFlag: 0
      })
      for (var i = 0; i < that.data.questionItem.answer.length; i++) {
        
        if (that.data.questionItem.answer[i]) {
          that.setData({
            ["answerFlag[" + that.data.questionItem.answer[i] + "]"]: 2
          })
        }
      }
    }, delay)
  },
  lastQ: function (e) {
    if (this.data.currentQuestionCount - 1 >= 0) {
      this.changePageData(--this.data.currentQuestionCount, 10) // 上一页      
    }
  },
  nextQ: function (e) {
    if (this.data.currentQuestionCount + 1 < this.data.questionCount) {
      this.changePageData(++this.data.currentQuestionCount, 10) // 下一页  
    }
  },
  //删除
  deleteItem: function(e) {
    var data = this.data.questionItems[this.data.currentQuestionCount]
    wx.showModal({
      title: '删除当前题目？',
      content: '删除后不可恢复',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        
        if (res.confirm) {
          
          db.collection('collection').doc(data._id)
          .remove()
          .then(res => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
            getCurrentPages()[getCurrentPages().length - 1].onLoad()
          }) 
        }
      }
    })
  },
  // 删除全部
  deleteAll: function(e) {
    
    wx.showModal({
      title: '清空所有题目？',
      content: '删除后不可恢复',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在删除',
            icon: 'loading',
            duration: 1500
          })
          wx.cloud.callFunction({
            name: 'emptyCollection',
            complete: res => {
              wx.showToast({
                title: '已清空',
                icon: 'success',
                duration: 1500
              })
              getCurrentPages()[getCurrentPages().length - 1].onLoad()
              
            }
          })
        }
      }
    })
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})