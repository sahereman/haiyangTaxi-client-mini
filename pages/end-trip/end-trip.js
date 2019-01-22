// pages/end-trip/end-trip.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartNum: "",
    bill: ""
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
    that.setData({
      cartNum: wx.getStorageSync("driver").cart_number,
      bill: wx.getStorageSync("driver").order_count
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

  },
  bindPhone:function(){
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("driver").phone,
    })
  },
  backHome:function(){
    wx.redirectTo({
      url: '../index/index?isScoket=true',
    })
  }
})