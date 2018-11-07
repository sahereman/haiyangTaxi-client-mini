//logs.js
const util = require('../../utils/util.js')
var app = getApp()
//短信发送倒计时器
var countdown = 20;
// 手机号验证正则
var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(14[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
var settime = function (that) {
  if (countdown < 0) {
    that.setData({
      isTime: false
    });
    countdown = 20;
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
}

Page({
  data: {
    phoneVal:null,
    isDelPho:false,
    isLogin:false,
    isTime:false,
    last_time: ''
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

      //手机号格式填写正确，调用后台接口TODO

      
    }
  },
  getCode:function(e){
    var that = this;
    if (e.detail.value.length == 4 && that.data.phoneVal.length == 11){
      that.setData({
        isLogin:true
      });
    }else{
      that.setData({
        isLogin: false
      });
    }
  },
  bindClose:function(){
    var that = this;
    that.setData({
      isDelPho: false,
      phoneVal:""
    });
  }
})
