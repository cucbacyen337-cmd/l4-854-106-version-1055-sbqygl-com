(function () {
  "use strict";

  var scriptElement = document.currentScript;
  var scriptBaseUrl = scriptElement ? new URL(".", scriptElement.src) : new URL("./assets/js/", window.location.href);
  var hlsLibraryPromise = null;

  function loadHlsLibrary() {
    if (!hlsLibraryPromise) {
      hlsLibraryPromise = import(new URL("hls-vendor-dru42stk.js", scriptBaseUrl).href)
        .then(function (module) {
          return module.H;
        })
        .catch(function () {
          return null;
        });
    }
    return hlsLibraryPromise;
  }

  function toggleMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initializeHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === activeIndex);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    slider.addEventListener("mouseenter", stopAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  function initializeFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }
    var searchInput = filterRoot.querySelector("[data-filter-search]");
    var categorySelect = filterRoot.querySelector("[data-filter-category]");
    var typeSelect = filterRoot.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var category = categorySelect ? categorySelect.value : "all";
      var type = typeSelect ? typeSelect.value : "all";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardCategory = card.getAttribute("data-category") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesCategory = category === "all" || category === cardCategory;
        var matchesType = type === "all" || type === cardType;
        var isVisible = matchesKeyword && matchesCategory && matchesType;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    [searchInput, categorySelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function prepareImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.closest(".poster-link, .rank-thumb, .related-card, .hero-poster");
        if (holder) {
          holder.classList.add("poster-missing");
          holder.setAttribute("data-title", image.getAttribute("alt") || "");
        }
        image.style.opacity = "0";
      }, { once: true });
    });
  }

  function initializePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      initializeSinglePlayer(player);
    });
  }

  async function initializeSinglePlayer(player) {
    var video = player.querySelector("video");
    var playButton = player.querySelector("[data-play]");
    var message = player.querySelector("[data-player-message]");
    if (!video) {
      return;
    }

    var sourceUrl = video.getAttribute("data-src");
    var hlsInstance = null;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      player.classList.toggle("has-message", Boolean(text));
    }

    function markReady() {
      player.classList.add("is-ready");
    }

    function markPlaying(isPlaying) {
      player.classList.toggle("is-playing", isPlaying);
    }

    if (!sourceUrl) {
      markReady();
      setMessage("当前影片暂未绑定播放源。待播放源补充后可直接播放。");
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      markReady();
    } else {
      var Hls = await loadHlsLibrary();
      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          markReady();
        });
        hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            setMessage("网络波动，正在重新连接播放源。");
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            setMessage("播放器正在尝试恢复媒体流。");
          } else {
            hlsInstance.destroy();
            setMessage("播放源暂时无法加载，请稍后再试。");
          }
        });
      } else {
        markReady();
        setMessage("当前浏览器不支持 HLS 播放，建议使用 Chrome、Edge、Safari 或 Firefox 最新版本访问。")
      }
    }

    function togglePlayback() {
      if (video.paused) {
        video.play().catch(function () {
          setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
        });
      } else {
        video.pause();
      }
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlayback);
    }
    video.addEventListener("click", togglePlayback);
    video.addEventListener("play", function () {
      markPlaying(true);
      setMessage("");
    });
    video.addEventListener("pause", function () {
      markPlaying(false);
    });
    video.addEventListener("canplay", markReady);
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    toggleMobileMenu();
    initializeHeroSlider();
    initializeFilters();
    initializePlayers();
    prepareImages();
  });
})();
