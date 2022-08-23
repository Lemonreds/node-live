const nodeMediaServer = require('node-media-server');

const args = process.argv.slice(2);
const useHls = args.length > 0;

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
  // 使用ffmpeg将rtmp流转成m3u8(hls)格式
  // 需要ffmpeg支持
  trans: useHls
    ? {
        // 这里要修改成你的 ffmpeg 应用地址
        ffmpeg: '/usr/local/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            hlsKeep: false,
            dash: true,
            dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
          },
        ],
      }
    : null,
};

const nms = new nodeMediaServer(config);

nms.run();
