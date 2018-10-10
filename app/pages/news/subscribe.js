// pages/news/subscribe.js
import { fetchData, refreshUser } from '../tools/network.js';
import constant from '../../services/constant';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    subscribeData: undefined,
    formattedSubscribeData: undefined,
    userInfo: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.setNavigationBarTitle({
      title: '新闻偏好设置'
    })
    wx.getStorage({
      key: constant.userinfo_key,
      success: function (res) {
        that.setData({ userInfo: res.data });
      }
    })
    this.getSubscribeData();
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

  getSubscribeData: function () {
    wx.showLoading();
    fetchData('/api/v6/news/intel_industries.json', false, null, 'GET', null,
      (res) => {
        wx.hideLoading();
        if (res.statusCode != 401) {
          const subscribeData = res.data;
          let newSubscribeData = {};
          for (let i in subscribeData) {
            if (i === 'industry' || i === 'intel_source' || i === 'intel_stage') {
              const key1 = Object.keys(subscribeData[i])[0];
              const key2 = Object.keys(subscribeData[i])[1];
              subscribeData[i][key1].forEach(function (j) {
                if (!newSubscribeData[key1]) newSubscribeData[key1] = [];
                newSubscribeData[key1].push({ 'name': j, 'selected': subscribeData[i][key2].indexOf(j) != -1 ? true : false });
              })
            }
          }
          console.log(subscribeData);
          this.setData({
            subscribeData: subscribeData,
            formattedSubscribeData: newSubscribeData
          });
        }
      },
      (err) => {

      })
  },

  handleClickChannelItem: function (evt) {
    const value = evt.currentTarget.dataset.value;
    const type = evt.currentTarget.dataset.type;
    let newSubscribeData = JSON.parse(JSON.stringify(this.data.formattedSubscribeData));
    for (let i in newSubscribeData[type]) {
      if (newSubscribeData[type][i].name === value) {
        newSubscribeData[type][i].selected = !newSubscribeData[type][i].selected;
        break;
      }
    }
    this.setData({ formattedSubscribeData: newSubscribeData });
  },

  newSubscribeData: {},

  handleClickSave: function () {
    const userInfo = this.data.userInfo;
    let subscription_email = null;
    if (userInfo && this.data.subscribeData.switcher) {
      if (userInfo.subscription_email) {
        subscription_email = userInfo.subscription_email;
      }
      else if (userInfo.email && userInfo.email.indexOf('@dg.fake') == -1 && userInfo.email.indexOf('@wechat.fake') == -1) {
        subscription_email = userInfo.email;
      }
    }
    const subscribeData = this.data.subscribeData;
    const formattedSubscribeData = this.data.formattedSubscribeData;
    console.log(formattedSubscribeData);
    this.newSubscribeData = {
      switcher: subscribeData.switcher ? 1 : 0,
      subscription_email: subscription_email,
      industries: [],
      intel_sources: [],
      intel_stages: []
    };
    for (let i in formattedSubscribeData) {
      for (let j in formattedSubscribeData[i]) {
        if (formattedSubscribeData[i][j].selected === true) {
          this.newSubscribeData[i].push(formattedSubscribeData[i][j].name);
        }
      }
    }
    this.submitSubscribeData(this.newSubscribeData);
  },

  submitSubscribeData: function (data) {
    wx.showLoading();
    fetchData('/api/v6/news/intel_subscribe_setting.json', false, data, 'POST', null,
      (res) => {
        console.log(res);
        wx.hideLoading();
        if (res.statusCode === 200) {
        const newUserInfo = wx.getStorageSync(constant.userinfo_key);
          newUserInfo.news_subscribe_intel_sources = this.newSubscribeData.intel_sources;
          newUserInfo.news_subscribe_intel_stages = this.newSubscribeData.intel_stages;
          newUserInfo.news_subscribe_sectors = this.newSubscribeData.industries;
          wx.setStorageSync(constant.userinfo_key, newUserInfo);
          getApp().globalData.reloadNewsList = true;
          wx.showToast({
            icon: 'none',
            title: '偏好设置已更新'
          });
          setTimeout(function () {
            wx.navigateBack(1);
          }, 500);
        }
      }
    );
  }
})