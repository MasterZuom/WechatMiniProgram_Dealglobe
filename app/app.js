import { requestForUserTokens } from './pages/tools/network.js';
const Network_Header_Tokens = "Network_Header_Tokens"

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //获取存在本地的用户 Tokens 信息
    var userTokens = wx.getStorageSync(Network_Header_Tokens)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
        
    //   }
    // })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          this.globalData.isAuthorized = true

          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              //如果本地不存在用户信息(Tokens),则去请求用户信息
              if (!userTokens) {
                requestForUserTokens(false, false, res.encryptedData, res.iv)
              }

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }else{
          this.globalData.isAuthorized = false
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    isAuthorized: false,
    reloadNewsList: false,
    isFetchingUserInfo:false
  }
})