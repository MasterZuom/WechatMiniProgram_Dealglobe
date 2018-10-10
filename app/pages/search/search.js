
const kNewsSearchHistoryTags = "kNewsSearchHistoryTags"

// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsListParams: {},
    inputText:null,
    isShowResult:false,
    searchCount:0,
    newsSearchHistoyTags:null,
    searchFocus: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '搜索'
    })
    this.newsList = this.selectComponent("#newsList");
    if (options.t){
      this.setData({
        inputText: options.t,
        searchFocus: false
      })
      this.searchClick(null, options.t);
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
    this.newsList.fetchNextPage()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  onMyEvent: function (e) {
    this.setData({ searchCount: e.detail.count })
  },

  searchClick: function (event, text){
    if (event && !event.detail.value){
      wx.showToast({
        title: "请输入搜索内容",
        icon:"none"
      });
      return;
    }
    var noSpaceText = event ? this.trimStr(event.detail.value) : this.trimStr(text);
    this.setData({
      newsListParams: { 'text': noSpaceText },
      isShowResult: true
    },()=>{
      this.newsList = this.selectComponent("#newsList")
      this.newsList.refreshNewsList()
    });
    if (noSpaceText) {
      this.setHistoryTags(noSpaceText);
    }
  },

  inputSearchText: function (event) {
    this.setData({
      inputText: event.detail.value,
    })
  },

  inputGetFocus: function (event) {
    this.setData({
      isShowResult: false,
      searchCount: 0,
    })
    this.getHistoryTags()
  },

  tagsClick: function (event) {
    console.log(event.currentTarget.dataset.text)
    this.setData({
      newsListParams: { 'text': event.currentTarget.dataset.text },
      isShowResult: true,
      inputText: event.currentTarget.dataset.text
    }, () => {
      this.newsList = this.selectComponent("#newsList")
      this.newsList.refreshNewsList()
    });
    this.setHistoryTags(event.currentTarget.dataset.text);
  },

  deleteClick: function (event) {
    this.setData({ inputText: null})
  },

  setHistoryTags: function(value){
    wx.getStorage({
      key: kNewsSearchHistoryTags,
      complete: function (res) {
        if (res.data) {
          var historyTags = JSON.parse(res.data);
          var index = historyTags.indexOf(value);
          if (index != -1){
            historyTags.splice(index,1);
          }
          var newsTags = [value].concat(historyTags);
          if(newsTags.length>10){
            newsTags.pop();
          }
          wx.setStorageSync(kNewsSearchHistoryTags, JSON.stringify(newsTags));
        } else {
          wx.setStorageSync(kNewsSearchHistoryTags, JSON.stringify([value]));
        }
      }
    })
  },

  getHistoryTags: function(){
    let that = this;
    wx.getStorage({
      key: kNewsSearchHistoryTags,
      success: function (res) {
        if (res.data) {
          var historyTags = JSON.parse(res.data);
          that.setData({ newsSearchHistoyTags: historyTags })
        }
      },
      complete: function (res) {
        
      }
    })
  },

  //remove space
  trimStr: function(str){
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }
})