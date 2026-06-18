document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");
  var summary = document.getElementById("searchSummary");

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render(items) {
    if (!results) {
      return;
    }

    results.innerHTML = items.map(function (movie) {
      return [
        '<article class="movie-card poster-card">',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
        '    <span class="poster-play">▶</span>',
        '    <span class="poster-info">',
        '      <strong>' + escapeHtml(movie.title) + '</strong>',
        '      <small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</small>',
        '    </span>',
        '  </a>',
        '</article>'
      ].join('');
    }).join('');
  }

  var source = Array.isArray(SEARCH_MOVIES) ? SEARCH_MOVIES : [];
  var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  var matches = source.filter(function (movie) {
    if (!terms.length) {
      return true;
    }

    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(" ")
    ].join(" ").toLowerCase();

    return terms.every(function (term) {
      return text.indexOf(term) !== -1;
    });
  }).slice(0, 96);

  if (summary) {
    summary.textContent = query ? "搜索结果：" + query : "精选结果";
  }

  render(matches);
});
