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
    }],
    isShow:false
  },
  onLoad: function (options) {
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
    that.getuserInfo(that);
  },
  //获取用户信息
  getuserInfo:function(that){
    var token = wx.getStorageSync("token");
    if (token) {
      app.ajaxGetRequest(interfaceUrl + "users/me", {}, function (res) {
        console.log('users/me接口请求成功', res);
        var phone = res.data.phone;
        var mphone = phone.substr(3, 4);
        var user_name =  phone.replace(mphone, "****");
        var user_head = res.data.avatar_url
        that.setData({
          user_name: user_name,
          user_head: user_head
        });
      }, function () {
        console.log('users/me接口请求失败', res);
      }, token);
    }
  },
  onReady:function(){
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        // console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: "36.092484",
            longitude: "120.380966",
          },
          get_poi:1,
          poi_options:"radius=500;page_size=20;policy=2",
          success: function (res) {
            // console.log(res);  
            var address_component = res.result.address_component;
          },
          fail: function (res) {
            // console.log("load data fail:", res);
            
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
  }
})