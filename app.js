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
  },
  //get请求
  ajaxGetRequest: function (url, data, callback, error_func, token){
    wx.request({
      url: url,
      method: "get",
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
  //post请求
  ajaxPostRequest: function (url, data, callback, error_func, token) {
    wx.request({
      url: url,
      method: "post",
      header: {
        "Authorization": "Bearer "+ token,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: data,
      

      success: function (res) {


        switch (res.statusCode)
        {
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
  //delete请求
  ajaxDeleteRequest: function (url, data, callback, error_func, token) {
    wx.request({
      url: url,
      method: "delete",
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
  globalData: {
    userInfo: null,
    qmapKey:"TYFBZ-R6U33-5JW3P-YSWZ5-LQZAH-4RBPQ",
    interfaceUrl: "https://taxi.shangheweiman.com/api/client/",
  }
})