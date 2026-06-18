(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var stream = shell.getAttribute('data-stream');
        var loaded = false;
        var hls = null;
        if (!video || !stream) {
            return;
        }
        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            loaded = true;
        }
        function play() {
            load();
            shell.classList.add('is-playing');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    if (document.readyState !== 'loading') {
        document.querySelectorAll('[data-player]').forEach(setupPlayer);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('[data-player]').forEach(setupPlayer);
        });
    }
}());
