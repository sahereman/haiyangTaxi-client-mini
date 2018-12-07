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
//定义全局变量
var wxMarkerData = [];
var bottomHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
var mapId = 'myMap';
Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    user_name:"",
    user_head:"",
    latitude: "",
    longitude: "",
    markers: [],
    isShow:false,
    chooseDestination:"",
    chooseNewLocal:false,
    //中心指针，不随着地图拖动而移动
    controls: [],
    //地图高度
    mapHeight: 0,
    //中心点的经纬度
    centerLongitude: '',
    centerLatitude: '',
    //选择的上车地点
    nowLocation: "获取位置中...",
    //最终选择的上车地点经纬度
    selectLocationLat:"",
    selectLocationLng:"",
    //选择地址后回调的实体类
    callbackAddressInfo: null,
  },
  onLoad: function (options) {
    console.log("onLoad");
    console.log("options",options);
    var that = this;
    
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
      that.setData({  
        callbackAddressInfo:options
      });
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
    }
    that.getPlace();
    //获取用户信息
    that.getuserInfo(that);
    
  },
  onReady:function(){
    
  },
  onShow:function(){
    var that = this;
    console.log("onShow", that.data.callbackAddressInfo);
    
    that.changeMapHeight();
    //如果刚从选择地址页面带数据回调回来，则显示选择的地址,否则显示地图上选中的中心点地址
    if (that.data.callbackAddressInfo == null){
      that.getCenterLocation();
      console.log(12);
    }else{
      that.setData({
        nowLocation: that.data.callbackAddressInfo.choiceLocationTitle,
        selectLocationLat: that.data.callbackAddressInfo.choiceLocationTat,
        selectLocationLng: that.data.callbackAddressInfo.choiceLocationLng
      })
      //置空回调数据，即只使用一次，下次中心点变化后就不再使用
      // that.setData({
      //   callbackAddressInfo: null
      // })
      console.log(34);
    }
  },
  /**
   * 拖动地图回调
   */
  regionChange: function (res) {
    var that = this;
    // 改变中心点位置  
    if (res.type == "end") {
      that.getCenterLocation();
    }
  },
  /**
   * 得到中心点坐标
   */
  getCenterLocation: function () {
    var that = this;
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.getCenterLocation({
      success: function (res) {
        console.log('getCenterLocation----------------------->');
        console.log(res);
        that.setData({
          centerLatitude: res.latitude,  
          centerLongitude: res.longitude,
          selectLocationLat: res.latitude,
          selectLocationLng: res.longitude
        });
        //逆地址解析得到中心点地点名
        that.regeocodingAddress();
      }
    })
  },
  changeMapHeight: function () {
    var that = this;
    var count = 0;
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res);
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();
        query.select('#bottom-layout').boundingClientRect()
        query.exec(function (res) {
          // console.log(res);
          bottomHeight = res[0].height;
          that.setMapHeight();
        })
      },
    })
  },
  setMapHeight: function (params) {
    var that = this;
    that.setData({
      mapHeight: (windowHeight - bottomHeight) + 'px'
    })
    var controlsWidth = 24;
    var controlsHeight = 44;
    //设置中间部分指针
    that.setData({
      controls: [{
        id: 1,
        iconPath: '../../images/icon_qidiandingwei.png',
        position: {
          left: (windowWidth - controlsWidth) / 2,
          top: (windowHeight - bottomHeight) / 2 - controlsHeight * 3 / 4,
          width: controlsWidth,
          height: controlsHeight
        },
        clickable: true
      }
      ]
    })
  },
  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    //通过经纬度解析地址
    if (that.data.centerLatitude == 0){
      that.setData({
        centerLatitude: that.data.latitude
      });
      if (that.data.centerLongitude == 0){
        that.setData({
          centerLongitude: that.data.longitude
        });
    }  
    }
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.centerLatitude,
        longitude: that.data.centerLongitude
      },
      get_poi: 1,
      poi_options: "radius=500;page_size=20;policy=2",
      success: function (res) {
        console.log("that.data.callbackAddressInfo", that.data.callbackAddressInfo);
        if (that.data.callbackAddressInfo == null) {
          that.setData({
            nowLocation: res.result.formatted_addresses.recommend
          });
          console.log("通过经纬度解析地址", res.result.formatted_addresses.recommend);
        }else{
          that.setData({
            nowLocation: that.data.callbackAddressInfo.choiceLocationTitle
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
        console.log(res);
      }
    });
  },
  //初始化获取位置
  getPlace:function(){
    console.log("初始化获取位置");
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("wx.getLocation展示的数据", res)
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        that.regeocodingAddress();
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
        // markers: [{
        //   id: 0,
        //   latitude: that.data.latitude,
        //   longitude: that.data.longitude,
        //   iconPath: '/images/icon_qidiandingwei.png',
        //   callout: {
        //     content: "从这里上车",
        //     padding: 5,
        //     display: 'ALWAYS',
        //     textAlign: 'center',
        //     borderRadius: 20,
        //   }
        // }]
    });
    wx.removeStorageSync("endLocal");
    wx.removeStorageSync("chooseDestinationTat");
    wx.removeStorageSync("chooseDestinationLng");
    wx.removeStorageSync("startLocal");
    wx.removeStorageSync("choiceLocationTat");
    wx.removeStorageSync("choiceLocationLng");
  },
})