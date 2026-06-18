(function () {
  function boot() {
    document.querySelectorAll("video[data-hls]").forEach(function (video) {
      var wrap = video.closest(".video-wrap");
      var button = wrap ? wrap.querySelector(".play-overlay") : null;
      var state = wrap ? wrap.querySelector(".player-state") : null;
      var url = video.getAttribute("data-hls");
      var hls = null;

      function setState(text) {
        if (state) {
          state.textContent = text;
        }
      }

      function start() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setState("轻触画面继续播放");
          });
        }
      }

      if (url && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setState("视频加载失败，请稍后重试");
        });
      } else if (url && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        setState("");
      } else {
        setState("视频加载失败，请稍后重试");
      }

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
          return;
        }
        video.pause();
      });

      video.addEventListener("play", function () {
        if (wrap) {
          wrap.classList.add("is-playing");
        }
      });

      video.addEventListener("pause", function () {
        if (wrap) {
          wrap.classList.remove("is-playing");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
