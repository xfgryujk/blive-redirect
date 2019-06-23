(function () {
  // 来自https://ddalice.site/，暂时写死
  let redirectUrl = 'https://wansu-china-pull-rtmp-17.winwinsun.com/vod/ff585369-a310-49d3-a79e-63767bc2deaf.flv'
  // 防止B站加参数时不加'?'
  if (redirectUrl.indexOf('?') === -1) {
    redirectUrl += '?_='
  }

  // hook AJAX，重定向视频URL
  let realAjax = window.$.ajax
  window.$.ajax = function (settings, b) {
    let res = realAjax.call(this, settings, b)
    if (settings.url.indexOf('api.live.bilibili.com/room/v1/Room/playUrl') === -1) {
      return res
    }
    res.done(rsp => {
      let fakeRsp = {
        code: 0,
        data: {
          accept_quality: ['4'],
          current_qn: 4,
          current_quality: 4,
          durl: [{
            length: 0,
            order: 1,
            stream_type: 0,
            url: redirectUrl
          }],
          quality_description: [{qn: 4, desc: '原画'}]
        },
        message: 'OK.',
        msg: 'OK.'
      }
      for (let name in fakeRsp) {
        rsp[name] = fakeRsp[name]
      }
    })
    return res
  }

  // hook DanmakuWebSocket，伪开播
  let realInitialize = window.DanmakuWebSocket.prototype.initialize
  window.DanmakuWebSocket.prototype.initialize = function (config) {
    window.setTimeout(() => {
      this.ws.options.onReceivedMessage({cmd: 'LIVE', roomid: window.BilibiliLive.ROOMID})
    }, 100)
    return realInitialize.call(this, config)
  }

  // 触发AJAX获取视频URL，以及重新载入DanmakuWebSocket
  window.EmbedPlayer.instance.reload()
})()
