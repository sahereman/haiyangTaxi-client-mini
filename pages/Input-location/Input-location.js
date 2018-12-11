// pages/Input-location/Input-location.js
var app = getApp();
var qmapKey = app.globalData.qmapKey;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nearAdsArr: []

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
    var nearAdsArr = wx.getStorageSync("nearPoisArr");
    that.setData({
      nearAdsArr: nearAdsArr,
    });
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("456", res);
      //socket发送数据
      // that.oppen()
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      console.log("vvcccc", res);
      // that.aa();
    })
    that.oppen()
  },
  oppen: function (lat, lng) {
    var that = this;
    //连接成功
    var data = {
      "action": "beat"
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
  cancel: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  choiceLocation: function (e) {
    var choiceLocation = e.currentTarget.id.split(":");
    var title = choiceLocation[0];
    var lat = choiceLocation[1];
    var lng = choiceLocation[2];
    //把选择的上车经纬度和地点名称存到storage里，作为实时更新的上车数据
    wx.setStorageSync("fromLat", lat);
    wx.setStorageSync("fromLng", lng);
    wx.setStorageSync("fromAddress", title);
    wx.redirectTo({
      url: '../index/index?from=startLocation',
    })
  },
  //地方模糊搜索
  getAddress: function (keyword) {
    var that = this;
    var city = wx.getStorageSync("city");
    var qqParme = { "keyword": encodeURI(keyword), "boundary": "region(" + city + ",0)", "orderby": "_distance", "page_size": 10, "key": qmapKey };
    app.ajaxRequest("get", "https://apis.map.qq.com/ws/place/v1/search", qqParme, function (res) {
      console.log("https://apis.map.qq.com/ws/place/v1/search接口请求成功", res);
      if (res != null && res.data != null & res.data.data != undefined) {
        var fuzzySearchArr = res.data.data;
        that.setData({
          nearAdsArr: fuzzySearchArr
        });
      }
    }, function (res) {
      console.log("https://apis.map.qq.com/ws/place/v1/search接口请求失败", res)
    });
  },
  valueChange: function (e) {
    var that = this;
    var localValue = e.detail.value;
    that.getAddress(localValue);
  }

})