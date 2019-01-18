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
    // //连接socket,判断storage里是否有token,并且token值是否有效
    var token = wx.getStorageSync("token");
    var dateNow = new Date().getTime();
    var expiresIn = wx.getStorageSync("expiresIn");
    if (token && parseInt(new Date().getTime()) < parseInt(expiresIn)){
      wx.connectSocket({
        url: "wss://taxi.shangheweiman.com:5301?token=" + token,
        success: function (res) {
          console.log("connectSocket建立成功333")
        },
        fail: function (res) {
          console.log("connectSocket建立失败")
        }
      })
      this.globalData.isScoket = true;
    } else if (token && dateNow > expiresIn){
      //有token但是token值过期了，从新调用接口获取新的token
      console.log("刷新token的接口获取的旧token====", wx.getStorageSync("token"));
      var _that = this;
      this.ajaxRequest("put", this.globalData.interfaceUrl + "authorizations", {}, function (res) {
        console.log("authorizations接口请求成功", res);
        wx.setStorageSync("token", res.data.access_token);
        var expires_in = parseInt(res.data.expires_in) * 1000;
        var expires_date = Number(new Date().getTime());
        var expiresIn = expires_date + expires_in;
        wx.setStorageSync("expiresIn", expiresIn);
        wx.connectSocket({
          url: "wss://taxi.shangheweiman.com:5301?token=" + wx.getStorageSync("token"),
          success: function (res) {
            console.log("connectSocket建立成功111")
          },
          fail: function (res) {
            console.log("connectSocket建立失败")
          }
        })
      }, function (res) {
        console.log("authorizations接口请求失败", res);
        if (res.data.status_code == 401 || res.data.status_code == 500) {
          //刷新授权token接口返回401，超过了14天，重新登录
          wx.navigateTo({
            url: '../logs/logs',
          })
        }
      });
      this.globalData.isScoket = true;
    }else{
      console.log("乘客未登录，没有连接scoket");
      this.globalData.isScoket = false;
    } 

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
    that.ajaxRequest("put", that.globalData.interfaceUrl + "authorizations",{},function(res){
      console.log("authorizations接口请求成功",res);
      wx.setStorageSync("token", res.data.access_token);
      var expires_in = parseInt(res.data.expires_in) * 1000;
      var expires_date = Number(new Date().getTime());
      var expiresIn = expires_date + expires_in;
      wx.setStorageSync("expiresIn", expiresIn);
      callback(res.data);
    },function(res){
      console.log("authorizations接口请求失败", res);
      if (res.data.status_code == 401 || res.data.status_code == 500){
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
    isScoket:false
  }
})