var APPKEY = '56a0a88c4407a3cd028ac2fe';
var TOPIC_BULLET = 'bullet'
var TOPIC_LIKE = 'like'

function set_layout() {
  var player = $('#my-player');
  var bullet = $('#my-comment-stage');
  player.css("width", "100%");
  player.height(player.width() * 9 / 16.0);

  bullet.css("width", "100%");

  var video = $('#live-video');
  video.width(player.width());
  video.height(player.height());
  video.css("display", "block");

  var cm = new CommentManager(document.getElementById('my-comment-stage'));
  cm.init();
  cm.start();

  window.cm = cm;
}

$(document).ready(function() {
  window.onresize = set_layout;
  set_layout();

  videojs("live-video", {
    "techOrder": ["flash", "html5"],
    "controls": "false",
    "autoplay": "false",
    "preload": "auto"
  }, function() {
    var player = this;
    player.play();
  });

  // var bullet = {
  //   "mode": 1,
  //   "text": "Hello CommentCoreLibrary",
  //   "color": 0xff0000
  // };

  // cm.send(bullet);

  window.yunba = new Yunba({
    server: 'sock.yunba.io',
    port: 3000,
    appkey: APPKEY
  });

  // 初始化云巴 SDK
  yunba.init(function(success) {
    if (success) {
      var cid = Math.random().toString().substr(2);
      console.log('cid: ' + cid);

      // 连接云巴服务器
      yunba.connect_by_customid(cid,
        function(success, msg, sessionid) {
          if (success) {
            console.log('sessionid：' + sessionid);

            // 设置收到信息回调函数
            yunba.set_message_cb(yunba_msg_cb);

            // 设置别名
            yunba.set_alias({
              'alias': cid
            }, function(data) {

              // 订阅弹幕 TOPIC
              yunba.subscribe({
                  'topic': TOPIC_BULLET
                },
                function(success, msg) {
                  if (success) {
                    console.log('subscribed');

                    // 订阅弹幕 TOPIC 下的实时在线信息
                    yunba.subscribe_presence({
                        'topic': TOPIC_BULLET
                      },
                      function(success, msg) {
                        if (success) {
                          console.log('subscribed');

                          // 订阅点赞 TOPIC
                          yunba.subscribe({
                              'topic': TOPIC_LIKE
                            },
                            function(success, msg) {
                              if (success) {
                                console.log('subscribed');
                                yunba_sub_ok();
                                // msg_notify('success', '连接服务器成功~');
                              } else {
                                console.log(msg);
                                // msg_notify('error', msg);
                              }
                            }
                          );
                        } else {
                          console.log(msg);
                          // msg_notify('error', msg);
                        }
                      }
                    );
                  } else {
                    console.log(msg);
                    // msg_notify('error', msg);
                  }
                }
              );
            });

          } else {
            console.log(msg);
            // msg_notify('error', msg);
          }
        });
    } else {
      console.log('yunba init failed');
      // msg_notify('error', '连接出错，请尝试刷新~');
    }
  });
});

$('#btn-send').click(function() {
  var mode = 1;
  switch ($('#bullet-type').prop('selectedIndex')) {
    case 0:
      mode = 2;
      break;

    case 1:
      mode = 1;
      break;

    case 2:
      mode = 4;
      break;

    case 3:
      mode = 5;
      break;

    case 4:
      mode = 6;
      break;
  }
  var text = $('#bullet-text').val();
  var color = parseInt('0x' + $('#bullet-color').val());

  var bullet = {
    "mode": mode,
    "text": text,
    "color": color
  };
  // console.log(bullet);
  // cm.send(bullet);
  yunba.publish({
      topic: TOPIC_BULLET,
      msg: JSON.stringify(bullet)
    },
    function(success, msg) {
      if (!success) {
        console.log(msg);
      }
    }
  );
});

$('#btn-like').click(function() {
  yunba.publish({
      topic: TOPIC_LIKE,
      msg: 'like'
    },
    function(success, msg) {
      if (!success) {
        console.log(msg);
      }
    }
  );
});

function yunba_msg_cb(data) {
  // console.log(data);
  if (data.topic === TOPIC_BULLET) {
    cm.send(JSON.parse(data.msg));
  } else if (data.topic === TOPIC_LIKE) {
    var num = parseInt($('#like-number').text()) + 1;
    $('#like-number').text(num);
    show_like_animate();
  } else if (data.topic === TOPIC_BULLET + '/p') {
    var msg = JSON.parse(data.msg);
    if (msg.action === 'join') {
      var num = parseInt($('#online-number').text()) + 1;
      $('#online-number').text(num);
    } else if (msg.action === 'offline') {
      var num = parseInt($('#online-number').text()) - 1;
      if (num < 1) {
        num = 1;
      }
      $('#online-number').text(num);
    }
  }
}

function yunba_sub_ok() {
  $('#span-status').text('连接云巴服务器成功～');
  setTimeout(function() {
    $('#form-status').css("display", "none");
    $('#form-info').css("display", "block");
  }, 1000);
}

function show_like_animate() {
  var bullet = {
    "mode": 4,
    "text": "like",
    "color": 0xff0000,
    "dur": 10000
  };

  cm.send(bullet);
}


// ❤ ❤ ♬ ♬
// <d p="147.80000305176,7,24,6736896,1340976721,1,9bd49c01,104077707">
// ["390","87","1-0","1.5","♬","0","0","425","122","1500","0","false","宋体","0"]
// </d>