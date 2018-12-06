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
    markers: [
      
    ],
    isShow:false,
    nowLocation:"获取位置中...",
    chooseDestination:"",
    chooseNewLocal:false
  },
  onLoad: function (options) {
    console.log("options",options);
    var that = this;
    that.getPlace();
    console.log("that.data.latitude",that.data.latitude);
    if (options.isGo == "true"){
        that.setData({
          isShow:true
        });
    }else{
      that.setData({
        isShow: false
      });
    };
    // toast组件实例
    new app.ToastPannel();
    qqmapsdk = new QQMapWX({
      key: qmapKey
    });
    //接收上车地点传过来的value值
    if (options != "" && options.choiceLocationTitle != undefined && options.choiceLocationTat != undefined && options.choiceLocationLng!=undefined){
      
      if (wx.getStorageSync("endLocal") != "") {
        that.setData({
          chooseDestination: wx.getStorageSync("endLocal"),
          markers: [{
            id: 0,
            latitude: options.choiceLocationTat,
            longitude: options.choiceLocationLng,
            title: options.choiceLocationTitle,
            iconPath: '/images/icon_qidiandingwei.png',
            callout: {
              content: "从这里上车",
              padding: 5,
              display: 'ALWAYS',
              textAlign: 'center',
              borderRadius: 20,
            }
          }]
        });
        console.log(1);
      }else{
        console.log(2);
        that.setData({
          nowLocation: options.choiceLocationTitle,
          chooseNewLocal: true,
          markers: [{
            id: 0,
            latitude: options.choiceLocationTat,
            longitude: options.choiceLocationLng,
            title: options.choiceLocationTitle,
            iconPath: '/images/icon_qidiandingwei.png',
            callout: {
              content: "从这里上车",
              padding: 5,
              display: 'ALWAYS',
              textAlign: 'center',
              borderRadius: 20,
            }
          }]
        });
      }
      wx.setStorageSync("startLocal", options.choiceLocationTitle);
      wx.setStorageSync("choiceLocationTat", options.choiceLocationTat);
      wx.setStorageSync("choiceLocationLng", options.choiceLocationLng);
    }
    //接收目的地传过来的value值
    if (options != "" && options.chooseDestinationTitle != undefined) {
      that.setData({
        chooseDestination: options.chooseDestinationTitle
      });
      console.log(wx.getStorageSync("startLocal"));
      if (wx.getStorageSync("startLocal") != ""){
        that.setData({
          nowLocation: wx.getStorageSync("startLocal"),
          chooseNewLocal: true,
          markers: [{
            id: 0,
            latitude: wx.getStorageSync("choiceLocationTat"),
            longitude: wx.getStorageSync("choiceLocationLng"),
            title: wx.getStorageSync("startLocal"),
            iconPath: '/images/icon_Startingpoint.png',
            label: {
              content: "上车的地方名称",
              display: 'ALWAYS',
              textAlign: 'right'
            }
          },
            {
              id: 1,
              latitude: options.chooseDestinationTat,
              longitude: options.chooseDestinationLng,
              title: options.chooseDestinationTitle,
              iconPath: '/images/icon_End.png',
              label: {
                content: "目的地名称",
                display: 'ALWAYS',
                textAlign: 'right'
              }

            }]
        });
      }else{
        console.log("aaa", wx.getStorageSync("latitude"), "-----------", wx.getStorageSync("longitude"), "--------", options);
        //起点选用的默认起点
        that.setData({
          nowLocation: wx.getStorageSync("startLocal"),
          chooseNewLocal: true,
          markers: [{
            id: 0,
            latitude: wx.getStorageSync("latitude"),
            longitude: wx.getStorageSync("longitude"),
            // title: wx.getStorageSync("startLocal"),
            iconPath: '/images/icon_Startingpoint.png',
            label: {
              content: "上车的地方名称",
              display: 'ALWAYS',
              textAlign: 'right'
            }
          },
          {
            id: 1,
            latitude: options.chooseDestinationTat,
            longitude: options.chooseDestinationLng,
            title: options.chooseDestinationTitle,
            iconPath: '/images/icon_End.png',
            label: {
              content: options.chooseDestinationTitle,
              display: 'ALWAYS',
              textAlign: 'right'
            }

          }]
        });

      }
      wx.setStorageSync("endLocal", options.chooseDestinationTitle);
      wx.setStorageSync("chooseDestinationTat", options.chooseDestinationTat);
      wx.setStorageSync("chooseDestinationLng", options.chooseDestinationLng);
    }
    //获取用户信息
    that.getuserInfo(that);
  },
  onReady:function(){
    
  },
  //获取位置
  getPlace:function(){
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("wx.getLocation展示的数据", res)
        var latitude = res.latitude
        var longitude = res.longitude
        wx.setStorageSync("latitude", latitude);
        wx.setStorageSync("longitude", longitude);
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        console.log("123", that.data.latitude);
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude,
          },
          get_poi: 1,
          poi_options: "radius=500;page_size=20;policy=2",
          success: function (res) {
            console.log("腾讯地图接口返回数据:", res);
            var startLatitude = res.result.pois[0].location.lat;
            var startLLongitude = res.result.pois[0].location.lng;
            var title = res.result.pois[0].title;
            if (that.data.chooseNewLocal == false || wx.getStorageSync("startLocal") == "") {
              that.setData({
                nowLocation: res.result.formatted_addresses.recommend,
                markers: [{
                  id: 0,
                  latitude: startLatitude,
                  longitude: startLLongitude,
                  title: title,
                  iconPath: '/images/icon_qidiandingwei.png',
                  callout: {
                    content: "从这里上车",
                    padding: 5,
                    display: 'ALWAYS',
                    textAlign: 'center',
                    borderRadius: 20,
                  }
                }]
              });
            } else {
              that.setData({
                nowLocation: wx.getStorageSync("startLocal")
              });
            }
            var city = res.result.address_component.city;
            //存储城市用于目的地选择热门地点
            wx.setStorageSync("city", city);
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
    wx.removeStorageSync("endLocal");
    wx.removeStorageSync("startLocal");
    wx.removeStorageSync("nearPoisArr");
    wx.navigateTo({
      url: '../calling-taxis/calling-taxis',
    })
  },
  //返回首页
  backHome:function(){
    var that = this;
    that.setData({
      isShow: false,
      chooseDestination:"",
        markers: [{
          id: 0,
          latitude: that.data.latitude,
          longitude: that.data.longitude,
          iconPath: '/images/icon_qidiandingwei.png',
          callout: {
            content: "从这里上车",
            padding: 5,
            display: 'ALWAYS',
            textAlign: 'center',
            borderRadius: 20,
          }
        }]
    });
    wx.removeStorageSync("endLocal");
    wx.removeStorageSync("chooseDestinationTat");
    wx.removeStorageSync("chooseDestinationLng");
    wx.removeStorageSync("startLocal");
    wx.removeStorageSync("choiceLocationTat");
    wx.removeStorageSync("choiceLocationLng");
  },
})