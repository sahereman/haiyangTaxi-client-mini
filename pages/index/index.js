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
var isScoket = app.globalData.isScoket;
//定义全局变量
var wxMarkerData = [];
var bottomHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
var mapId = 'myMap';
var timer;
var bTimer;
Page({
  data: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    isScoket:false,
    latitude: "",
    longitude: "",
    markers: [],
    chooseDestination: "",
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
    selectLocationLat: "",
    selectLocationLng: "",
    //选择地址后回调的实体类
    // callbackAddressInfo: null,
    userSelectedPosition: false,
    //检测链接是否成功
    socketOpen:false,
    beatLastReceiveveTime:"",
    //检测是否发送成功
    sendSocketMessage:true,
    closeTimer:false,
    defaultScale:16,
    closeStcoket:false,
    locationCount:0,
    mapOn:false
  },
  
  onLoad: function (options) {
    var that = this;
    // that.setData({
    //   latitude: '-80.546518',
    //   longitude: '4.042969',
    //   nowLocation: "获取位置中..."
    // });

    // toast组件实例
    new app.ToastPannel();
    qqmapsdk = new QQMapWX({
      key: qmapKey
    });
    //接收登录成功可以连接scoket的参数
    if (options != "" && options.isScoket){
        that.setData({
          isScoket:true
        });
    }
    //接收上车地点传过来的value值
    if (options != "" && options.froms == "startLocation" ) {
      wx.getStorage({
        key: 'fromLatLng',
        success(res) {
          that.setData({
            latitude: res.data.lat,
            longitude: res.data.lng,
            centerLatitude: res.data.lat,
            centerLongitude: res.data.lng,
            userSelectedPosition: true,
            mapOn: true
          });
          console.log("接收上车地点传过来的value值" + that.data.latitude + "====" + that.data.mapOn);
          that.setData({
            nowLocation: wx.getStorageSync("fromAddress")
          }); 


        }
      })
    }
    
    // that.setData({
    //   centerLatitude: that.data.latitude,
    //   centerLongitude: that.data.longitude
    // })
    
    //接收退出登录传过来的值，已断开连接，关闭心跳包定时器和刷新小车位置定时器
    if (options != "" && options.closeStcoket) {
      that.setData({
        closeTimer:true,
        closeStcoket:true
      });
      clearInterval(bTimer);
      clearInterval(timer);
    }

    this.changeMapHeight();

    //如果是从选择列表中选择的上车地点（无效）
    if (that.data.userSelectedPosition) {
      that.setData({
        nowLocation: wx.getStorageSync("fromAddress")
      });
    } else {
      //刚进入页面初次定位时
      that.getPlace(that.selfLocationClick);
    }
  },
  onReady: function () {
  },
  onShow: function () {
    var that = this;
    

    //如果用户登陆了，才可以进行连接
    if (isScoket & !that.data.closeStcoket || that.data.isScoket && !that.data.closeStcoket){
      //socket连接成功
      wx.onSocketOpen(function (res) {
        //socket发送数据
        wx.getStorage({
          key: 'fromLatLng',
          success(res) {
            that.updateCart(res.data.lat, res.data.lng);
          }
        })
      })
      //socket接收数据
      wx.onSocketMessage(function (res) {
        // console.log("首页socket接收数据", res);
        that.onmessage(res)
      })
      //定时5秒钟刷新一次小车位置
      if (that.data.sendSocketMessage != false) {
        if (!that.data.closeTimer){
          that.cartTimer();
        } 
      }
      //定时10秒钟刷新一次心跳包
      if (that.data.sendSocketMessage != false) {
        if (!that.data.closeTimer) {
          that.beatTimer();
        }  
      }
    }else{
      //没有登录或者没有连接scoket的时候，模拟几辆假的小车
      // console.log("没有登录或者没有连接scoket的时候，模拟几辆假的小车");
    }  
  },
  //刷新小车位置
  updateCart: function (lat, lng){
    var that = this;
    //连接成功
      var data = {
        action: "nearby",
        data: {
          lat: lat,
          lng: lng,
        }
      }
    if (isScoket || that.data.isScoket){
        //发送数据
      wx.sendSocketMessage({
        data: JSON.stringify(data),
        success: function (res) {
          // console.log("sendSocketMessage 成功", res)
        },
        fail: function (res) {
          console.log("sendSocketMessage 失败", res)
          that.setData({
            sendSocketMessage:false
          });
        }
      });
      }
      
  },
  //接收返回小车的位置数据
  onmessage:function(data){
    var that = this;
    var data = JSON.parse(data.data);
    if (data.action == "nearby") {
      var drivers = data.data.drivers;
      var markersArr = [];
      for (var i = 0; i < drivers.length; i++) {
        markersArr.push({
          id: drivers[i].id,
          latitude: drivers[i].lat,
          longitude: drivers[i].lng,
          iconPath: '/images/icon_littleyellowcar.png',
          width: 16,
          height: 31,
          rotate: parseInt(drivers[i].angle)
        });
      }
      that.setData({
        markers: markersArr
      });
    }
  },
  //定时5秒钟刷新一次小车位置
  cartTimer:function () {
    var that = this;
    timer = setInterval(function () {
      wx.getStorage({
        key: 'fromLatLng',
        success(res) {
          that.updateCart(res.data.lat, res.data.lng);
        }
      })
      
    }, 5000);
  },
  //发送接收心跳包数据
  beat: function (){
    var that = this;
    //连接成功
    var data = {
      "action": "beat"
    }
    //发送数据
    wx.sendSocketMessage({
      data: JSON.stringify(data),
      success: function (res) {
        // console.log("sendSocketMessage 成功1", res)
      },
      fail: function (res) {
        console.log("sendSocketMessage 失败2", res);
        that.setData({
          sendSocketMessage: false
        });
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
      }
    });
  },
  //心跳包检测
  beatTimer:function(){
    var that = this;
    bTimer = setInterval(function () {
      that.beat();
    }, 10000);
  },
  /**
   * 回到定位点
   */
  selfLocationClick: function () {
    var that = this;
    that.setData({
      userSelectedPosition:false,
      defaultScale:16
    });
    that.getPlace();
    
  },
  /**
   * 拖动地图回调
   */
  regionChange: function (res) {
    var that = this;
    // 改变中心点位置  
    if (res.type == "end") {
      that.getCenterLocation();
      wx.getStorage({
        key: 'fromLatLng',
        success(res) {
          that.updateCart(res.data.lat, res.data.lng);
        }
      })
    }
  },
  /**
   * 获取当前地图中心的经纬度。返回的是 gcj02 坐标系
   */
  getCenterLocation: function () {
    var that = this;
    var mapCtx = wx.createMapContext("myMap");
    mapCtx.getCenterLocation({
      success: function (res) {
        that.setData({
          centerLatitude: res.latitude,
          centerLongitude: res.longitude
        });
        //将移动后的经纬度传到storeage里作为实时更换的上车经纬度
        wx.setStorage({
          key: 'fromLatLng',
          data: {
            lat: res.latitude,
            lng: res.longitude,
          },
          success:function(){
            //逆地址解析得到中心点地点名
            that.regeocodingAddress(); 
          }
        })  
      }
    })
  },
  changeMapHeight: function () {
    var that = this;
    var count = 0;
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();
        query.select('#bottom-layout').boundingClientRect()
        query.exec(function (res) {
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
      controls: [
        {
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
   * 移动到中心点
   */
  // mapCtx: function () {
  //   var mapCtx = wx.createMapContext("myMap");
  //   mapCtx.moveToLocation();
  // },
  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    if (that.data.centerLatitude == 0 || that.data.centerLongitude == 0){
      that.setData({
        centerLatitude: that.data.latitude,
        centerLongitude: that.data.longitude
      });
    }
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.centerLatitude,
        longitude: that.data.centerLongitude
      },
      get_poi: 1,
      poi_options: "radius=500;page_size=20;policy=2",
      success: function (res) {
        if (res.result.pois[0]!=undefined && res.result.pois[0].title!=null){
          if (res.result.pois[0].title == "南极洲"){
            that.setData({
              nowLocation: "获取位置中..."
            });
          }else{
            that.setData({
              nowLocation: res.result.pois[0].title
            });
          }  
        }else{
          if (res.result.address == "南极洲"){
            that.setData({
              nowLocation: "获取位置中..."
            });
          }else{
            that.setData({
              nowLocation: res.result.address
            });  
          }
           
        }
        
        var city = res.result.address_component.city;
        //存储城市用于目的地选择热门地点
        wx.setStorageSync("city", city);
        //定位附近地点数据缓存，用于从哪上车列举选项
        var nearPoisArr = res.result.pois;
        wx.setStorageSync("nearPoisArr", nearPoisArr);
        //将解析出来的上车地点实时传到storage里
        wx.setStorageSync("fromAddress", that.data.nowLocation);
      },
      fail: function (res) {
        console.log("逆地址解析失败,重新解析" + that.data.centerLatitude);
      }
    });
  },
  //初始化获取位置
  getPlace: function (callback) {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        if (!that.data.userSelectedPosition){
          that.setData({
            latitude: latitude,
            longitude: longitude,
            centerLatitude: latitude,
            centerLongitude: longitude
          });
          that.setData({
            mapOn: true
          });
          //将初始化的经纬度传到storage里，作为实时改变的上车经纬度
          wx.setStorage({
            key: 'fromLatLng',
            data: {
              lat: that.data.latitude,
              lng: that.data.longitude
            },
            success : function()
            {
              that.setData({
                mapOn:true
              });
              
              that.regeocodingAddress();

              if (callback != undefined) {
                callback();
              }
            }
          })


          
        }
      },
      fail:function(){
        console.log("定位失败");
        that.data.locationCount = that.data.locationCount+1;
        if (that.data.locationCount >5){
          wx.showModal({
            title: '定位失败，是否重试？',
            // content: '确定退出吗？',
            confirmColor: '#fe955c',
            success(res) {
              if (res.confirm) {
                //点击确定
                that.getPlace(callback);
                that.setData({
                  locationCount:0
                });
              } else if (res.cancel) {
                //用户点击取消
                console.log("用户点击取消");
              }
            }
          })
        }
        else{
          that.getPlace(callback);
        }
        
      }  
    });
    
  },
  bindSlide: function () {
    var that = this;
    wx.navigateTo({
      url: '../user/user',
    })
    clearInterval(timer);
  },
  bindInputLocation: function () {
    var token = wx.getStorageSync("token");
    if (token != "") {
      wx.redirectTo({
        url: '../Input-location/Input-location',
      })
    } else {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
    clearInterval(timer);
  },
  bindInputEnter: function () {
    var that = this;
    var token = wx.getStorageSync("token");
    if (token != "") {
      if (wx.getStorageSync("fromAddress") != "" && wx.getStorageSync("fromAddress") != undefined){
        wx.redirectTo({
          url: '../Input-destination/Input-destination',
        })
      }else{
        wx.showToast({
          title: '上车地点不能为空',
          icon:'loading',
          duration: 2000,
          mask: true
        })
      }
      
    } else {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }
    clearInterval(timer);
  }
})
