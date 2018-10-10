// pages/news/customizeChannel.js
import { fetchData } from '../tools/network.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    editing: false,
    channels: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.setNavigationBarTitle({
      title: '所有频道'
    })

    wx.getStorage({
      key: 'channels',
      complete: function (res) {
        if (res.data) {
          const channelsData = JSON.parse(res.data);
          that.setChannelsData(channelsData);
        }
        else {
          that.getChannelData();
        }
      }
    })
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

  handleClickChannelEdit: function () {
    if (this.data.editing) {
      this.saveShannels();
    }
    this.setData({editing: !this.data.editing});
  },

  handleClickChannelItem: function(evt) {
    const value = evt.currentTarget.dataset.value;
    if (value === 'subscribe' || value === 'recommended') return;
    let newChannels = JSON.parse(JSON.stringify(this.data.channels));
    for (let i in newChannels) {
      if (newChannels[i].value === value){
        if (!this.data.editing && newChannels[i].selected) return;
        newChannels[i].selected = !newChannels[i].selected;
        break;
      }
    }
    this.setData({channels: newChannels});
  },

  setChannelsData: function(data) {
    const that = this;
    if (data.length > 0) {
      that.setData({ channels: data });
    }
    else {
      this.setData({ channels: [] });
    }
  },

  getChannelData: function () {
    fetchData('/api/v5/configurations/system_default', false, null, 'GET', null,
      (res) => {
        console.log(res);
        var taps = res.data ? res.data.nav_tab : [];
        var allTaps = [{ 'name': '推荐', 'value': 'subscribe' }, { 'name': '头条', 'value': 'recommended' }].concat(taps)
        this.setChannelsData(allTaps);
      },
      (err) => {

      })
  },

  saveShannels: function () {
    wx.setStorageSync("channels", JSON.stringify(this.data.channels));
    getApp().globalData.reloadNewsList = true;
  },

  handleClickSave: function() {
    this.saveShannels();
    wx.navigateBack({
      delta: 1
    });
  }
})