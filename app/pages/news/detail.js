// pages/news/detail.js
const util = require('../../utils/util.js')
var WxParse = require('../../wxParse/wxParse.js');
import { fetchData, getAuthorizationAndRequestForTokens } from '../tools/network.js';
import constant from '../../services/constant';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: [],
    content: '',
    tags: [],
    // shortday: '',
    isFollow: false,
    isFetchingFollowOption:true,
    comments: [],
    lastCommentId: null,
    isLastComment: false,
    isFetchingComments: false,
    textFocus:false,
    wordCount:0,
    inputCommentText:'',
    showComment:false,
    pageLock:false,
    animationData: {},
    isFetchingLike:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.newsId = options.id;
    this.getdetail(options.id);
    this.getFavInfo(options.id);
    this.getComments(options.id);
  },
  getdetail: function (id) {
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    wx.request({
      url: constant.host + `/api/v6/news/${id}.json`,
      header: {
        'content-type': 'application/json',
        'accept-language': 'zh-CN',
        'client-type':'mini_program'
      },
      success: function (res) {
        console.log(32, res)
        if (res.statusCode == 200) {
          //微信统计
          if (constant.isDev !== true) {
            wx.reportAnalytics('read_news_detail', {
              title: res.data.news.meta_info.title,
              author: res.data.news.base_info.author ? res.data.news.base_info.author : '未注明作者',
            });
          }
          var _news = res.data.news;
          var _content = (_news.base_info.content_for_wx);

          // _content = _content.replace(/(<\/?(?:img|a|p)[^>]*>)|<[^>]+>/ig, '$1');
          // _content = _content.replace(/<img(.*?)src="(.*?)"(.*?)>/ig, '<img src=$2 />');

          let _tags = [];
          _tags.push(_news.base_info['news_type'][0]);

          const tag_types = ['news_sectors', 'tags', 'intel_sources', 'intel_stages'];
          tag_types.forEach(function (tag_type) {
            if (_news.base_info[tag_type]) {
              _tags = _tags.concat(_news.base_info[tag_type]);
            }
          });
          
          // var _date = _news.meta_info.date;
          that.setData({
            detail: _news,
            tags: _tags
            // shortday: util.formatDate(new Date(_date)),
          });
          WxParse.wxParse('content', 'html', _content, that, 5);
          setTimeout(function () {
            wx.hideLoading()
          }, 500);
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  currentScrollTop: 0,

  onPageScroll: function (e) {
    var _title = e.scrollTop > 88 ? this.data.detail.meta_info.title : '易界资讯';
    wx.setNavigationBarTitle({
      title: _title,
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //动画效果
    var animationUp = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this.animationUp = animationUp
    var animationDown = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this.animationDown = animationDown
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
    this.getComments(this.newsId)
  },

  getFavInfo: function (id){
    fetchData('/api/v5/projects/' + id + '/settings.json',false,null,'GET',null,
      (res)=>{
        if (res.data){
          this.setData({
            isFollow: res.data.follow,
            isFetchingFollowOption:false
          })
        }
      },
      (err)=>{
      }
    )
  },

  getComments: function (id) {
    if (this.data.isLastComment || this.data.isFetchingComments) return;
    this.setData({isFetchingComments: true});
    let requestData = {
      'per': 10
    }
    if (this.data.lastCommentId) requestData.comment_id = this.data.lastCommentId;

    fetchData('/api/v6/news/' + id + '/comments.json', false, requestData, 'GET', null,
    (res)=>{
      if (res.data) {
        const comments = res.data.comments;
        let newCommentsData = JSON.parse(JSON.stringify(this.data.comments));

        let isLastComment = false;
        let lastCommentId = null;
        if (comments.length > 0) {
          lastCommentId = comments[comments.length - 1].id;
          newCommentsData = newCommentsData.concat(comments);
        }
        if (comments.length < 10) {
          isLastComment = true;
        }
        if (this.data.comments.length === 0 && comments.length === 0){
          newCommentsData = null;
        }

        this.setData({
          comments: newCommentsData,
          lastCommentId: lastCommentId,
          isLastComment: isLastComment,
          isFetchingComments: false
        })
      }
    },
    (err)=>{
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.detail.meta_info.title,
    }
  },
  handleFav: function (e) {
    if (!getApp().globalData.isAuthorized) return;
    if (this.data.isFetchingFollowOption) return;
    this.setData({ isFetchingFollowOption: true })
    var originalFollowing = this.data.isFollow
    var followOrNot = null

    if (originalFollowing) {
      followOrNot = 'unfollow'
      this.setData({ isFollow: false })
    }
    else {
      followOrNot = 'follow'
      this.setData({ isFollow: true })
    }

    fetchData('/api/v4/projects/' + this.newsId + '/' + followOrNot + '.json', false, null, 'POST', null,
      (res) => {
        this.setData({
          isFetchingFollowOption: false
        })
        if (res.statusCode == 200){
          wx.showToast({
            title: followOrNot == 'follow' ? '收藏成功':'取消收藏',
            icon: "none",
            duration: 1000
          });
        }else{
          this.setData({ isFollow: originalFollowing });
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: "none",
            duration: 1000
          });
        }
      },
      (err) => {
        this.setData({
          isFetchingFollowOption: false,
          isFollow: originalFollowing
        })
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: "none",
          duration: 1000
        });
      }
    )
  },
  toNextNews: function (e) {
    var that = this;
    that.setData({
      nextid: e.currentTarget.dataset.nextid
    })
    console.log('Next News:', that.data.nextid);
    wx.navigateTo({
      url: '/pages/news/detail?id=' + that.data.nextid,
    })
  },

  handleClickAttachment: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.showLoading({ mask: true, title: '加载中' });
      wx.downloadFile({
        url: constant.cdn_host + url,
        success: function (res) {
          console.log(res);
          var filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            success: function (res) {
              wx.hideLoading();
              console.log('打开文档成功')
            }
          })
        }
      })
    }
    else {
      wx.showToast({
        title: '文件异常',
        icon: 'none'
      })
    }
  },

  bindGetUserInfo: function (e) {
    const app = getApp();
    if (app.globalData.isAuthorized) {
      return;
    }
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      getAuthorizationAndRequestForTokens(false, true)
    } else {
      //用户按了拒绝按钮
      wx.hideLoading()
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
    }
  },

  handleClickTag: function (e) {
    const val = e.currentTarget.dataset.val;
    if (val) {
      wx.navigateTo({
        url: '/pages/search/search?t=' + val
      })
    }
  },

  //about comment
  handleComment: function (event) {
    let that = this;
    wx.createSelectorQuery().selectViewport().scrollOffset(function(res){
      that.currentScrollTop = res.scrollTop
    }).exec();
    // console.log(event);
    this.animationUp.translateY(-1000).step({ duration: 400 })
    this.setData({
      showComment: true,
      pageLock: true,
    })
    this.setData({
      animationData: this.animationUp.export()
    })
    setTimeout(function(){
      that.setData({
        textFocus:true
      })
    },500)
  },
  inputCommentText: function (event) {
    this.setData({
      inputCommentText: event.detail.value,
      wordCount: event.detail.value.length,
    })
  },
  pageScroll: function(top) {
    wx.pageScrollTo({
      scrollTop: top,
      duration: 0
    })
  },
  cancelClick: function (event) {
    const that = this;
    this.animationDown.translateY(0).step({ duration: 400 })
    this.setData({
      animationData: this.animationDown.export(),
      inputCommentText: '',
      pageLock: false,
      wordCount:0,
      textFocus: false,
    }, function(){
      setTimeout(function () { that.pageScroll(that.currentScrollTop); }, 20)
    })
    setTimeout(()=>{
      this.setData({
        showComment: false,
      })
    }, 300)
  },
  sendClick: function (event) {
    const that = this;
    var comment = this.data.inputCommentText
    if (!comment || comment.length<=0){
      return;
    }
    comment = this.trimStr(comment)
    if(!comment || comment.length <= 0){
      wx.showToast({
        title: '评论不能为空',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    this.setData({
      inputCommentText: '',
      pageLock: false,
      showComment:false,
      wordCount:0
    }, function () {
      that.pageScroll(that.currentScrollTop);
    })
    const user = wx.getStorageSync(constant.userinfo_key) ? wx.getStorageSync(constant.userinfo_key) : {}
    fetchData('/api/v6/news/' + this.newsId + '/comments.json', false, { 'content': comment, 'user_id': user.id }, 'POST', null,
      (res) => {
        console.log(res)
        if (res.statusCode == 200){
          var newComment = this.data.comments.concat()
          if(newComment && newComment.length>0){
            newComment.unshift(res.data)
          }else{
            newComment = [res.data]
          }
          this.setData({
            comments:newComment
          })
          this.showRemind('评论成功')
        }else if(res.statusCode == 403){
          if(res.data.code == 1){
            this.showRemind('您发表的评论涉及敏感词，评论失败')
          } else if (res.data.code == 2){
            this.showRemind('您多次发表不当言论，现暂停您的评论权限，请联系客服')
          }
        }else{
          this.showRemind('评论失败,请稍后重试')
        }
      },
      (err) => {
        this.showRemind('评论失败,请稍后重试')
      }
    )
  },
  trimStr(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  showRemind(message){
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 1000
    });
  },
  //点赞
  handleLike: function(event){
    if (this.data.isFetchingLike){
      return
    }
    var index = event.currentTarget.dataset.likeindex
    var commentId = event.currentTarget.dataset.commentid
    var isLike = 'like'
    var originLike = this.data.comments[index].is_liked
    var originCount = this.data.comments[index].liked_count

    this.data.comments[index].is_liked = !this.data.comments[index].is_liked
    if (this.data.comments[index].is_liked){
      this.data.comments[index].liked_count = this.data.comments[index].liked_count + 1
      isLike = 'like'
    }else{
      this.data.comments[index].liked_count = this.data.comments[index].liked_count - 1
      isLike = 'unlike'
    }
    this.setData({
      comments:this.data.comments,
      isFetchingLike: true
    })
    const user = wx.getStorageSync(constant.userinfo_key) ? wx.getStorageSync(constant.userinfo_key) : {}
    fetchData('/api/v6/comments/' + commentId + '/' + isLike + '.json', false, { 'user_id': user.id }, 'POST', null,
      (res) => {
        if (res.statusCode == 200) {
          this.setData({
            isFetchingLike: false
          })
        }else{
          this.handleLikeError(index,originLike, originCount)
        }
      },
      (err) =>{
        this.handleLikeError(index,originLike, originCount)
      }
    )
  },
  handleLikeError: function (index,originLike, originCount){
    this.data.comments[index].is_liked = originLike
    this.data.comments[index].liked_count = originCount
    this.setData({
      comments: this.data.comments,
      isFetchingLike: false
    })
  }
})