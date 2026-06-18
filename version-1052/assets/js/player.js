/* Generated player helper for static detail pages. */

(function () {
  var players = document.querySelectorAll('.movie-player[data-video-url]');

  players.forEach(function (video) {
    var source = video.getAttribute('data-video-url');

    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    video.addEventListener('error', function () {
      var note = video.parentElement.querySelector('.player-note');
      if (note) {
        note.textContent = '当前浏览器可能不支持直接播放 HLS，请点击下方按钮打开播放线路。';
      }
    });
  });
}());
