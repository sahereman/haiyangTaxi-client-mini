// pages/user/user.js
var app =getApp();
var interfaceUrl = app.globalData.interfaceUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_name: "",
    user_head: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this;
    //获取用户信息
    that.getuserInfo(that);
  },
  //获取用户信息
  getuserInfo: function (that) {
    var token = wx.getStorageSync("token");
    if (token && token != undefined) {
      app.ajaxRequest("get", interfaceUrl + "users/me", {}, function (res) {
        console.log('users/me接口请求成功', res);
        var phone = res.data.phone;
        var mphone = phone.substr(3, 4);
        var user_name = phone.replace(mphone, "****");
        var user_head = res.data.avatar_url
        that.setData({
          user_name: user_name,
          user_head: user_head
        });
      }, function (res) {
        console.log('users/me接口请求失败', res);
        if (res.data.message == "Token has expired" && res.data.status_code == 401) {
          console.log("token过期");
          app.checkExpires(function (res) {
            getuserInfo(that);
          });
        }
      });
    }
  },
  //点击我的行程
  bindOrder: function () {
    var token = wx.getStorageSync("token");
    if (token) {
      wx.navigateTo({
        url: '../order/order',
      })
    } else {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
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