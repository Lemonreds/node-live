/* eslint-disable no-undef */
// 默认配置
const DEFAULTS = {
  element: '', // video element
  frameTracking: false, // 追帧设置
  frameTrackingDelta: 5, // 延迟容忍度，即缓冲区末尾时间与当前播放时间的差值，大于该值会触发追帧
  updateOnStart: false, // 点击播放按钮后实时更新视频
  updateOnFocus: true, // 获得焦点后实时更新视频
  reconnect: false, // 断流后重连
  reconnectInterval: 2000, // 重连间隔(ms)
};

// Videojs/flvjs的配置文件
const VIDEOJS_LIVE_CONFIG = {
  flvjs: {
    mediaDataSource: {
      isLive: false,
      cors: true,
      withCredentials: false,
      hasAudio: true,
      hasVideo: true,
    },
    config: {
      //   enableWorker: true, // 启用分离的线程进行转换
      enableStashBuffer: false, // 关闭IO隐藏缓冲区
      stashInitialSize: 128, // 减少首帧显示等待时长
      isLive: true,
    },
  },
  autoplay: false,
  controls: true,
  muted: false,
  fluid: true,
  // poster: 'xxx', // 视频封面图地址
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
  loadingSpinner: true,
  responsive: true,
  sources: [],
};

class Flver {
  player = null;
  flvPlayer = null;
  options = null;
  videoElement = null;

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

    const self = this;
    this.player = videojs(
      'videojs-flvjs-player',
      VIDEOJS_LIVE_CONFIG,
      function onPlayerReady() {
        setTimeout(() => {
          const { flvPlayer } = this.tech({ IWillNotUseThisInPlugins: true });
          if (flvPlayer) {
            self.flvPlayer = flvPlayer;
            self._bindPlayerOptions();
            self._bindFlvPlayerEvents();
            self._handleStuck();
          }
        }, 0);
      }
    );

    this.player.live = this._live.bind(this);
    return this.player;
  }

  // 设置flv直播源，并开始直播
  _live(source) {
    this.source = source;
    this.player.src({
      src: source,
      type: 'video/x-flv',
    });
  }

  // 更新视频到最新的拉流帧
  update() {
    if (this.player && this.flvPlayer) {
      if (this.flvPlayer.buffered.length) {
        const currentTime = this.flvPlayer.buffered.end(0) - 1;

        this.player.currentTime(currentTime);
        this.flvPlayer.currentTime = currentTime;
      }
    }
  }

  // 重建视频
  rebuild() {
    this.destroy();
    this.init();
    this._live(this.source);
  }

  // 追帧设置
  _handleFrameTracking() {
    if (!this.player || !this.flvPlayer) return;
    if (this.player.paused()) {
      return;
    }
    if (this.flvPlayer.buffered.length) {
      try {
        let end = this.flvPlayer.buffered.end(0); // 获取当前buffered值(缓冲区末尾)
        let delta = end - this.flvPlayer.currentTime; // 获取buffered与当前播放位置的差值

        // 延迟过大，通过跳帧的方式更新视频
        if (delta > 5 || delta < 0) {
          console.log(
            `%c 准备跳帧. `,
            'background:red;color:#fff',
            this.flvPlayer._transmuxer?._controller
          );
          this.update();
          return;
        }

        // 延迟较小时，通过调整播放速度的方式来追帧
        if (delta > this.options.frameTrackingDelta) {
          console.log(
            `%c 播放速度提高 进行跳帧. `,
            'background:red;color:#fff'
          );
          this._updatePlayerbackRate(1.1);
        } else {
          this._updatePlayerbackRate(1);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  // 更新播放速度
  _updatePlayerbackRate = (playbackRate) => {
    if (this.player) {
      if (this.player.playbackRate === playbackRate) {
        return;
      }
      this.playbackRate === playbackRate;
    }
  };

  // 绑定videojs的相关事件
  _bindPlayerOptions() {
    // 追帧设置
    if (this.options.frameTracking) {
      this.player.on('progress', this._handleFrameTracking.bind(this));
    }

    // 点击播放按钮，更新视频
    if (this.options.updateOnStart) {
      this.player.on('play', () => {
        this.update();
      });
    }

    // 网页重新激活后，更新视频
    if (this.options.updateOnFocus) {
      window.onfocus = () => {
        console.log(`%c 回到前台 `, 'background:red;color:#fff');
        this.update();
      };
    }
  }

  // 绑定flv.js的相关事件
  _bindFlvPlayerEvents() {
    this.flvPlayer.on(window.flvjs.Events.ERROR, (e) => {
      if (this.player.onerror) {
        this.player?.onerror(e);
      }

      // ERROR 重建
      const { reconnect, reconnectInterval } = this.options;
      if (reconnect && reconnectInterval >= 0) {
        this.timeout = setTimeout(() => {
          this.rebuild();
        }, reconnectInterval);
      }
      console.log(`%c 视频ERROR： `, 'background:red;color:#fff', e);
    });
    this.flvPlayer.on(window.flvjs.Events.STATISTICS_INFO, (e) => {
      if (this.player.onstats) {
        this.player.onstats(e);
      }
    });
    this.flvPlayer.on(window.flvjs.Events.MEDIA_INFO, this.player.onmedia);
    this.flvPlayer.on(
      window.flvjs.Events.LOADING_COMPLETE,
      this.player.oncomplete
    );
  }

  //  解决stuck的问题
  _handleStuck() {
    let lastDecodedFrames = 0;
    let stuckTime = 0;

    this.interval && clearInterval(this.interval);
    this.interval = setInterval(() => {
      const decodedFrames = this.flvPlayer.statisticsInfo.decodedFrames;
      if (!decodedFrames) return;

      if (lastDecodedFrames === decodedFrames && !this.player.paused()) {
        // 可能卡住了，重载
        stuckTime++;
        if (stuckTime > 1) {
          console.log(`%c 卡住，重建视频`, 'background:red;color:#fff');
          this.rebuild();
        }
      } else {
        lastDecodedFrames = decodedFrames;
        stuckTime = 0;
      }
    }, 800);
  }

  destroy() {
    if (this.flvPlayer) {
      this.flvPlayer.pause();
      this.flvPlayer.unload();
      this.flvPlayer.detachMediaElement();
      this.flvPlayer = null;
    }
    if (this.player) {
      this.player.reset();
      this.player.hasStarted(false);
      this.player = null;
    }

    this.interval && clearInterval(this.interval);
    this.timeout && clearTimeout(this.timeout);

    this.interval = null;
    this.timeout = null;
    window.onfocus = null;
  }
}
