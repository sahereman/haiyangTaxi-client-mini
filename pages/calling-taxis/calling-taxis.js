// pages/calling-taxis/calling-taxis.js
var time;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:"请耐心等候...",
    lookingTaxis:false
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
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("456", res);
      //socket发送数据
      // that.oppen()
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      that.searchTaxis(res.data);
    })
    // that.oppen()
  },
  // oppen: function () {
  //   var that = this;
  //   var from_address = wx.getStorageSync("fromAddress");
  //   var to_address = wx.getStorageSync("toAddress");
  //   var fromLat = wx.getStorageSync("fromLat");
  //   var fromLng = wx.getStorageSync("fromLng");
  //   var toLat = wx.getStorageSync("toLat");
  //   var toLng = wx.getStorageSync("toLng");
  //   //连接成功
  //   var data = {
  //     "action": "publish",
  //     "data": {
  //       "from_address": from_address,
  //       "from_location": {
  //         "lat": fromLat,
  //         "lng": fromLng
  //       },
  //       "to_address": to_address,
  //       "to_location": {
  //         "lat": toLat,
  //         "lng": toLng
  //       }
  //     }
  //   }
  //   //发送数据
  //   wx.sendSocketMessage({
  //     data: JSON.stringify(data),
  //     success: function (res) {
  //       console.log("sendSocketMessage 成功1", res)
  //     },
  //     fail: function (res) {
  //       console.log("sendSocketMessage 失败2", res)
  //     }
  //   });
  // },
  //寻找出租车
  searchTaxis:function(data){
    var that = this;
    var data = JSON.parse(data);
    console.log("正在寻找车辆中", data);
    
    if (data.action == "meet"){
      //车辆已接单，正在赶来，将赶来的车辆信息记录下来，用于下一页面的展示
      wx.setStorageSync("driver", data.data.driver);
      //将赶来车辆的订单号记录下来，用于下一页面取消叫车的发送参数
      wx.setStorageSync("order_id", data.data.order.id);
      wx.redirectTo({
        url: '../waiting-someone/waiting-someone',
      })
      clearInterval(time);
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

  },
  cancelTaxi:function(){
    var that = this;
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("456", res);
      //socket发送数据
      that.oppena()
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      console.log("vvcccc", res);
      var data = JSON.parse(res.data);
      if (data.action == "withdraw" && data.status_code == 200){
        clearInterval(time);
         wx.redirectTo({
           url: '../index/index?isScoket=true',
         }) 
        
      }
    })
    that.oppena()
  },
   oppena: function () {
    var that = this;
    //连接成功
     console.log(wx.getStorageSync("order_key"));
     var data = {
       "action": "withdraw",
       "data": {
         "order_key": wx.getStorageSync("order_key")
       }
     }
    //发送数据
    wx.sendSocketMessage({
      data: JSON.stringify(data),
      success: function (res) {
        console.log("sendSocketMessage 成功1", res)
      },
      fail: function (res) {
        console.log("sendSocketMessage 失败2", res)
      }
    });
  },
})