// pages/set/set.js
var app = getApp();
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
    wx.onSocketMessage(function (res) {
      console.log("接收断开连接返回数据", res);
    })
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

  },
  popModal: function () {
    var token = wx.getStorageSync("token");
    if (token != ""){
      wx.showModal({
        title: '确定退出吗？',
        // content: '确定退出吗？',
        confirmColor: '#fe955c',
        success(res) {
          if (res.confirm) {
            //断开连接
            var data = {
              action: "close"
            }
            //发送数据
            wx.sendSocketMessage({
              data: JSON.stringify(data),
              success: function (res) {
                console.log("断开连接发送成功", res)
              },
              fail: function (res) {
                console.log("断开连接发送失败", res)
              }
            });
            //调用删除授权token接口
            app.ajaxRequest("delete",interfaceUrl + "authorizations", {}, function (res) { 
              console.log('delete接口请求成功', res);
            }, function (res) { 
              console.log('delete接口请求失败', res);
            });
            //删除token本地存储和有效期
            wx.removeStorageSync("token");
            wx.removeStorageSync("expiresIn");
            
            wx.redirectTo({
              url: '../index/index?closeStcoket=true',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
    }
  }
})