// pages/news/list.js
import { fetchData, getAuthorizationAndRequestForTokens } from '../tools/network.js';
import { showTimeStream } from '../tools/tools.js';
import constant from '../../services/constant';

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeChannel: 'subscribe',
    channels: undefined,
    newsListParams: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getChannelData();
    
    const newsTypeParams = this.getNewsTypeParams();
    this.setData({ newsListParams: newsTypeParams });

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
    const app = getApp();
    if (app.globalData.reloadNewsList) {
      const channels = this.data.channels;
      const newsTypeParams = this.getNewsTypeParams();
      if (channels) {
        this.setChannelsData(channels);
        if (JSON.stringify(channels).indexOf(this.data.activeChannel) != '-1') {
          this.setData({
            activeChannel: 'subscribe',
            newsListParams: newsTypeParams,
          });
          this.newsList.getNewsListData(true);
        }
      }
      app.globalData.reloadNewsList = false;
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
  
  },

  getNewsTypeParams: function () {
    const userInfo = wx.getStorageSync(constant.userinfo_key);
    let params;
    if (userInfo && (userInfo.news_subscribe_sectors || userInfo.news_subscribe_intel_stages || userInfo.news_subscribe_intel_sources)) {
      params = {
        'type': 'subscribe',
        'news_industries': userInfo.news_subscribe_sectors || [],
        'intel_stages': userInfo.news_subscribe_intel_stages || [],
        'intel_sources': userInfo.news_subscribe_intel_sources || []
      }
    }
    else {
      params = { 'type': 'all' };
    }
    return params;
  },

  getChannelData: function() {
    fetchData('/api/v5/configurations/system_default', false, null, 'GET', null,
      (res) => {
        var taps = res.data ? res.data.nav_tab : [];
        var allTaps = [{ 'name': '推荐', 'value': 'subscribe' }, { 'name': '头条', 'value': 'recommended' }].concat(taps);
        this.setChannelsData(allTaps);
      },
      (err)=>{

      })
  },

  handleClickSearchButton: function() {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  handleClickCustomizeChannelButton: function () {
    wx.navigateTo({
      url: '../news/customizeChannel'
    })
  },

  handleClickUserButton: function () {
    if (app.globalData.isAuthorized){
      wx.navigateTo({
        url: '../user/user'
      })
    }else{
      wx.showLoading({ title: '请稍后...', mask: true });
    }
  },

  bindGetUserInfo: function (e) {
    if (app.globalData.isAuthorized){
      return;
    }
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      getAuthorizationAndRequestForTokens(false,true)
    } else {
      //用户按了拒绝按钮
      wx.hideLoading()
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
    }
  },

  channelTapClick:function (e){
    if (this.data.activeChannel != e.currentTarget.dataset.value){
      this.setData({
        activeChannel: e.currentTarget.dataset.value,
        newsListParams: { 'tab': e.currentTarget.dataset.value }
      })
      this.newsList.refreshNewsList()
    }
  },

  setChannelsData: function (data) {
    const that = this;
    let newData;
    if (data.length > 0) {
      newData = JSON.parse(JSON.stringify(data));
      wx.getStorage({
        key: 'channels',
        complete: function (res) {
          for (let i in newData) {
            newData[i].selected = res.data ? (JSON.parse(res.data)[i].selected ? true : false) : true;
          }
          that.setData({ channels: newData });
          wx.setStorageSync("channels", JSON.stringify(newData));
        }
      })
    }
    else {
      this.setData({ channels: [] });
      wx.setStorageSync("channels", JSON.stringify(newData));
    }
  }
})