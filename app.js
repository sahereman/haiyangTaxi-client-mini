//app.js
import { ToastPannel } from './components/toast/toast'
App({
  ToastPannel,
  onLaunch: function () {

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // //连接socket
    var token = wx.getStorageSync("token");
    if (token){
      wx.connectSocket({
        url: "ws://taxi.shangheweiman.com:5301?token=" + token,
        success: function (res) {
          console.log("connectSocket建立成功")
        },
        fail: function (res) {
          console.log("connectSocket建立失败")
        }
      })
    }
    
    
    // wx.onSocketClose(function (res) {
    //   wx.connectSocket({
    //     url: "ws://taxi.shangheweiman.com:5301?token=" + token,
    //   })
    //   console.log('WebSocket 已关闭！',res)
    // })

  },
  //数据请求
  ajaxRequest: function (method,url, data, callback, error_func){
    var token = wx.getStorageSync("token");
    wx.request({
      url: url,
      method: method,
      header: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: data,
      success: function (res) {
        switch (res.statusCode) {
          case 200:
            callback(res);
            break;
          case 201:
            callback(res);
            break;
          case 204:
            callback(res);
            break;
          default:
            error_func(res);
        }
      },
      fail: function (res) {
        console.log('接口请求失败', res)
        callback(res);
      }
    })
  },
  //判断token是否刷新还是重新登录
  checkExpires:function(callback){
    var that = this;
    console.log("刷新token的接口获取的旧token", wx.getStorageSync("token"));
    wx.removeStorageSync("token");
    that.ajaxRequest("put", that.globalData.interfaceUrl + "authorizations",{},function(res){
      console.log("authorizations接口请求成功",res);
      wx.setStorageSync("token", res.data.access_token);
      console.log("更换的新token",wx.getStorageSync("token"));
      callback(res.data);
    },function(res){
      console.log("authorizations接口请求失败", res);
      if (res.data.status_code == 401){
        //刷新授权token接口返回401，超过了14天，重新登录
        wx.navigateTo({
          url: '../logs/logs',
        })
      }
    });
  },


  globalData: {
    userInfo: null,
    qmapKey:"TYFBZ-R6U33-5JW3P-YSWZ5-LQZAH-4RBPQ",
    interfaceUrl: "https://taxi.shangheweiman.com/api/client/",
  }
})