// pages/order/order.js
var app = getApp();
var interfaceUrl = app.globalData.interfaceUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notTrip:false,
    ongoing:false,
    orderList: false,
    loadTrippingOrderArr:[],
    loadNoTrippingOrderArr:[],
    footerSwitch: 'none',
    loadingSwitch: 'block',
    nextLink:null,
    localHistoryArr:[]
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
    var that = this;
    var url = interfaceUrl + "orders";
    that.loadTrippingOrderData();
    that.loadNoTrippingOrderData(url);
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //获取进行中订单数据
  loadTrippingOrderData:function(){ 
    var that = this;
    app.ajaxRequest("get", interfaceUrl + "orders", { "status": "tripping"}, function (res) { 
      console.log('orders接口请求成功Tripping', res);
      if(res.data.data.length>0){
        that.setData({
          ongoing: true,
          loadTrippingOrderArr: res.data.data
        });
      }
    }, function (res) { 
      console.log('orders接口请求失败', res);
      if (res.data.message == "Token has expired" && res.data.status_code == 401) {
        console.log("token过期");
        app.checkExpires(function (res) {
          that.loadTrippingOrderData();
        });
      }
    });
  },
  //获取非进行中订单数据
  loadNoTrippingOrderData: function (url) {
    var that = this;
    app.ajaxRequest("get",url, { "status": "noTripping" }, function (res) {
      console.log('orders接口请求成功NoTripping', res);
      var array = res.data.data;
      if (array.length > 0 && array != null && typeof (array) != 'undefined') {
        for(var i=0;i<array.length;i++){
          var cart_number = array[i].driver.cart_number;
          var status_text = array[i].status_text;
          var created_at = array[i].created_at;
          var from_address = array[i].from_address;
          var to_address = array[i].to_address;
          that.data.loadNoTrippingOrderArr.push({ "cart_number": cart_number, "status_text": status_text, "created_at": created_at, "from_address": from_address, "to_address": to_address});
        }
        that.setData({
          orderList: true,
          loadNoTrippingOrderArr: that.data.loadNoTrippingOrderArr
        });
      }
      if (res.data.meta.pagination.links && res.data.meta.pagination.links != undefined && res.data.meta.pagination.links != null){
        var nextLink = res.data.meta.pagination.links.next;
      }
      
      if (nextLink!=null) {
        that.setData({
          nextLink: nextLink
        });
      }else{
        that.setData({
          nextLink: null,
          loadingSwitch: "none",
          footerSwitch: "block"
        });
      }
      if (!that.data.ongoing && !that.data.orderList) {
        that.setData({
          notTrip: true
        });
      }
    }, function (res) {
      console.log('orders接口请求失败', res);
      if (res.data.message == "Token has expired" && res.data.status_code == 401) {
        console.log("token过期");
        app.checkExpires(function (res) {
          that.loadNoTrippingOrderData(url);
        });
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var nextLink = that.data.nextLink;
    if (nextLink != null){
      that.loadNoTrippingOrderData(nextLink); 
    }else{
      that.setData({
        loadingSwitch: "none",
        footerSwitch: "block"
      });
    }
  }
  
})