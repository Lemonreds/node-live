### node-media-server 流媒体Demo

1. npm install

2. npm run start

3. 打开obs，设置推流地址

服务器 rtmp://localhost:3001/live 
串流密钥 test (可以任意填写)

则推流地址为： 

rtmp://localhost:3001/live/test


4. 打开vls或者其他流媒体播放器

拉流地址
rtmp://localhost:3001/live/test

flv格式
http://localhost:3002/live/test.flv
