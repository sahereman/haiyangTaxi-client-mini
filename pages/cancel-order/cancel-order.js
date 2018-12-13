// pages/cancel-order/cancel-order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    radioValue:""
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
  radioChange:function(e){
    var that = this;
    that.setData({
      radioValue: e.detail.value
    });
  },
  subReason:function(){
    var that = this;
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("456", res);
      //socket发送数据
      that.submitReason()
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      console.log("vvcccc", res);
      var data = JSON.parse(res.data);
      if (data.action == "userCancel" && data.status_code == 200) {
        wx.redirectTo({
          url: '../index/index',
        })
      }
    })
    that.submitReason()
    //删除存储的order_id
    // wx.removeStorageSync("order_id");
    // wx.removeStorageSync("driver");
  },
  submitReason:function(){
    var that =this;
    //连接成功
    console.log(wx.getStorageSync("order_key"));
    var data = {
      "action": "userCancel",
      "data": {
        "close_reason": that.data.radioValue,
        "order_id": wx.getStorageSync("order_id")
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
  }
})