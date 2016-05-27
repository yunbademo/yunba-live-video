var APPKEY = '56a0a88c4407a3cd028ac2fe';
var TOPIC_BULLET = 'bullet'
var TOPIC_LIKE = 'like'

videojs("live-video", {
  "techOrder": ["flash", "html5"],
  "controls": "false",
  "autoplay": "false",
  "preload": "auto"
}, function() {
  var player = this;
  player.play();
});

$(document).ready(function() {
  var cm = new CommentManager(document.getElementById('my-comment-stage'));
  cm.init();
  cm.start();

  window.cm = cm;

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

  yunba.init(function(success) {
    if (success) {
      var cid = Math.random().toString().substr(2);
      console.log('cid: ' + cid);
      yunba.connect_by_customid(cid,
        function(success, msg, sessionid) {
          if (success) {
            console.log('sessionid：' + sessionid);
            yunba.subscribe({
                'topic': TOPIC_BULLET
              },
              function(success, msg) {
                if (success) {
                  console.log('subscribed');
                  // msg_notify('success', '连接服务器成功~');
                } else {
                  console.log(msg);
                  // msg_notify('error', msg);
                }
              }
            );
            yunba.subscribe({
                'topic': TOPIC_LIKE
              },
              function(success, msg) {
                if (success) {
                  console.log('subscribed');
                  // msg_notify('success', '连接服务器成功~');
                  yunba.set_message_cb(yunba_msg_cb);
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
        });
    } else {
      console.log('yunba init failed');
      // msg_notify('error', '连接出错，请尝试刷新~');
    }
  });
});

function process_data(data) {
  // console.log(data.msg);
  var xys = JSON.parse(data.msg);
  // cm.send(bullet);
}

$('#btn-send').click(function() {
  var mode = 1;
  switch ($('#bullet-type').prop('selectedIndex')) {
    case 0:
      mode = 1;
      break;

    case 1:
      mode = 2;
      break;

    case 2:
      mode = 5;
      break;

    case 3:
      mode = 4;
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
  if (data.topic == TOPIC_BULLET) {
    cm.send(JSON.parse(data.msg));
  } else if (data.topic == TOPIC_LIKE) {
    var num = parseInt($('#like-number').text()) + 1;
    $('#like-number').text(num);
  }
}