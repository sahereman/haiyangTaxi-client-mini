// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderListArray:[],
    ongoing:false,
    cancelOrder: false,
    completedlOrder: false

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
    var that = this;
    that.data.orderListArray.push({
      "type": 1,
      "plateNumber": "鲁UT1138",
      "starPoint": "延吉路万达广场",
      "endPoint": "青岛火车站"
    },
      {
        "type": 2,
        "plateNumber": "鲁UT1131",
        "taxiTime": "10月6号 09:44",
        "starPoint": "延吉路万达广场",
        "endPoint": "青岛火车站"
      },
      {
        "type": 2,
        "plateNumber": "鲁UT1132",
        "taxiTime": "10月6号 09:44",
        "starPoint": "延吉路万达广场",
        "endPoint": "青岛火车站"
      },
      {
        "type": 3,
        "plateNumber": "鲁UT1133",
        "taxiTime": "10月6号 09:44",
        "starPoint": "延吉路万达广场",
        "endPoint": "青岛火车站"
      },
      {
        "type": 3,
        "plateNumber": "鲁UT1134",
        "taxiTime": "10月6号 09:44",
        "starPoint": "延吉路万达广场",
        "endPoint": "青岛火车站"
      });
      that.setData({
        orderListArray: that.data.orderListArray
      });
    var typeArr = [];
    for (var i = 0; i < that.data.orderListArray.length;i++){
      var itemType = that.data.orderListArray[i].type;
      typeArr.push(itemType);
      }
    if (typeArr.indexOf(1) != -1){
        that.setData({
          ongoing:true   
        });
    }
    if (typeArr.indexOf(2) != -1){
      that.setData({
        cancelOrder: true
      });
    } 
    if (typeArr.indexOf(3) != -1){
      that.setData({
        completedlOrder: true
      });  
    }
    
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
  
})