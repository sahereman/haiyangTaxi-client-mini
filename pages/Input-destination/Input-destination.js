// pages/Input-location/Input-location.js
var app = getApp();
var qmapKey = app.globalData.qmapKey;
var interfaceUrl = app.globalData.interfaceUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    localHistoryArr: [],
    hotLocalArr:[]
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
    var localHistory = wx.getStorageSync("localHistoryArr");
    that.setData({
      localHistoryArr: localHistory
    });
    //获取城市热门地点列表
    var city = wx.getStorageSync("city");
    app.ajaxRequest("get",interfaceUrl +"city_hot_addresses",{"city":city},function(res){
      console.log("city_hot_addresses接口请求成功:",res);
      var hotLocalArr = res.data.city_hot_addresses;
      for (var i = 0; i < hotLocalArr.length;i++){
        that.data.hotLocalArr.push({ "to_address": hotLocalArr[i].address, "address": hotLocalArr[i].address_component});
      }
     that.setData({
       hotLocalArr: that.data.hotLocalArr
     });
    },function(res){
      console.log("city_hot_addresses接口请求失败:" , res);
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
  bindGoCart:function(e){
    var chooseDestination = e.currentTarget.id;
    wx.redirectTo({
      url: '../index/index?isGo=true&chooseDestination=' + chooseDestination,
    })
  },
  //地方模糊搜索
  getAddress: function (keyword) {
    var that = this;
    var city = wx.getStorageSync("city");
    var qqParme = { "keyword": encodeURI(keyword), "boundary": "region(" + city + ",0)", "orderby": "_distance", "page_size": 10, "key": qmapKey };
    app.ajaxRequest("get","https://apis.map.qq.com/ws/place/v1/search", qqParme, function (res) {
      console.log("https://apis.map.qq.com/ws/place/v1/search接口请求成功", res);
      if (res!=null&&res.data!=null&res.data.data!=undefined){
        var fuzzySearchArr = res.data.data;
        that.setData({
          localHistoryArr: [],
          hotLocalArr: []
        });
        for (var i = 0; i < fuzzySearchArr.length; i++) {
          that.data.hotLocalArr.push({ "to_address": fuzzySearchArr[i].title, "address": fuzzySearchArr[i].address });
        }
        that.setData({
          hotLocalArr: that.data.hotLocalArr
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