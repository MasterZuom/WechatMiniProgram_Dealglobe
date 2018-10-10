// pages/components/newsList.js

import { fetchData, getAuthorizationAndRequestForTokens } from '../tools/network.js';
// import { showTimeStream } from '../tools/tools.js';
var app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    params:{
      type: Object,
      value:{}
    },
    firstPageUrl:{
      type: String,
      value:'/api/v6/news/first_page'
    },
    nextPageUrl:{
      type: String,
      value: '/api/v6/news.json'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    listData: null,
    listTotalPageCount: 0,
    listCurrentPageCount: 0,
    isLoadingMore: false,
    isLoadingComplete: false,
    isEmptyNewsArr:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //first load news list data
    getNewsListData: function(isShowLoading) {
      if (isShowLoading) {
        wx.showLoading({ title: '加载中', })
      }
      var params = { ...this.data.params }
      console.log(params)
      fetchData(this.data.firstPageUrl, true, params, 'GET', null,
        (res) => {
          if (isShowLoading) {
            wx.hideLoading()
          }
          // wx.hideNavigationBarLoading()
          var newsListData = res.data ? res.data.news : null
          var currentPage = res.data && res.data.meta ? res.data.meta.current_page : 0
          var totalPage = res.data && res.data.meta ? res.data.meta.total_page_count : 0
          var totalCount = res.data && res.data.meta ? res.data.meta.total_count : 0
          this.triggerEvent('myevent', { 'count': totalCount} , {})
          //handle publish time
          // if (newsListData) {
          //   for (let i in newsListData) {
          //     newsListData[i].published_at = showTimeStream(newsListData[i].published_at)
          //   }
          // }
          //is show no more
          var isLoadingComplete = false
          if (currentPage <= 1) {
            isLoadingComplete = true
          }
          this.setData({
            listData: newsListData,
            listTotalPageCount: totalPage,
            listCurrentPageCount: currentPage,
            isLoadingComplete: isLoadingComplete,
            isEmptyNewsArr: (!newsListData || newsListData.length == 0)?true:false
          })
        },
        (err) => {

        }
      )
    },

    //fetch next page
    fetchNextPage: function () {
      if (this.data.isLoadingMore) return;
      if (this.data.listCurrentPageCount <= 1 || this.data.listTotalPageCount <= 1) {
        this.setData({ isLoadingMore: false });
        return;
      }
      //load more
      this.setData({ isLoadingMore: true });
      var params = { ...this.data.params };
      params['page'] = this.data.listCurrentPageCount - 1;
      fetchData(this.data.nextPageUrl, true, params, 'GET', null,
        (res) => {
          var newsListData = this.data.listData.concat();
          var currentNewsListData = res.data ? res.data.news : null
          var currentPage = res.data && res.data.meta ? res.data.meta.current_page : 0
          var totalPage = res.data && res.data.meta ? res.data.meta.total_page_count : 0
          //handle time
          if (currentNewsListData) {
            // for (let i in currentNewsListData) {
            //   currentNewsListData[i].published_at = showTimeStream(currentNewsListData[i].published_at)
            // }
            newsListData = newsListData.concat(currentNewsListData)
          }
          //is show no more
          var isLoadingComplete = false
          if (currentPage <= 1) {
            isLoadingComplete = true
          }
          this.setData({
            listData: newsListData,
            listTotalPageCount: totalPage,
            listCurrentPageCount: currentPage,
            isLoadingMore: false,
            isLoadingComplete: isLoadingComplete
          })
        },
        (err) => {

        }
      )
    },

    _getSearchCount(){
      return 8;
    },

    refreshNewsList: function () {
      this.setData({
        listData: null,
        listTotalPageCount: 0,
        listCurrentPageCount: 0,
        isLoadingMore: false,
        isLoadingComplete: false
      });
      this.getNewsListData(true);
    },

    newsClick: function (e) {
      var that = this;
      that.setData({
        id: e.currentTarget.dataset.id
      })
      console.log('点我:', that.data.id);

      if (app.globalData.isAuthorized) {
        wx.navigateTo({
          url: '/pages/news/detail?id=' + that.data.id,
        })
      } else {
        wx.showLoading({ title: '请稍后...', mask: true });
      }
    },

    bindGetUserInfo: function (e) {
      if (app.globalData.isAuthorized) {
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
  }
})
