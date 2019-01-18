// pages/gift-events/gift-events.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var interfaceUrl = app.globalData.interfaceUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getGift(that);
  },
  //关于礼物接口
  getGift: function (that) {
    app.ajaxRequest("get", interfaceUrl + "articles/event", {}, function (res) {
      if (res != null && res.data != null) {
        var article = res.data.content;
        WxParse.wxParse('article', 'html', article, that, 5);
      }
    },function(res){
      console.log('articles/about接口请求失败', res);
      if (res.data.message == "Token has expired" && res.data.status_code == 401) {
        console.log("token过期");
        app.checkExpires(function (res) {
          getGift(that);
        });
      }
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

  }
})