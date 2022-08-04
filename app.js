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
  },
};

const nms = new nodeMediaServer(config);

nms.run();
