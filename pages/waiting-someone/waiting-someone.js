// pages/waiting-someone/waiting-someone.js
var app = getApp();
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qmapKey = app.globalData.qmapKey;
var pTimer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartNum: "",
    bill: "",
    latitude: "",
    longitude: "",
    distance:"",
    markers: [],
    polyline: [],
    lineLocation:[],
    isDistance:true
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.removeStorageSync("driverNow");
    wx.removeStorageSync("distanceNow");
    var driver = wx.getStorageSync("driver");
    wx.getStorage({
      key: 'fromLatLng',
      success(res) {
        that.setData({
          cartNum: driver.cart_number,
          bill: driver.order_count,
          distance: (driver.distance / 1000).toFixed(1),
          markers: [{
            id: 0,
            latitude: res.data.lat,
            longitude: res.data.lng,
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
            latitude: driver.lat,
            longitude: driver.lng,
            iconPath: '/images/icon_littleyellowcar.png',
            width: 16,
            height: 31,
            rotate: Number(driver.angle)
          }],
        });
        that.mapCtx = wx.createMapContext('myMaps'); // myMap为地图的id
        that.mapCtx.includePoints({
          padding: [70, 40, 70, 40],
          points: [{
            latitude: res.data.lat,
            longitude: res.data.lng,
          }, {
            latitude: driver.lat,
            longitude: driver.lng,
          }]
        })
      }
    })
    //小车距离起点的路线规划
    that.drivingPlan(driver); 
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("123", res);
    })
    that.sendRefreshPosition();
    //socket接收数据
    wx.onSocketMessage(function (res) {
      if (JSON.parse(res.data).action == "meetRefresh" && JSON.parse(res.data).status_code == 200){
        that.onRefreshPosition(res);
      }
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
    //5秒钟发送一次请求司机位置信息
    that.cartPositionTimer();
  },

  //小车距离起点的路线规划
  drivingPlan: function (driver){
    var that = this;
    wx.getStorage({
      key: 'fromLatLng',
      success(res) {
        var qqParme = { "from": driver.lat + "," + driver.lng, "to": res.data.lat + "," + res.data.lng, "heading": 0, "key": qmapKey };
        app.ajaxRequest("get", "https://apis.map.qq.com/ws/direction/v1/driving", qqParme, function (res) {
          if (res != null && res.data != null & res.data.result != undefined) {
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
            that.setData({
              polyline: [{
                points: b,
                color: "#6cc18a",
                width: 6,
                dottedLine: false,
                arrowLine: true
              }],
              lineLocation: b
            })
            that.mapCtx = wx.createMapContext('myMaps'); // myMap为地图的id
            that.mapCtx.includePoints({
              padding: [70, 40, 70, 40],
              points: that.data.lineLocation
            })
          }
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
        // console.log("sendSocketMessage 成功", res)
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
    var driver = JSON.parse(data.data).data;
    //将刷新车辆位置信息数据存储起来，用于指定路线的实时更新
    var driverNow = wx.setStorageSync("driverNow", driver);
    if (driver != undefined){
      wx.getStorage({
        key: 'fromLatLng',
        success(res) {
          that.setData({
            distance: (driver.driver.distance / 1000).toFixed(1),
            markers: [{
              id: 0,
              latitude: res.data.lat,
              longitude: res.data.lng,
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
              latitude: driver.driver.lat,
              longitude: driver.driver.lng,
              iconPath: '/images/icon_littleyellowcar.png',
              width: 16,
              height: 31,
              rotate: Number(driver.driver.angle)
            }],
          });
        }
      })  
    }
    var distance = driver.driver.distance;
    if (that.data.isDistance) {
      wx.setStorageSync("distanceNow", distance);
      that.setData({
        isDistance: false
      });
    }
    if (parseInt(wx.getStorageSync("distanceNow")) - parseInt(distance)  > 10) {
      //重新改变路线
      that.drivingPlan(driver.driver);
      wx.setStorageSync("distanceNow", distance);
      that.setData({
        isDistance: true
      });
      console.log("重新改变路线");
    }
  },
  //5秒钟刷新一次车辆位置
  cartPositionTimer:function(){
    var that = this;
    pTimer = setInterval(function(){
       //重新发送数据
       that.sendRefreshPosition();
     },5000);
  },  
  cancelOrder:function(){
    wx.redirectTo({
      url: '../cancel-order/cancel-order',
    })
    clearInterval(pTimer);
    wx.removeStorageSync("driverNow");
    wx.removeStorageSync("distanceNow");
  },
  //拨打电话
  calling:function(){
    wx.makePhoneCall({
      phoneNumber: wx.getStorageSync("driver").phone,
    })
  }
})