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
var timer;
var bTimer;
Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    user_name: "",
    user_head: "",
    latitude: "",
    longitude: "",
    markers: [],
    chooseDestination: "",
    //中心指针，不随着地图拖动而移动
    controls: [],
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
    //检测链接是否成功
    socketOpen:false,
    beatLastReceiveveTime:""
  },
  onLoad: function (options) {
    console.log("onLoad");
    var that = this;
    // toast组件实例
    new app.ToastPannel();
    qqmapsdk = new QQMapWX({
      key: qmapKey
    });
    //接收上车地点传过来的value值
    if (options != "" && options.from == "startLocation" ) {
      that.setData({
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng"),
        userSelectedPosition:true
      });
    }
    //接收目的地传过来的value值
    if (options != "" && options.from == "endLocation") {
      that.setData({
        chooseDestination: wx.getStorageSync("toAddress"),
        latitude: wx.getStorageSync("fromLat"),
        longitude: wx.getStorageSync("fromLng")
      });
      if (wx.getStorageSync("selectAds") != ""){
        that.setData({
          userSelectedPosition: true
        });
      }
    }
    that.setData({
      centerLatitude: that.data.latitude,
      centerLongitude: that.data.longitude
    })
    that.getPlace();

    //获取用户信息
    that.getuserInfo(that);
    //连接socket
    var token = wx.getStorageSync("token");
    if (token) {
      wx.connectSocket({
        url: "ws://taxi.shangheweiman.com:5301?token=" + token,
        success: function (res) {
          console.log("connectSocket建立成功1")
        },
        fail: function (res) {
          console.log("connectSocket建立失败2")
        }
      })
    }
  },
  onReady: function () {
  },
  onShow: function () {
    console.log("onShow");
    var that = this;
    that.changeMapHeight();
    that.getCenterLocation();
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("123",res);
      //socket发送数据
      that.updateCart(wx.getStorageSync("fromLat"), wx.getStorageSync("fromLng"))
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      console.log("aaa--socket接收数据",res);
      that.onmessage(res)
    })
    // that.updateCart(wx.getStorageSync("fromLat"), wx.getStorageSync("fromLng"));
    //定时5秒钟刷新一次小车位置
    // that.cartTimer();
    //定时10秒钟刷新一次心跳包
    that.beatTimer();
  },
  


  //刷新小车位置
  updateCart: function (lat, lng){
    var that = this;
    //连接成功
      var data = {
        action: "nearby",
        data: {
          lat: lat,
          lng: lng,
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
        }
      });
  },
  //接收返回小车的位置数据
  onmessage:function(data){
    var that = this;
    console.log("接收返回小车的位置数据");
    var data = JSON.parse(data.data);
    if (data.action == "nearby") {
      var drivers = data.data.drivers;
      var markersArr = [];
      for (var i = 0; i < drivers.length; i++) {
        var rotate = Math.random() * 360;
        markersArr.push({
          id: drivers[i].id,
          latitude: drivers[i].lat,
          longitude: drivers[i].lng,
          iconPath: '/images/icon_littleyellowcar.png',
          width: 31,
          height: 16,
          rotate: rotate
        });
      }
      that.setData({
        markers: markersArr
      });
    }
  },
  //定时5秒钟刷新一次小车位置
  cartTimer:function () {
    var that = this;
    timer = setTimeout(function () {
      that.updateCart(wx.getStorageSync("fromLat"), wx.getStorageSync("fromLng"));
      that.cartTimer();
    }, 5000);
  },
  //发送接收心跳包数据
  beat: function (){
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
    wx.onSocketMessage(function (res) {
      console.log("接收心跳包返回数据", res);
      var data = JSON.parse(res.data);
      if (data.action == "beat" && data.status_code == "200"){
        that.setData({
          beatLastReceiveveTime : new Date().getTime()
        });
      }
    });
  },
  //心跳包检测

  beatTimer:function(){
    var that = this;
    
    bTimer = setTimeout(function () {
      that.beat();
      var nowTime = new Date().getTime();
      if (that.data.beatLastReceiveveTime != ""){
        var cut = parseInt(nowTime) - parseInt(that.data.beatLastReceiveveTime);
        console.log("cut", cut);
        if (cut > 7000 * 2) {
          //连接socket
          var token = wx.getStorageSync("token");
          if (token) {
            wx.connectSocket({
              url: "ws://taxi.shangheweiman.com:5301?token=" + token,
              success: function (res) {
                console.log("connectSocket建立成功1")
              },
              fail: function (res) {
                console.log("connectSocket建立失败2")
              }
            })
          }
        }
      }
      
      that.beatTimer();
    }, 7000);
  },
  /**
   * 拖动地图回调
   */
  regionChange: function (res) {
    var that = this;
    // 改变中心点位置  
    if (res.type == "end") {
      that.getCenterLocation();
      that.updateCart(wx.getStorageSync("fromLat"), wx.getStorageSync("fromLng"));
    }
    
  },
  /**
   * 得到中心点坐标
   */
  getCenterLocation: function () {
    var that = this;
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.getCenterLocation({
      success: function (res) {
        // console.log('getCenterLocation----------------------->');
        // console.log(res);
        that.setData({
          centerLatitude: res.latitude,
          centerLongitude: res.longitude
        });
        //将移动后的经纬度传到storeage里作为实时更换的上车经纬度
        wx.setStorageSync("fromLat", that.data.centerLatitude);
        wx.setStorageSync("fromLng", that.data.centerLongitude);
        //逆地址解析得到中心点地点名
        that.regeocodingAddress();
      }
    })
  },
  changeMapHeight: function () {
    var that = this;
    var count = 0;
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();
        query.select('#bottom-layout').boundingClientRect()
        query.exec(function (res) {
          bottomHeight = res[0].height;
          that.setMapHeight();
        })
      },
    })
  },
  setMapHeight: function (params) {
    var that = this;
    that.setData({
      mapHeight: (windowHeight - bottomHeight) + 'px'
    })
    var controlsWidth = 24;
    var controlsHeight = 44;
    //设置中间部分指针
    that.setData({
      controls: [
        {
        id: 1,
        iconPath: '../../images/icon_qidiandingwei.png',
        position: {
          left: (windowWidth - controlsWidth) / 2,
          top: (windowHeight - bottomHeight) / 2 - controlsHeight * 3 / 4,
          width: controlsWidth,
          height: controlsHeight
        },
        clickable: true
      }
      ]
    })
  },
  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    if (that.data.centerLatitude == 0 || that.data.centerLatitude == 0){
      that.setData({
        centerLatitude: that.data.latitude,
        centerLongitude: that.data.longitude
      });
    }
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.centerLatitude,
        longitude: that.data.centerLongitude
      },
      get_poi: 1,
      poi_options: "radius=500;page_size=20;policy=2",
      success: function (res) {
        that.setData({
          nowLocation: res.result.formatted_addresses.recommend
        });
        var city = res.result.address_component.city;
        //存储城市用于目的地选择热门地点
        wx.setStorageSync("city", city);
        //定位附近地点数据缓存，用于从哪上车列举选项
        var nearPoisArr = res.result.pois;
        wx.setStorageSync("nearPoisArr", nearPoisArr);
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
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (!that.data.userSelectedPosition){
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
        }
        
      }
    });
  },
  // 滑动开始
  touchstart: function (e) {
    start_clientX = e.changedTouches[0].clientX
  },
  // 滑动结束
  touchend: function (e) {
    end_clientX = e.changedTouches[0].clientX;
    if (end_clientX - start_clientX > 120) {
      this.setData({
        display: "block",
        translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
      })
    } else if (start_clientX - end_clientX > 0) {
      this.setData({
        display: "none",
        translate: ''
      })
    }
  },
  bindSlide: function () {
    this.setData({
      display: "block",
      translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
    })
  },
  // 遮拦
  hideview: function () {
    this.setData({
      display: "none",
      translate: '',
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
    clearTimeout(timer);
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
    clearTimeout(timer);
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
    clearTimeout(timer);
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
  }
})
