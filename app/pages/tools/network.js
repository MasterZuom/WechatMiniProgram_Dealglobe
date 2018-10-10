import constant from '../../services/constant'

export function currentHost(){
  var host,cdn_host;
  host = constant.host;
  cdn_host = constant.cdn_host;
  return { host: host, cdnHost: cdn_host}
}

//获取 用户本地授权信息,并发送给服务器，获取 属于我们后台的 用户信息和Tokens
export function getAuthorizationAndRequestForTokens(isShowLoading, isAuthorize){
  if (isShowLoading) {
    wx.showLoading({ title: '请稍后...', mask: true });
  }
  wx.getSetting({
    success: res => {
      if (res.authSetting['scope.userInfo']) {
        getApp().globalData.isAuthorized = true;
        // 已经授权，可以直接调用 getUserInfo
        wx.getUserInfo({
          success: res => {
            requestForUserTokens(isShowLoading, isAuthorize, res.encryptedData, res.iv)
          }
        })
      }
    }
  })          
}

//用于 获取用户信息 和 access-token 并存在本地 （此方法调用前一定要确认用户已授权，否则会报错）
export function requestForUserTokens(isShowLoading, isAuthorize, encryptedData, iv) {
  getApp().globalData.isFetchingUserInfo = true;
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      console.log('code:  ' + res.code + '  encryptedData:  ' + encryptedData + '  iv: ' + iv)
      wx.request({
        url: currentHost().host + '/api/v5/sessions/miniprogram.json',
        data: { 'code': res.code, 'encryptedData': encryptedData, 'iv':iv },
        header: { 'client-type': 'mini_program' },
        method: 'POST',
        success: function (res) {
          console.log('授权后请求服务器User数据结果:  ' + JSON.stringify(res))
          if (res.statusCode == '200') {
            //save tokens
            var userTokens = { 'access-token': res.header['access-token'], 'uid': res.header['uid'], 'client': res.header['client'], 'token-type': res.header['token-type'] }
            wx.setStorageSync(constant.tokens_key, JSON.stringify(userTokens));
            //save user info
            var userInfo = res.data && res.data.data && res.data.data.user ? res.data.data.user : null
            if(userInfo){
              wx.setStorageSync(constant.userinfo_key, userInfo);
            }
            if (isAuthorize){
              wx.showToast({
                title: '授权成功',
                icon: 'success'
              })
            }
          }else{
            //如果 miniprogram 接口 返回 非 200
            if (isAuthorize){
              wx.showToast({
                title: '授权失败，请稍后重试',
                icon: "none"
              })
            }
          }
          getApp().globalData.isFetchingUserInfo = false;
          if (isShowLoading) {
            wx.hideLoading()
          }
        },
        fail: function (err) {
          getApp().globalData.isFetchingUserInfo = false;
          if (isShowLoading) {
            wx.hideLoading()
          }
          if(isAuthorize){
            wx.showToast({
              title: '授权失败，请稍后重试',
              icon: "none"
            })
          }
          console.log(err)
        }
      })
    }
  })
}

//此网络请求的 header 会默认带上 access-token（如果本地存有的话）
export function fetchData(url, isUseCDN, params, method = "GET", header = {}, success, fail) {
  let requestData;
  //handle url
  var requestUrl = isUseCDN ? currentHost().cdnHost + url : currentHost().host + url; 
  if (url.includes("http://") || url.includes("https://")) {
    requestUrl = url;
  }
  
  if (method.toUpperCase() == "GET") {
    requestUrl += ('?' + parseParamsForRails(params));
    requestData = '';
  }
  else {
    requestData = params;
  }

  //handle header
  var requestHeader = {};
  requestHeader['content-type'] = 'application/json';
  requestHeader['client-type'] = 'mini_program';
  requestHeader['accept-language'] = 'zh-CN';
  if (header){
    for (var i in header){
      requestHeader[i] = header[i]
    }
  }

  //get user token
  try {
    var value = wx.getStorageSync(constant.tokens_key)
    if (value) {
      var userTokens = JSON.parse(value)
      for (var i in userTokens) {
        requestHeader[i] = userTokens[i]
      }
    }
  } catch (e) {
    
  }

  console.log('send request: ' + requestUrl + ' + Header:'+JSON.stringify(requestHeader))

  wx.request({
    url: requestUrl,
    data: requestData,
    header: requestHeader,
    method: method,
    success: function (res) {
      //遇到401，清除本地 用户信息 和 tokens 信息
      if (res.statusCode.toString() == '401'){
        //remove tokens and user info
        wx.removeStorageSync(constant.tokens_key)
        wx.removeStorageSync(constant.userinfo_key)
        wx.showModal({
          title: '提示',
          content: '用户数据获取异常，点击重试',
          showCancel:false,
          success: function (res) {
            if (res.confirm) {
              //点击确定后，重新获取用户信息（tokens + userinfo）
              getAuthorizationAndRequestForTokens(true,false)
              wx.navigateBack()
            } 
          }
        })
        return;
      }

      if(success){
        success(res)
      }else{

      }
    },
    fail: function (err) {
      if(fail){
        fail(err)
      }else{

      }
    }
  })
}

// handle params
function parseParamsForRails(params) {
  var reqParams = [];
  for (var property in params) {
    if (Array.isArray(params[property])) {
      for (var item in params[property]) {
        var encodedKey = encodeURIComponent(property + "[]");
        var value = params[property][item];

        if (typeof (value) == 'object') // we get {p:[{max:"a",min:"b"},{max:"c", min:"d"}]} like data
        {
          for (var subKey in value) {
            encodedKey = encodeURIComponent(subKey);
            reqParams.push(encodedKey + "=" + encodeURIComponent(value[subKey]));
          }
        } else {
          var encodedValue = encodeURIComponent(params[property][item]);
          reqParams.push(encodedKey + "=" + encodedValue);
        }

      }
    } else {
      let value = params[property];

      if (typeof (value) == 'object') // we get {p:[{max:"a",min:"b"},{max:"c", min:"d"}]} like data
      {
        for (var subKey in value) {
          encodedKey = encodeURIComponent(property + "[" + subKey + "]");
          reqParams.push(encodedKey + "=" + encodeURIComponent(value[subKey]));
        }
      } else {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(params[property]);
        reqParams.push(encodedKey + "=" + encodedValue);
      }
    }
  }
  reqParams = reqParams.join("&");

  return reqParams;
}

//refresh user info
export function refreshUser() {
  var user = wx.getStorageSync(constant.userinfo_key)
  var userId = user ? user.id: null;
  if (getApp().globalData.isFetchingUserInfo){
    return
  }
  fetchData(currentHost().host + '/api/v4/users/' + userId, false, null, 'GET',null,
    (res)=>{
      if (res.statusCode == '200') {
        //save user info
        var userInfo = res.data && res.data.data && res.data.data.user ? res.data.data.user : null
        wx.setStorage({
          key: constant.userinfo_key,
          data: userInfo,
        })
      }
    },
    (err)=>{

    }
  )
}




