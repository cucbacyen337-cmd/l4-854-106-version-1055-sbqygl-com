(function () {
  function startMoviePlayer(source, videoId) {
    var video = document.getElementById(videoId || 'movie-player');

    if (!video) {
      return;
    }

    var shell = video.closest('[data-player-shell]');
    var button = shell ? shell.querySelector('[data-player-button]') : null;
    var hls = null;
    var loaded = false;

    function attachSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function setPlaying(isPlaying) {
      if (shell) {
        shell.classList.toggle('playing', isPlaying);
      }
    }

    function playVideo() {
      attachSource();

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setPlaying(false);
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', toggleVideo);
    video.addEventListener('play', function () {
      setPlaying(true);
    });
    video.addEventListener('pause', function () {
      setPlaying(false);
    });
    video.addEventListener('ended', function () {
      setPlaying(false);
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.startMoviePlayer = startMoviePlayer;
}());
