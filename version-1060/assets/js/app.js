(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    var current = select.value;
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = current;
  }

  function uniqueSorted(items, attribute) {
    var map = Object.create(null);
    items.forEach(function (item) {
      var value = item.getAttribute(attribute) || "";
      if (value) {
        map[value] = true;
      }
    });
    return Object.keys(map).sort(function (a, b) {
      return b.localeCompare(a, "zh-CN", { numeric: true });
    });
  }

  function activateFilters() {
    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-filter-target");
      var target = targetSelector ? document.querySelector(targetSelector) : panel.parentElement;
      if (!target) {
        return;
      }
      var items = Array.prototype.slice.call(target.querySelectorAll(".filter-item"));
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      fillSelect(year, uniqueSorted(items, "data-year"));
      fillSelect(region, uniqueSorted(items, "data-region"));
      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-year"),
            item.getAttribute("data-region"),
            item.getAttribute("data-tags"),
            item.textContent
          ].join(" "));
          var matchKeyword = !q || haystack.indexOf(q) !== -1;
          var matchYear = !y || normalize(item.getAttribute("data-year")) === y;
          var matchRegion = !r || normalize(item.getAttribute("data-region")) === r;
          item.style.display = matchKeyword && matchYear && matchRegion ? "" : "none";
        });
      }
      [keyword, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function activateNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function activateHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var dots = root.querySelector("[data-hero-dots]");
    var active = 0;
    var timer = null;
    if (slides.length < 2) {
      return;
    }
    function render() {
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === active);
      });
      if (dots) {
        Array.prototype.slice.call(dots.children).forEach(function (dot, index) {
          dot.classList.toggle("is-active", index === active);
        });
      }
    }
    function go(index) {
      active = (index + slides.length) % slides.length;
      render();
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        go(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    if (dots) {
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第" + (index + 1) + "屏");
        dot.addEventListener("click", function () {
          go(index);
          start();
        });
        dots.appendChild(dot);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        go(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        go(active + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    render();
    start();
  }

  window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var initialized = false;
    var hlsInstance = null;
    if (!video || !sourceUrl) {
      return;
    }
    function setup() {
      if (initialized) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      initialized = true;
    }
    function play() {
      setup();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    activateNavigation();
    activateHero();
    activateFilters();
  });
})();
