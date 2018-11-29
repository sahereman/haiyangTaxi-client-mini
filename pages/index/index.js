//index.js
//获取应用实例
var start_clientX;
var end_clientX;
const app = getApp()
const util = require("../../utils/util.js")
Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    user_name:"",
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
    }]
  },
  onLoad: function () {
    // toast组件实例
    new app.ToastPannel();
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
        })
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
  //点击未开发的模块
  bindNOne:function(){
    var that =this;
    that.show('功能建设中...');
  },
  bindInputLocation:function(){
    wx.redirectTo({
      url: '../Input-location/Input-location',
    })
  },
  bindInputEnter:function(){
    wx.redirectTo({
      url: '../Input-destination/Input-destination',
    })
  }
})