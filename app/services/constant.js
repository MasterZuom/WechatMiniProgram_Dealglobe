
//此参数用来切换Pre(dev = true) 还是 Production(dev = false) 环境
const dev = true;

//network host
const Pre_Host = "https://pre.dealglobe.com";
const Production_Host = "https://dealglobe.com";
const Pre_Cdn_Host = "https://cdnpre.dealglobe.com";
const Production_Cdn_Host = "https://assets.dealglobe.com";

//local storage key
const Network_Header_Tokens = "Network_Header_Tokens"
const User_Info = "User_Info"

module.exports = {
  host: dev ? Pre_Host : Production_Host,
  cdn_host: dev ? Pre_Cdn_Host : Production_Cdn_Host,
  tokens_key: Network_Header_Tokens,
  userinfo_key: User_Info,
  isDev: dev
}