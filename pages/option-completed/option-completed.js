//index.js
//获取应用实例
var start_clientX;
var end_clientX;
const app = getApp()
const util = require("../../utils/util.js")
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var qmapKey = app.globalData.qmapKey;
var interfaceUrl = app.globalData.interfaceUrl;
//定义全局变量
var wxMarkerData = [];
var bottomHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
var mapId = 'Map';
Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    user_name: "",
    user_head: "",
    latitude: "",
    longitude: "",
    markers: [],
    includePoints:[],
    chooseDestination: "",
    chooseNewLocal: false,
    //地图高度
    mapHeight: 0,
    //中心点的经纬度
    centerLongitude: '',
    centerLatitude: '',
    //选择的上车地点
    nowLocation: "获取位置中...",
    //最终选择的上车地点经纬度
    selectLocationLat: "",
    selectLocationLng: "",
    //选择地址后回调的实体类
    // callbackAddressInfo: null,
    userSelectedPosition: false,
    isGo: false,
    defaultScale:16,
    publish:false
  },
  onLoad: function (options) {
    var that = this;
    // toast组件实例
    new app.ToastPannel();
    qqmapsdk = new QQMapWX({
      key: qmapKey
    });
    //接收目的地传过来的value值
    if (options != "" && options.from == "endLocation") {
      wx.getStorage({
        key: 'fromLatLng',
        success(res) {
          console.log(res.data.lat + "===" + res.data.lng + "===" + wx.getStorageSync("fromAddress")); 
          console.log(wx.getStorageSync("toLat") + "===" + wx.getStorageSync("toLng") + "===" + wx.getStorageSync("toAddress")); 
          //显示起点和终点
          that.setData({
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
              id: 1,
              latitude: wx.getStorageSync("toLat"),
              longitude: wx.getStorageSync("toLng"),
              title: wx.getStorageSync("toAddress"),
              iconPath: '/images/icon_End.png',
              width: 24,
              height: 44,
              label: {
                content: wx.getStorageSync("toAddress"),
                display: 'ALWAYS',
                textAlign: 'right'
              }
            }],
          });
        }
      }) 
    }


    // that.setData({
    //   centerLatitude: that.data.latitude,
    //   centerLongitude: that.data.longitude
    // })


    //获取用户信息
    that.getuserInfo(that);
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext('Map'); // Map为地图的id
    this.includePointsFn();
  },
  // 定义一个 includePointsFn 方法, 参数为需要显示的坐标点(可多个)
  includePointsFn: function () {
    var that = this;
    wx.getStorage({
      key: 'fromLatLng',
      success(res) {
        // 缩放视野展示所有经纬度(小程序API提供)
        that.mapCtx.includePoints({
          padding: [80, 50, 80, 50],
          points: [{
            latitude: res.data.lat,
            longitude: res.data.lng,
          }, {
            latitude: wx.getStorageSync("toLat"),
            longitude: wx.getStorageSync("toLng"),
          }]
        })
      }
    })
    
  },
  onShow: function () {
    var that = this;
    //socket接收数据
    wx.onSocketMessage(function (res) {
      if (JSON.parse(res.data).action == "publish" && JSON.parse(res.data).status_code == 200){
        wx.redirectTo({
          url: '../calling-taxis/calling-taxis',
        })
        wx.setStorageSync("order_key", JSON.parse(res.data).data.order_key);
      } else if (JSON.parse(res.data).action == "publish" && JSON.parse(res.data).status_code == 429){
        wx.showToast({
          title: '网络繁忙，请重试',
          icon: 'loading',
          duration: 2000,
          mask: true
        })
      } else if (JSON.parse(res.data).action == "publish" && JSON.parse(res.data).status_code == 422){
        wx.showToast({
          title: '呼叫失败',
          icon: 'loading',
          duration: 2000,
          mask: true
        })
      }
    })
  },
  oppen: function () {
    var that = this;
    wx.getStorage({
      key: 'fromLatLng',
      success(res) {
        var from_address = wx.getStorageSync("fromAddress");
        var to_address = wx.getStorageSync("toAddress");
        var fromLat = res.data.lat;
        var fromLng = res.data.lng;
        var toLat = wx.getStorageSync("toLat");
        var toLng = wx.getStorageSync("toLng");
        //连接成功
        var data = {
          "action": "publish",
          "data": {
            "from_address": from_address,
            "from_location": {
              "lat": fromLat,
              "lng": fromLng
            },
            "to_address": to_address,
            "to_location": {
              "lat": toLat,
              "lng": toLng
            }
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
  },
  /**
   * 回到定位点
   */
  selfLocationClick: function () {
    var that = this;
    wx.getStorage({
      key: 'fromLatLng',
      success(res) {
        //显示起点和终点
        that.setData({
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
            id: 1,
            latitude: wx.getStorageSync("toLat"),
            longitude: wx.getStorageSync("toLng"),
            title: wx.getStorageSync("toAddress"),
            iconPath: '/images/icon_End.png',
            width: 24,
            height: 44,
            label: {
              content: wx.getStorageSync("toAddress"),
              display: 'ALWAYS',
              textAlign: 'right'
            }
          }],
        });
        that.includePointsFn();
      }
    })
  },
  bindSlide: function () {
    var that = this;
    wx.navigateTo({
      url: '../user/user',
    })
  },
  bindInputLocation: function () {
    var token = wx.getStorageSync("token");
    if (token != "") {
      wx.redirectTo({
        url: '../Input-location/Input-location',
      })
    } else {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }

  },
  bindInputEnter: function () {
    var token = wx.getStorageSync("token");
    if (token != "") {
      wx.redirectTo({
        url: '../Input-destination/Input-destination',
      })
    } else {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
  },
  //点击我的行程
  bindOrder: function () {
    var token = wx.getStorageSync("token");
    if (token) {
      wx.navigateTo({
        url: '../order/order',
      })
    } else {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
  },
  //获取用户信息
  getuserInfo: function (that) {
    var token = wx.getStorageSync("token");
    if (token && token != undefined) {
      app.ajaxRequest("get", interfaceUrl + "users/me", {}, function (res) {
        console.log('users/me接口请求成功', res);
        var phone = res.data.phone;
        var mphone = phone.substr(3, 4);
        var user_name = phone.replace(mphone, "****");
        var user_head = res.data.avatar_url
        that.setData({
          user_name: user_name,
          user_head: user_head
        });
      }, function (res) {
        console.log('users/me接口请求失败', res);
        if (res.data.message == "Token has expired" && res.data.status_code == 401) {
          console.log("token过期");
          app.checkExpires(function (res) {
            getuserInfo(that);
          });
        }
      });
    }
  },
  //呼叫出租车
  callTaxi: function () {
    var that = this;
    //remove掉选择了上车地点的标识
    wx.removeStorageSync("selectAds");
    //publish 发起打车订单寻找车辆，发送成功才能跳转
    that.oppen();    
  },
  //返回首页
  backHome:function(){
    wx.redirectTo({
      url: '../index/index?isScoket=true',
    })
  }
})