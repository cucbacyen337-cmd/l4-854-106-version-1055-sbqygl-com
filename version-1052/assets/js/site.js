/* Generated static movie site interactions. */

(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var results = document.getElementById('search-results');
  var input = document.getElementById('movie-search-input');
  var status = document.getElementById('search-status');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function posterStyle(id) {
    var hue = (Number(id) * 47) % 360;
    return '--poster-hue: ' + hue + ';';
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
      '    <div class="poster poster-small" style="' + posterStyle(movie.id) + '">',
      '      <div class="poster-shine"></div>',
      '      <div class="poster-content">',
      '        <span class="poster-kicker">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>',
      '        <strong>' + escapeHtml(movie.title) + '</strong>',
      '      </div>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="movie-meta-line">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('
');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderResults(movies, query) {
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    var filtered = movies.filter(function (movie) {
      if (!terms.length) {
        return true;
      }

      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));

      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 96);

    if (status) {
      status.textContent = terms.length
        ? '找到 ' + filtered.length + ' 条相关结果，最多显示 96 条。'
        : '显示片库前 96 条作品，可输入关键词继续筛选。';
    }

    if (results) {
      results.innerHTML = filtered.map(renderCard).join('
');
    }
  }

  function activateSearch(movies) {
    renderResults(movies, '');
    input.addEventListener('input', function () {
      renderResults(movies, input.value);
    });
  }

  if (results && input) {
    if (Array.isArray(window.MOVIE_DATA)) {
      activateSearch(window.MOVIE_DATA);
      return;
    }

    var dataUrl = results.getAttribute('data-json') || 'assets/data/movies.json';

    fetch(dataUrl)
      .then(function (response) {
        return response.json();
      })
      .then(activateSearch)
      .catch(function () {
        if (status) {
          status.textContent = '片库数据载入失败，请检查 assets/data/movies.json 或 assets/data/movies.js 是否存在。';
        }
      });
  }
}());
