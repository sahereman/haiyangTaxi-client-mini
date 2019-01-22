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
var mapId = 'myMap';
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
    defaultScale:10
  },
  onLoad: function (options) {
    console.log("options", options);
    var that = this;
    // toast组件实例
    new app.ToastPannel();
    qqmapsdk = new QQMapWX({
      key: qmapKey
    });
    //接收上车地点传过来的value值
    if (options != "" && options.from == "startLocation") {
      that.setData({
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
        userSelectedPosition: true
      });
    }
    //接收目的地传过来的value值
    if (options != "" && options.from == "endLocation") {
      that.setData({
        chooseDestination: wx.getStorageSync("toAddress"),
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng")
      });
      if (wx.getStorageSync("selectAds") != "") {
        that.setData({
          userSelectedPosition: true
        });
      }
      //显示起点和终点
      that.setData({
        markers: [{
          id: 0,
          latitude: wx.getStorageSync("fromLat"),
          longitude: wx.getStorageSync("fromLng"),
          title: wx.getStorageSync("fromAddress"),
          iconPath: '/images/icon_Startingpoint.png',
          width:24,
          height:44,
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
        includePoints: [{
          latitude: wx.getStorageSync("fromLat"),
          longitude: wx.getStorageSync("fromLng"),
        }, {
          latitude: wx.getStorageSync("toLat"),
          longitude: wx.getStorageSync("toLng"),
        }]
      });
      
    }
    that.setData({
      centerLatitude: that.data.latitude,
      centerLongitude: that.data.longitude
    })
    that.getPlace();

    //获取用户信息
    that.getuserInfo(that);

  },
  onReady: function () {

    this.mapCtx = wx.createMapContext('myMap'); // myMap为地图的id
    this.includePointsFn();
  },
  // 定义一个 includePointsFn 方法, 参数为需要显示的坐标点(可多个)
  includePointsFn: function () {
    // 缩放视野展示所有经纬度(小程序API提供)
    this.mapCtx.includePoints({
      padding: [80, 50, 80, 50],
      points: [{
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
      }, {
        latitude: wx.getStorageSync("toLat"),
        longitude: wx.getStorageSync("toLng"),
      }]
    })
  },
  onShow: function () {
    var that = this;
  },
  /**
   * 回到定位点
   */
  selfLocationClick: function () {
    var that = this;
    console.log("回到钟起点");
    //显示起点和终点
    that.setData({
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
      includePoints: [{
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
      }, {
        latitude: wx.getStorageSync("toLat"),
        longitude: wx.getStorageSync("toLng"),
      }],
      defaultScale:10
    });
    that.includePointsFn();
  },
  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
      },
      get_poi: 1,
      poi_options: "radius=500;page_size=20;policy=2",
      success: function (res) {
        that.setData({
          nowLocation: res.result.formatted_addresses.recommend
        });
        console.log("通过经纬度解析得到的地址：", res.result.formatted_addresses.recommend);
        //将解析出来的上车地点实时传到storage里
        wx.setStorageSync("fromAddress", that.data.nowLocation);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  //初始化获取位置
  getPlace: function () {
    console.log("初始化获取位置");
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("wx.getLocation展示的数据", res)
        var latitude = res.latitude
        var longitude = res.longitude
        if (!that.data.userSelectedPosition) {
          that.setData({
            latitude: latitude,
            longitude: longitude,
            centerLatitude: latitude,
            centerLongitude: longitude
          });
          //将初始化的经纬度传到storage里，作为实时改变的上车经纬度
          wx.setStorageSync("fromLat", that.data.latitude);
          wx.setStorageSync("fromLng", that.data.longitude);
          that.regeocodingAddress();
        }else{
          that.setData({
            centerLatitude: wx.getStorageSync("fromLat"),
            centerLongitude: wx.getStorageSync("fromLng"),
          });
          that.regeocodingAddress();
        }

      }
    });
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
    //remove掉选择了上车地点的标识
    wx.removeStorageSync("selectAds");
    wx.redirectTo({
      url: '../calling-taxis/calling-taxis',
    })
  },
  //返回首页
  backHome:function(){
    wx.redirectTo({
      url: '../index/index?isScoket=true',
    })
  }
})