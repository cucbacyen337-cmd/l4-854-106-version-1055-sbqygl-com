document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("moviePlayer");
  var cover = document.getElementById("playerCover");

  if (!video || !cover || typeof currentVideoUrl === "undefined") {
    return;
  }

  var loaded = false;

  function start() {
    cover.classList.add("is-hidden");

    if (loaded) {
      video.play().catch(function () {});
      return;
    }

    loaded = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = currentVideoUrl;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(currentVideoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = currentVideoUrl;
    video.play().catch(function () {});
  }

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!loaded) {
      start();
    }
  });
});
