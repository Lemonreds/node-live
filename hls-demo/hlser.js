/* eslint-disable no-undef */
// 默认配置
const DEFAULTS = {
  element: '', // video element
};

// Videojs的配置文件
const VIDEOJS_LIVE_CONFIG = {
  html5: {
    vhs: {
      withCredentials: false,
    },
  },
  liveui: false,
  autoplay: false,
  controls: true,
  muted: false,
  fluid: true,
  controlBar: {
    children: [
      { name: 'playToggle' }, // 播放按钮
      { name: 'liveDisplay' },
      { name: 'progressControl' }, // 播放进度条
      { name: 'durationDisplay' }, // 总时间
      { name: 'remainingTimeDisplay' }, // 剩下的时间
      {
        name: 'volumePanel', // 音量控制
        inline: false, // 不使用水平方式
      },
      { name: 'FullscreenToggle' }, // 全屏
    ],
  },
  preload: true,
  loadingSpinner: true,
  responsive: true,
  sources: [],
};

class Hlser {
  player = null;
  options = null;
  videoElement = null;
  isDispose = false;

  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options);
    this.videoElement = this.options.element;

    if (!this.videoElement) {
      throw new Error('options中缺少element参数！');
    }
  }

  init() {
    if (this.player) {
      this.destory();
    }
    this.isDispose = false;
    this.player = videojs(
      this.videoElement,
      VIDEOJS_LIVE_CONFIG,
      function onPlayerReady() {}
    );

    this.player.live = this._live.bind(this);
    this.player.disposeHls = this.disposeHls.bind(this);

    return this.player;
  }

  _live(opts) {
    const { src, poster } = opts;

    this.player.src({
      src,
      type: 'application/x-mpegURL',
    });
    this.player.load();
    this.player.one('canplaythrough', function () {
      this.play();
    });

    if (poster) {
      this.player.poster(poster);
    }
  }

  destroy() {
    if (this.player) {
      this.player.reset();
      this.player.pause();
      this.player = null;
    }
  }

  disposeHls() {
    this.isDispose = true;
    this.player.dispose();
  }
}
