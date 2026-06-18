
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
      var targetSelector = panel.getAttribute("data-target") || ".movie-card";
      var scope = document.querySelector(panel.getAttribute("data-scope") || "body");
      var empty = document.querySelector(panel.getAttribute("data-empty") || "");
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(targetSelector)) : [];
      var active = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var type = card.getAttribute("data-region") || "";
          var matchesQuery = !query || haystack.indexOf(query) > -1;
          var matchesFilter = active === "all" || category === active || type === active || haystack.indexOf(active.toLowerCase()) > -1;
          var shouldShow = matchesQuery && matchesFilter;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  function initMoviePlayer(streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell || !streamUrl) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-play-overlay]");
    var playButtons = Array.prototype.slice.call(shell.querySelectorAll("[data-play-toggle]"));
    var muteButton = shell.querySelector("[data-mute-toggle]");
    var fullButton = shell.querySelector("[data-fullscreen-toggle]");
    var state = shell.querySelector("[data-player-state]");
    var loaded = false;
    var hls = null;

    function setState(text) {
      if (state) {
        state.textContent = text || "";
      }
    }

    function load() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      setState("加载中");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState("播放遇到问题");
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.hidden = true;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          setState("点击播放");
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", togglePlay);
    });

    if (video) {
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        shell.classList.add("playing");
        setState("");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("playing");
      });
      video.addEventListener("waiting", function () {
        setState("加载中");
      });
      video.addEventListener("canplay", function () {
        setState("");
      });
    }

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "🔇" : "🔊";
      });
    }

    if (fullButton) {
      fullButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  window.setupMoviePlayer = initMoviePlayer;
})();
