document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll(".local-filter").forEach(function (input) {
    input.addEventListener("input", applyLocalFilter);
  });

  document.querySelectorAll(".year-filter").forEach(function (select) {
    select.addEventListener("change", applyLocalFilter);
  });

  function applyLocalFilter() {
    var section = this.closest(".content-section") || document;
    var queryInput = section.querySelector(".local-filter");
    var yearSelect = section.querySelector(".year-filter");
    var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value.trim() : "";

    section.querySelectorAll(".filter-grid .movie-card").forEach(function (card) {
      var text = (card.getAttribute("data-title") || "").toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = !year || text.indexOf(year.toLowerCase()) !== -1;
      card.classList.toggle("is-hidden-card", !(matchQuery && matchYear));
    });
  }
});
