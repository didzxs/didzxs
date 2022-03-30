import request from './request';
import wx from 'weixin-js-sdk';

const wechatShare = (shareObj, wechatParams, callback) => {
  const url = window.location.href;
  const query = {
    action: 'config',
    url: url
  };
  request({url: '/api/wechat/auth/', method: 'GET', params: query})
    .then(ret => {
      if(ret) {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: ret.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
          timestamp: ret.timestamp, // 必填，生成签名的时间戳
          nonceStr: ret.nonceStr, // 必填，生成签名的随机串
          signature: ret.signature, // 必填，签名，见附录1
          jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone", "chooseWXPay", "chooseImage", "uploadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      }
      
      wx.ready(function () {
        if (wechatParams) {
          wx.chooseWXPay({
            timestamp: wechatParams.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
            nonceStr: wechatParams.nonceStr, // 支付签名随机串，不长于 32 位
            package: wechatParams.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
            signType: wechatParams.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
            paySign: wechatParams.paySign, // 支付签名
            appId: wechatParams.appId,
            success: function (res) {
              // 支付成功后的回调函数
              if (callback) {
                callback();
              }
            }
          });
        }
        wx.onMenuShareAppMessage({
          title: shareObj.title, // 分享标题
          desc: shareObj.desc, // 分享描述
          link: shareObj.link ? shareObj.link : url, // 分享链接，该链接域名必须与当前企业的可信域名一致
          imgUrl: shareObj.img, // 分享图标
          type: "", // 分享类型,music、video或link，不填默认为link
          dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareTimeline({
          title: shareObj.ctitle, // 分享标题
          link: shareObj.link ? shareObj.link : url, // 分享链接，该链接域名必须与当前企业的可信域名一致
          imgUrl: shareObj.img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareQQ({
          title: shareObj.title, // 分享标题
          desc: shareObj.desc, // 分享描述
          link: shareObj.link ? shareObj.link : url, // 分享链接
          imgUrl: shareObj.img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareWeibo({
          title: shareObj.title, // 分享标题
          desc: shareObj.desc, // 分享描述
          link: shareObj.link ? shareObj.link : url, // 分享链接
          imgUrl: shareObj.img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
        wx.onMenuShareQZone({
          title: shareObj.title, // 分享标题
          desc: shareObj.desc, // 分享描述
          link: shareObj.link ? shareObj.link : url, // 分享链接
          imgUrl: shareObj.img, // 分享图标
          success: function () {
            // 用户确认分享后执行的回调函数
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      });
    });
};

export default wechatShare;
