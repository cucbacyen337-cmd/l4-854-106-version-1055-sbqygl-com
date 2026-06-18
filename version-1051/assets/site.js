(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        play();
      });
    });

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        play();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        play();
      });
    }

    showSlide(0);
    play();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var searchInput = panel.querySelector('[data-search-input]');
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = panel.querySelector('[data-empty-state]');
    var filters = {
      region: '',
      type: '',
      category: ''
    };

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));

        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesRegion = !filters.region || card.dataset.region === filters.region;
        var matchesType = !filters.type || card.dataset.type === filters.type;
        var matchesCategory = !filters.category || card.dataset.category === filters.category;
        var shouldShow = matchesQuery && matchesRegion && matchesType && matchesCategory;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    panel.querySelectorAll('[data-filter-group]').forEach(function (button) {
      button.addEventListener('click', function () {
        var group = button.dataset.filterGroup;
        var value = button.dataset.filterValue || '';
        filters[group] = value;

        panel.querySelectorAll('[data-filter-group="' + group + '"]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });

        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
  });
}());
