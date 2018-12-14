// pages/destination/destination.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartNum:"",
    bill:""
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
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("123", res);
      //socket发送数据
      // that.sendRefreshPosition();
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      console.log("socket接收数据", JSON.parse(res.data));
      //如果司机已到达，跳转行程结束页面
      if (JSON.parse(res.data).action == "reach" && JSON.parse(res.data).status_code == 200) {
        wx.redirectTo({
          url: '../end-trip/end-trip',
        })
      }
      //如果司机已取消订单，跳转行程取消页面
      if (JSON.parse(res.data).action == "driverCancel" && JSON.parse(res.data).status_code == 200) {
        var cancelReasons = JSON.parse(res.data).data.order.close_reason;
        wx.redirectTo({
          url: '../trip-cancelled/trip-cancelled?cancelReasons=' + cancelReasons,
        })
      }
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
  bindPhone:function(){
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("driver").phone,
    })
  }
})