(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var select = document.querySelector("[data-filter-category]");
        if (!input && !select) {
            return;
        }
        var items = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item, .compact-card"));

        function itemText(item) {
            return normalize([
                item.getAttribute("data-title"),
                item.getAttribute("data-tags"),
                item.getAttribute("data-region"),
                item.getAttribute("data-type"),
                item.getAttribute("data-category"),
                item.getAttribute("data-year")
            ].join(" "));
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var category = normalize(select ? select.value : "");
            items.forEach(function (item) {
                var text = itemText(item);
                var itemCategory = normalize(item.getAttribute("data-category"));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = !category || itemCategory === category;
                item.classList.toggle("is-hidden", !(matchKeyword && matchCategory));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
    }

    function initMoviePlayer(streamUrl) {
        var video = document.querySelector("[data-player]");
        var cover = document.querySelector("[data-player-cover]");
        if (!video || !cover || !streamUrl) {
            return;
        }
        var loaded = false;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsPlayer.loadSource(streamUrl);
                hlsPlayer.attachMedia(video);
                video.hlsPlayer = hlsPlayer;
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            cover.classList.add("is-hidden");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
