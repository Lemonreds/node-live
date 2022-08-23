### node-media-server 流媒体 Demo

1. npm install

2. 使用rtmp流 ：npm run start，使用hls流： npm run start:hls

3. 打开 obs，设置推流地址

服务器 rtmp://localhost:3001/live
串流密钥 test (可以任意填写)

则推流地址为：

rtmp://localhost:3001/live/test

4. 打开 VLC 或者其他流媒体播放器

拉流地址
rtmp://localhost:3001/live/test

flv 格式拉流地址
http://localhost:3002/live/test.flv

5. 转成 hls 格式，配置 trans

拉流地址
http://localhost:3002/live/test/index.m3u8
