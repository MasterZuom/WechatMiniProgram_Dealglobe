import { refreshUser } from '../tools/network.js';
import constant from '../../services/constant';

// pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: ''
    })
    refreshUser()
    const user = wx.getStorageSync(constant.userinfo_key);
    if (user && user.name) {
      this.setData({username: user.name});
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  handleClickUserMenuItem: function (evt) {
    console.log(evt.currentTarget.dataset.type);
    switch (evt.currentTarget.dataset.type) {
      case 'news_subs': wx.navigateTo({ url: '../news/subscribe' }); break;
      case 'new_fav': wx.navigateTo({ url: '../news/myCollect' }); break;
      default: return; break;
    }
  }
})