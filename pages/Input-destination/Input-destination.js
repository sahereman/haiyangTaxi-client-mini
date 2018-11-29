// pages/Input-location/Input-location.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nearAdsArr: []

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
    var that = this;
    that.data.nearAdsArr.push({ "name": "汽车东站", "address": "山东省青岛市城阳区" }, { "name": "汽车东站", "address": "山东省青岛市城阳区" });

    that.setData({
      nearAdsArr: that.data.nearAdsArr,
    });
    console.log(that.data.nearAdsArr);
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
  cancel: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  }
})