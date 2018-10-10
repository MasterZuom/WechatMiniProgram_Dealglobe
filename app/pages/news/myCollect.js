import { currentHost } from '../tools/network.js';

// pages/news/myCollect.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsListParams: { "type": "follow" },
    firstPageUrl: currentHost().host + '/api/v6/news.json',
    nextPageUrl: currentHost().host + '/api/v6/news.json',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '收藏'
    })
    this.newsList = this.selectComponent("#newsList");
    this.newsList.getNewsListData(true);
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
    this.newsList.getNewsListData(false)
    wx.stopPullDownRefresh()
    // wx.showNavigationBarLoading()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.newsList.fetchNextPage()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})