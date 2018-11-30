// pages/waiting-someone/waiting-someone.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartNum: "鲁UT1138",
    bill: "5",
    latitude: 36.091613,
    longitude: 120.37479,
    markers: [{
      id: 1,
      latitude: 36.091613,
      longitude: 120.37479,
      name: '起点',
      iconPath: '/images/icon_qidiandingwei.png',
      width: 25,
      height: 45
    }],
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  cancelOrder:function(){
    wx.showModal({
      title: '确定要取消订单吗？',
      // content: '确定退出吗？',
      confirmColor: '#fe955c',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})