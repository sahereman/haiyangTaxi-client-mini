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
Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    user_name:"",
    user_head:"",
    latitude: "",
    longitude: "",
    markers: [{
      id: 1,
      latitude: 36.091613,
      longitude: 120.37479,
      name: '起点',
      iconPath:'/images/icon_qidiandingwei.png',
      width:25,
      height:45
    },
      {
        id: 2,
        latitude: 36.092484,
        longitude: 120.380966,
        name: '终点',
        iconPath: '/images/icon_End.png',
        width: 25,
        height: 45
      }
    ],
    isShow:false,
    nowLocation:"获取位置中...",
    chooseDestination:"",
    chooseNewLocal:false
  },
  onLoad: function (options) {
    console.log(options);
    var that = this;
    if (options.isGo == "true"){
        that.setData({
          isShow:true
        });
    }else{
      that.setData({
        isShow: false
      });
    }
   
    // toast组件实例
    new app.ToastPannel();
    qqmapsdk = new QQMapWX({
      key: qmapKey
    });
    //接收上车与目的地传过来的value值
    if (options != "" && options.choiceLocationTitle !=undefined){
      that.setData({
        nowLocation: options.choiceLocationTitle,
        chooseNewLocal:true
      });
    }
    if (options != "" && options.chooseDestinationTitle != undefined) {
      that.setData({
        chooseDestination: options.chooseDestinationTitle
      });
    }
    //获取用户信息
    that.getuserInfo(that);
  },
  onReady:function(){
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("wx.getLocation展示的数据",res)
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude,
          },
          get_poi:1,
          poi_options:"radius=500;page_size=20;policy=2",
          success: function (res) {
            console.log("腾讯地图接口返回数据:",res);
            if (that.data.chooseNewLocal == false){
              var city = res.result.address_component.city;
              that.setData({
                nowLocation: res.result.formatted_addresses.recommend
              });
            }  
            wx.removeStorageSync("city");
            //存储城市用于目的地选择热门地点
            wx.setStorageSync("city",city);
            //定位附近地点数据缓存，用于从哪上车列举选项
            var nearPoisArr = res.result.pois;
            wx.setStorageSync("nearPoisArr", nearPoisArr);
          },
          fail: function (res) {
            console.log("load data fail:", res);
            
          }
        });
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
  bindSlide:function(){
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
  bindInputLocation:function(){
    var token = wx.getStorageSync("token");
    if(token != ""){
      wx.redirectTo({
        url: '../Input-location/Input-location',
      })
    }else{
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
    
  },
  bindInputEnter:function(){
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
  bindOrder:function(){
    var token = wx.getStorageSync("token");
    if (token) {
      wx.navigateTo({
        url: '../order/order',
      })
    }else{
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
  },
  //获取用户信息
  getuserInfo: function (that) {
    var token = wx.getStorageSync("token");
    if (token && token!= undefined) {
      app.ajaxRequest("get",interfaceUrl + "users/me", {}, function (res) {
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
  callTaxi:function(){
    wx.navigateTo({
      url: '../calling-taxis/calling-taxis',
    })
  },
  //返回首页
  backHome:function(){
    var that = this;
    that.setData({
      isShow: false,
      chooseDestination:""
    });
  }
})