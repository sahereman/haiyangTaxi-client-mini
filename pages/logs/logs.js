//logs.js
const util = require('../../utils/util.js')
var app = getApp();
var interfaceUrl = app.globalData.interfaceUrl;
//短信发送倒计时器
var countdown = 60;
// 手机号验证正则
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(14[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
var settime = function (that) {
  if (countdown < 0) {
    that.setData({
      isTime: false
    });
    countdown = 60;
    return;
  } else {
    that.setData({
      isTime: true,
      last_time: countdown
    })
    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }
    , 1000)
};

Page({
  data: {
    phoneVal:null,
    codeVal:null,
    isDelPho:false,
    isLogin:false,
    isTime:false,
    last_time: '',
    verification_key:''
  },
  onLoad: function () {
    // toast组件实例
    new app.ToastPannel();
  },
  getPhone:function(e){
    var that = this;
    that.setData({
      phoneVal: e.detail.value
    }); 
    if (e.detail.value.length>0){
      that.setData({
        isDelPho:true
      });
    }else{
      that.setData({
        isDelPho: false
      });
    }
  },
  //手机号改变事件
  bindChangeDel:function(e){
    var that = this;
    that.setData({
      phoneVal: e.detail.value
    }); 
  },
  //短信码改变事件
  bindChangeSms:function(e){
    var that = this;
    that.setData({
      codeVal:e.detail.value
    });
    if (e.detail.value.length == 4 && that.data.phoneVal.length == 11) {
      that.setData({
        isLogin: true
      });
    } else {
      that.setData({
        isLogin: false
      });
    }
  },
  //点击获取验证码
  bindCode:function(){
    var that = this;
    var phoneVal = that.data.phoneVal;
    if (phoneVal == null){
      that.show("手机号不能为空");
    } else if (phoneVal.length != 11){
      that.show("手机号輸入不完整");
    }else if (!(/^1[34578]\d{9}$/.test(phoneVal))){
      that.show("手机号不正确");
    }else{
      settime(that);
      that.setData({
        isTime:true
      });
      //手机号格式填写正确，调用后台接口发送短信验证码
      var param = { "phone": phoneVal};
      app.ajaxRequest("post",interfaceUrl +"sms/verification", param, function (res) {
        that.setData({
          verification_key:res.data.key
        });
        console.log('sms/verification接口请求数据成功', res);
      },function(res){
        console.log('sms/verification接口请求数据失败', res);
        var errorTip = res.data.message;
        that.show("短信发送失败，请稍后重试",1500);
      });
    }
  },
  bindClose:function(){
    var that = this;
    that.setData({
      isDelPho: false,
      phoneVal:""
    });
  },
  bindLogin:function(){
    var that = this;
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
      mask: true,
      success: function () {
          //请求登录接口
        var loginDataParam = { "phone": that.data.phoneVal, "verification_key": that.data.verification_key, "verification_code": that.data.codeVal}
        app.ajaxRequest("post",interfaceUrl +"authorizations", loginDataParam, function (res) {
          if (res != null && res.data != null) {
            console.log('authorizations接口请求成功', res);
            that.show("登录成功", 1500)
            //登录成功，获取token和有效期存入
            var token = res.data.access_token;
            var expires_in = res.data.expires_in;
            wx.setStorageSync("token", res.data.access_token);
            //连接socket
            var token = wx.getStorageSync("token");
            if (token) {
              wx.connectSocket({
                url: "wss://taxi.shangheweiman.com:5301?token=" + token,
                success: function (res) {
                  console.log("connectSocket建立成功1")
                },
                fail: function (res) {
                  console.log("connectSocket建立失败2")
                }
              })
            }
            wx.redirectTo({
              url: '../index/index?isScoket=true',
            })
            wx.hideLoading();

            } 
          },function(res){
            console.log('接口请求数据失败', res);
            if (res != null && res.data != null){
              if (res.data.errors.phone != undefined && res.data.errors.phone != null){
                var tip = res.data.errors.phone[0];
                that.show(tip, 1500)
              } else if (res.data.errors.verification_key != undefined && res.data.errors.verification_key != null){
                var tip = res.data.errors.verification_key[0];
                that.show(tip, 1500)  
              }else{
                var tip = res.data.errors.verification_code[0];
                that.show(tip, 1500)
              }
            }
            wx.hideLoading();
          });
      }
    });
  }
})
