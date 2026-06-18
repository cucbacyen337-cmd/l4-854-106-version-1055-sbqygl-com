(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('.nav-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                var open = mobileNav.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            if (slides.length < 2) {
                return;
            }
            var index = 0;
            function show(next) {
                slides[index].classList.remove('is-active');
                if (dots[index]) {
                    dots[index].classList.remove('is-active');
                }
                index = (next + slides.length) % slides.length;
                slides[index].classList.add('is-active');
                if (dots[index]) {
                    dots[index].classList.add('is-active');
                }
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                });
            });
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        });

        document.querySelectorAll('[data-filter-form]').forEach(function (form) {
            var scope = form.parentElement || document;
            var grid = scope.querySelector('[data-filter-grid]') || document.querySelector('[data-filter-grid]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var original = cards.slice();
            function field(name) {
                var item = form.elements[name];
                return item ? String(item.value || '').trim().toLowerCase() : '';
            }
            function apply() {
                var q = field('q');
                var region = field('region');
                var kind = field('kind');
                var category = field('category');
                var sort = field('sort');
                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.kind,
                        card.dataset.category,
                        card.dataset.tags
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (region && String(card.dataset.region || '').toLowerCase().indexOf(region) === -1) {
                        ok = false;
                    }
                    if (kind && String(card.dataset.kind || '').toLowerCase().indexOf(kind) === -1) {
                        ok = false;
                    }
                    if (category && String(card.dataset.category || '').toLowerCase() !== category) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                });
                var sorted = cards.slice();
                if (sort === 'year-desc') {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    });
                } else if (sort === 'year-asc') {
                    sorted.sort(function (a, b) {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    });
                } else if (sort === 'title-asc') {
                    sorted.sort(function (a, b) {
                        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                    });
                } else {
                    sorted = original.slice();
                }
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
            form.addEventListener('input', apply);
            form.addEventListener('change', apply);
        });
    });
}());
