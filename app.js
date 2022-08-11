const nodeMediaServer = require('node-media-server');
const config = {
  rtmp: {
    port: 3001,
    chunk_size: 6000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 3002,
    allow_origin: '*',
    mediaroot: './media', // hls保存的文件夹
  },
  trans: {
    ffmpeg: '/usr/local/bin/ffmpeg', // 使用ffmpeg将rtmp流转成m3u8(hls)格式
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: false, // 防止在结束流后删除文件
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
      },
    ],
  },
};

const nms = new nodeMediaServer(config);

nms.run();
