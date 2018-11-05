// pages/questions/questions.js

// var time = 0
// var touchDot = 0 //触摸时的原点
// var interval = ""
// var flag_hd = true
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
      answerFlag: [1,1,1,1], //没有回答1 正确2 多选选择3 错误0
      clickFlag: 0 ,
      subFlag: 0,
      loadingFlag: 0,
      addToErrorNotesAlertShow: 0,
      addToErrorNotesFlag: 1,
      collectFlag: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var questionItems = [];
    var CurrentPagesSrc = getCurrentPages()
    

    db.collection('questions').get().then(res => {
      
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
      
    }).then(() => {
      var currentData = this.data.questionItems[this.data.currentQuestionCount]
      this.isCollected(currentData)
    })
    // 自动添加错题本
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

  //获取收藏信息
  isCollected: function(data) {
    db.collection('collection').where({
      _openid: openId,
      _id: data._id
    }).get()
    .then(res => {
      if (res.data[0]) {
        this.setData({
          collectFlag: 1
        })
      } else {
        this.setData({
          collectFlag: 0
        })
      }
    })
  },

  /**
   * 用户点击答案事件的处理函数
   */
  onAnswerTap: function (e) {
    
    var clickAnswerNumber = e.currentTarget.id.slice(-1);
    
    if (this.data.answerFlag[clickAnswerNumber] == 1 && !this.data.clickFlag && this.data.questionType == 0 ) {
      var answerNumber = this.data.questionItem.answer[0]
      if (clickAnswerNumber == answerNumber){
        
        this.setData({
          ["answerFlag["+ clickAnswerNumber +"]"]: 2,
          clickFlag: 1,          
        })
       
        if (this.data.currentQuestionCount+1) {
          this.changePageData(++this.data.currentQuestionCount,800) // 下一页
          var currentData = this.data.questionItems[this.data.currentQuestionCount]
          this.isCollected(currentData) 
        }
        
      }else {
        this.setData({
          ["answerFlag[" + clickAnswerNumber + "]"]: 0,
          clickFlag: 1
        })
        this.setData({
          ["answerFlag[" + answerNumber + "]"]: 2
        })
        
        console.log(this.data.autoAddErrorBook)
        // 加入错题本
        if (this.data.autoAddErrorBook) {
          this.addToErrorNotes(this.data.questionItems[this.data.currentQuestionCount])
        }
        
  
      }
    } else if ((this.data.answerFlag[clickAnswerNumber] == 1 || this.data.answerFlag[clickAnswerNumber] == 3) &&!this.data.clickFlag && this.data.questionType == 1 && !this.data.subFlag){    //多选题选择
      if (this.data.answerFlag[clickAnswerNumber] == 1) {
        this.setData({
          ["answerFlag[" + clickAnswerNumber + "]"]: 3
        })
      }else {
        this.setData({
          ["answerFlag[" + clickAnswerNumber + "]"]: 1
        })
      }
      
    }
  },
  changePageData: function (currentQuestionCount,delay) {
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
    }, delay)
  },

  lastQ: function(e) {
    if (this.data.currentQuestionCount - 1 >= 0) {
      this.changePageData(--this.data.currentQuestionCount, 10) // 上一页 
      var currentData = this.data.questionItems[this.data.currentQuestionCount] 
      this.isCollected(currentData)
    }   
  },
  nextQ: function(e) {
    if (this.data.currentQuestionCount + 1 < this.data.questionCount) {
      this.changePageData(++this.data.currentQuestionCount,10) // 下一页
      var currentData = this.data.questionItems[this.data.currentQuestionCount]
      this.isCollected(currentData)
    }
  },
  onSubmit: function(e) {
    
    var flag = 0 //没选0,对了1,错了2
    var ansArr = []
    var selectedAnsArr = []
    for(var i = 0; i < 3; i++) {
      if (this.data.answerFlag[i] == 3) {
        selectedAnsArr.push(i)
        this.setData({
          subFlag: 1
        })
        for (var j = 0; j < this.data.questionItem.answer.length; j++) {
          if (this.data.questionItem.answer[j] == i) {
            ansArr.push(i)
          } 
        }
      }else {
        flag = 0
      }
    }
    if (ansArr.toString() == this.data.questionItem.answer.toString()){
      flag = 1
    } else if (selectedAnsArr.length){
      flag = 2
    } else {
      flag = 0
    }
      
    if (flag == 1){
      for (var k = 0; k < this.data.questionItem.answer.length; k++) {
        this.setData({
          ["answerFlag[" + this.data.questionItem.answer[k] + "]"]: 2
        })        
      }
      if (this.data.currentQuestionCount + 1 < this.data.questionCount) {
        this.changePageData(++this.data.currentQuestionCount, 800) // 下一页 
        var currentData = this.data.questionItems[this.data.currentQuestionCount]
        this.isCollected(currentData) 
      }
    } else if (flag == 2) {
      for (var k = 0; k < 4; k++) {        
        if (this.data.answerFlag[k] == 3) {
          this.setData({
            ["answerFlag[" + k + "]"]: 0
          }) 
        }
      }
      for (var k = 0; k < this.data.questionItem.answer.length; k++) {
        this.setData({
          ["answerFlag[" + this.data.questionItem.answer[k] + "]"]: 2
        })
      }
      console.log(this.data.autoAddErrorBook)
      if (app.globalData.autoAddErrorBook) {
        this.addToErrorNotes(this.data.questionItems[this.data.currentQuestionCount])
      }
    }

    
  },
  //加入错题本
  addToErrorNotes: function(data) {
    db.collection('errorNotes').add({
      data: {
        _id: data._id,
        question: data.question,
        answer: data.answer,
        item1: data.item1,
        item2: data.item2,
        item3: data.item3,
        item4: data.item4,
        questionType: data.questionType
      }
    })
    .then(res => {
        
      wx.showToast({
        title: '已加入错题本',
        icon: 'success',
        duration: 1500
      })         
    })
    .catch(err => {
      console.log(err)
      wx.showToast({
        title: '添加失败或已存在',
        icon: 'success',
        duration: 1500
      })
    })
  },
  onErrorMaskTap: function(e) {
    this.setData({
      addToErrorNotesAlertShow: 0
    })
  },
  //收藏
  onCollect: function(e) {
    var data = this.data.questionItems[this.data.currentQuestionCount]
    
    const _ = db.command
    const openId = app.globalData.openId

    // 加入数据库
    if (!this.data.collectFlag){
      db.collection('collection').add({
        data: {
          _id: data._id,
          question: data.question,
          answer: data.answer,
          item1: data.item1,
          item2: data.item2,
          item3: data.item3,
          item4: data.item4,
          questionType: data.questionType
        }
      })
      .then(res => {
        this.setData({
          collectFlag: 1
        })
        wx.showToast({
          title: '已收藏',
          icon: 'success',
          duration: 1500
        })
      })
      .catch(err => {
        wx.showToast({
          title: '收藏失败',
          icon: 'success',
          duration: 1500
        })
      })
    }else{
      this.removeCollect(data)
      this.setData({
        collectFlag: 0
      })
      wx.showToast({
        title: '已移除',
        icon: 'success',
        duration: 1500
      });
    }
   
  },
  removeCollect: function(data) {
    db.collection('collection').doc(data._id)
    .remove()
    .then(res => {
      console.log("删除成功")
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})
// touchstart: function(e) {
  //   touchDot = e.touches[0].pageX 
  //   interval = setInterval(function () {
  //     time++;
  //   }, 100) // 使用js计时器记录时间 
  //   console.log(e.touches[0].pageX)
  // },
  // touchend: function (e) {
  //   var touchMove = e.changedTouches[0].pageX
  //   // 向左滑动   
  //   if (touchMove - touchDot <= -40 && time < 10) {

  //     //执行切换页面的方法
  //     if (this.data.currentQuestionCount + 1 < this.data.questionCount) {
  //       this.changePageData(++this.data.currentQuestionCount,10) // 下一页
  //       this.setData({
  //         scrollLeft: 0
  //       })
  //     }
  //   }
  //   // 向右滑动   
  //   if (touchMove - touchDot >= 40 && time < 10) {
  //     //执行切换页面的方法
  //     if (this.data.currentQuestionCount-1 >= 0) {
  //       this.changePageData(--this.data.currentQuestionCount, 10) // 上一页
  //       this.setData({
  //         scrollLeft: 0
  //       })
  //     }      
  //   }
  //   clearInterval(interval) // 清除setInterval
  //   time = 0

  // },
  // onTouchmove: function(e) {
  //   var touchMove = e.changedTouches[0].pageX
  //   this.setData({
  //     scrollLeft: (touchMove - touchDot) + "px"
  //   })
  //   console.log(e.changedTouches[0].pageX)
  // }