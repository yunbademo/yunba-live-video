使用 [云巴][1] 服务实现的视频直播案例，访问 [在线演示地址][2]。

弹幕及点赞
--------

使用 [云巴 Javascript SDK][3] 实时地将某个用户的弹幕及点赞信息分发给所有用户。

视频流
--------

使用了阿里云的视频直播服务来实现视频流的分发。播放时有两种格式，支持 Flash 的浏览器会优先播放 RTMP 视频流，而不支持 Flash 的浏览器（如 iOS 上的 Safari）会播放 HLS 格式视频流，由于阿里云 HLS 转码所需时间较长，所以播放 HLS 时视频延时会比较大。

浏览器兼容性
--------

当浏览器不支持 Flash 时，播放器会尝试播放 HLS 格式视频流，它需要从阿里云服务器下载一个 m3u8 索引文件，这是 HTTP 协议的，但有些浏览器禁止跨域下载，包括 PC 端的 Chrome，Firefox，Internet Explorer，如果使用上述浏览器，请确认其支持 Flash。

[1]: http://yunba.io/
[2]: http://yunbademo.github.io/yunba-live-video/
[3]: http://yunba.io/docs2/Javascript_SDK/

