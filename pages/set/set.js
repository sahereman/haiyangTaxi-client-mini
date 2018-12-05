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
            console.log('用户点击确定')
            //调用删除授权token接口
            app.ajaxRequest("delete",interfaceUrl + "authorizations", {}, function (res) { 
              console.log('authorizations接口请求成功', res);
            }, function (res) { 
              console.log('authorizations接口请求失败', res);
            });
            //删除token本地存储
            wx.removeStorageSync("token");
            wx.redirectTo({
              url: '../index/index',
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