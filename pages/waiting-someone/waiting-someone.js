// pages/waiting-someone/waiting-someone.js
var app = getApp();
var qmapKey = app.globalData.qmapKey;
var pTimer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartNum: "",
    bill: "",
    latitude: 36.091613,
    longitude: 120.37479,
    distance:"",
    markers: [],
    polyline: [],
    includePoints:[]
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
    var driver = wx.getStorageSync("driver");
    that.setData({
      cartNum: driver.cart_number,
      bill: driver.order_count,
      distance: driver.distance/1000,
      markers: [{
        id: 0,
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
        title: wx.getStorageSync("fromAddress"),
        iconPath: '/images/icon_Startingpoint.png',
        width: 24,
        height: 44,
        label: {
          content: wx.getStorageSync("fromAddress"),
          display: 'ALWAYS',
          textAlign: 'right'
        }
      },
      {
        id: 2,
        latitude: driver.location.lat,
        longitude: driver.location.lng,
        iconPath: '/images/icon_littleyellowcar.png',
        width: 31,
        height: 16,
        rotate: 0
      }],
      includePoints:[{
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
      },{
          latitude: driver.location.lat,
          longitude: driver.location.lng,
      }]
    });
    //小车距离起点的路线规划
    that.drivingPlan();  
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("123", res);
    })
    that.sendRefreshPosition();
    //socket接收数据
    wx.onSocketMessage(function (res) {
      that.onRefreshPosition(res);
      //如果司机已到达，关闭定时器，跳转已上车页面
      if (JSON.parse(res.data).action == "received" && JSON.parse(res.data).status_code == 200){
          wx.redirectTo({
            url: '../destination/destination',
          })
        clearInterval(pTimer);
      }
      //如果司机已取消订单，关闭定时器，跳转行程取消页面
      if (JSON.parse(res.data).action == "driverCancel" && JSON.parse(res.data).status_code == 200){
        var cancelReasons = JSON.parse(res.data).data.order.close_reason;
        wx.redirectTo({
          url: '../trip-cancelled/trip-cancelled?cancelReasons=' + cancelReasons,
        })
        clearInterval(pTimer);
      }
    })
    //刷新小车移动位置
    that.cartPositionTimer();
  },

  //小车距离起点的路线规划
  drivingPlan:function(){
    var that = this;
    var driver = wx.getStorageSync("driver");
    var qqParme = { "from": driver.location.lat + "," + driver.location.lng, "to": wx.getStorageSync("fromLat") + "," + wx.getStorageSync("fromLng"), "heading": 0, "key": qmapKey };
    app.ajaxRequest("get", "https://apis.map.qq.com/ws/direction/v1/driving", qqParme, function (res) {
      if (res != null && res.data != null & res.data.result != undefined){
        var coors = res.data.result.routes[0].polyline
        for (var i = 2; i < coors.length; i++) {
          coors[i] = coors[i - 2] + coors[i] / 1000000
        }
        //划线
        var b = [];
        for (var i = 0; i < coors.length; i = i + 2) {
          b[i / 2] = {
            latitude: coors[i], longitude: coors[i + 1]
          };
        }
        // console.log(b);
        that.setData({
          polyline: [{
            points: b,
            color: "#6cc18a",
            width: 6,
            dottedLine: false
          }],
        })
      } 
    })
  },
  //发送刷新车辆正在来的位置数据
  sendRefreshPosition:function(){
    var that = this;
    //连接成功
    var data = {
      "action": "meetRefresh",
      "data": {
        "order_id": wx.getStorageSync("order_id")
      }
    }
    //发送数据
    wx.sendSocketMessage({
      data: JSON.stringify(data),
      success: function (res) {
        console.log("sendSocketMessage 成功", res)
      },
      fail: function (res) {
        console.log("sendSocketMessage 失败", res)
        that.setData({
          sendSocketMessage: false
        });
      }
    });
  },
  //得到刷新车辆正在来的位置数据
  onRefreshPosition:function(data){
    var that = this;
    var driver = JSON.parse(data.data).data.driver;
    console.log("driver", JSON.parse(data.data));
    if (driver != undefined){
      that.setData({
        distance: driver.distance / 1000,
        markers: [{
          id: 0,
          latitude: wx.getStorageSync("fromLat"),
          longitude: wx.getStorageSync("fromLng"),
          title: wx.getStorageSync("fromAddress"),
          iconPath: '/images/icon_Startingpoint.png',
          width: 24,
          height: 44,
          label: {
            content: wx.getStorageSync("fromAddress"),
            display: 'ALWAYS',
            textAlign: 'right'
          }
        },
        {
          id: 2,
          latitude: driver.location.lat,
          longitude: driver.location.lng,
          iconPath: '/images/icon_littleyellowcar.png',
          width: 31,
          height: 16,
          rotate: 0
        }],
        includePoints: [{
          latitude: wx.getStorageSync("fromLat"),
          longitude: wx.getStorageSync("fromLng"),
        }, {
          latitude: driver.location.lat,
          longitude: driver.location.lng,
        }]
      });
    }
  },
  //5秒钟刷新一次车辆位置
  cartPositionTimer:function(){
    var that = this;
    pTimer = setInterval(function(){
       //重新发送数据
       that.sendRefreshPosition();
       //重新改变路线
       that.drivingPlan();
     },5000);
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
  cancelOrder:function(){
    wx.navigateTo({
      url: '../cancel-order/cancel-order',
    })
    clearInterval(pTimer);
  },
  //拨打电话
  calling:function(){
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("driver").phone,
    })
  }
})