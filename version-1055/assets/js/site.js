(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mainNav = document.querySelector(".main-nav");
    if (menuButton && mainNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mainNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var scope = panel.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var searchInput = panel.querySelector("[data-search-input]");
      var filters = {
        region: "全部",
        type: "全部"
      };

      panel.querySelectorAll("[data-filter-group]").forEach(function (button) {
        if (button.getAttribute("data-filter-value") === "全部") {
          button.classList.add("is-active");
        }
        button.addEventListener("click", function () {
          var group = button.getAttribute("data-filter-group");
          var value = button.getAttribute("data-filter-value");
          filters[group] = value;
          panel.querySelectorAll('[data-filter-group="' + group + '"]').forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilters();
        });
      });

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var region = card.getAttribute("data-region") || "";
          var type = card.getAttribute("data-type") || "";
          var title = card.getAttribute("data-title") || "";
          var tags = card.getAttribute("data-tags") || "";
          var matchesRegion = filters.region === "全部" || region === filters.region;
          var matchesType = filters.type === "全部" || type === filters.type;
          var haystack = (title + " " + region + " " + type + " " + tags).toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !(matchesRegion && matchesType && matchesQuery));
        });
      }
    });
  });
})();
