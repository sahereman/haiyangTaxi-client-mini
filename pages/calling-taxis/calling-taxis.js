// pages/calling-taxis/calling-taxis.js
var time;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:"请耐心等候...",
    lookingTaxis:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var step = 1,//计数动画次数
      num = 0,//计数倒计时秒数（n - num）
      start = 1.5 * Math.PI,// 开始的弧度
      end = -0.5 * Math.PI,// 结束的弧度
      time = null;// 计时器容器

    var animation_interval = 1000,// 每1秒运行一次计时器
      n = 60; // 当前倒计时为10秒
    // 动画函数
    function animation() {
      if (step <= n) {
        end = end + 2 * Math.PI / n;
        ringMove(start, end);
        step++;
      } else {
        clearInterval(time);
      }
    };
    // 画布绘画函数
    function ringMove(s, e) {
      var context = wx.createCanvasContext('secondCanvas')
      // 绘制圆环
      context.setStrokeStyle('#fd9153')
      context.beginPath()
      context.setLineWidth(1)
      context.arc(120, 120, 100, s, e, true)
      context.stroke()
      context.closePath()
      // 绘制倒计时文本
      context.beginPath()
      context.setLineWidth(1)
      context.setFontSize(60)
      context.setFillStyle('#fd9153')
      context.setTextAlign('center')
      context.setTextBaseline('middle')
      context.fillText(n - num + '', 120, 120, 100)
      context.fill()
      context.closePath()
      context.draw()
      // 每完成一次全程绘制就+1
      num++;
    }
    // 倒计时前先绘制整圆的圆环
    ringMove(start, end);
    // 创建倒计时m.h987yuitryuioihyhujik[jhgvfbnvnjmnbvbnm,nbvfcgklkjhg545545545u ]
    time = setInterval(animation, animation_interval);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("456", res);
      //socket发送数据
      // that.oppen()
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      // console.log("vvcccc", res.data);
      that.searchTaxis(res.data);
    })
    that.oppen()
  },
  oppen: function (lat, lng) {
    var that = this;
    //连接成功
    var data = {
      "action": "publish",
      "data": {
        "from_address": "CBD万达广场",
        "from_location": {
          "lat": "36.088436",
          "lng": "120.379145"
        },
        "to_address": "五四广场",
        "to_location": {
          "lat": "36.062030",
          "lng": "120.384940"
        }
      }
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
  },
  //寻找出租车
  searchTaxis:function(data){
    var that = this;
    var data = JSON.parse(data);
    console.log("正在寻找车辆中", data);
    if (data.action == "publish"){
      wx.setStorageSync("order_key", data.data.order_key);
      that.setData({
        lookingTaxis:true
      });
    }
    if (that.data.lookingTaxis && data.action == "meet"){
      //车辆已接单，正在赶来，将赶来的车辆信息记录下来，用于下一页面的展示
      wx.setStorageSync("driver", data.data.driver);
      //将赶来车辆的订单号记录下来，用于下一页面取消叫车的发送参数
      wx.setStorageSync("order_id", data.data.order.id);
      wx.redirectTo({
        url: '../waiting-someone/waiting-someone',
      })
      clearInterval(time);
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  cancelTaxi:function(){
    var that = this;
    //socket连接成功
    wx.onSocketOpen(function (res) {
      console.log("456", res);
      //socket发送数据
      that.oppena()
    })
    //socket接收数据
    wx.onSocketMessage(function (res) {
      console.log("vvcccc", res);
      var data = JSON.parse(res.data);
      if (data.action == "withdraw" && data.status_code == 200){
        clearInterval(time);
         wx.redirectTo({
           url: '../index/index',
         }) 
        
      }
    })
    that.oppena()
  },
   oppena: function (lat, lng) {
    var that = this;
    //连接成功
     console.log(wx.getStorageSync("order_key"));
     var data = {
       "action": "withdraw",
       "data": {
         "order_key": wx.getStorageSync("order_key")
       }
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
  },
})