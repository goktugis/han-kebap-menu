(function () {
  "use strict";

  var DATA = window.MENU_DATA || MENU_DATA;
  var TAGS = {
    sef: "Şefin Önerisi",
    aci: "Acılı",
    vegan: "Vejetaryen",
    yeni: "Yeni",
  };
  var FILTERS = ["sef", "aci", "vegan"];

  var state = { query: "", tag: null };

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // Türkçe karakterleri sadeleştirip küçük harfe çevirir (arama için)
  function fold(s) {
    return String(s)
      .toLocaleLowerCase("tr")
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u")
      .trim();
  }

  function formatPrice(p) {
    return new Intl.NumberFormat("tr-TR").format(p) + " ₺";
  }

  function matches(item) {
    if (state.tag && (item.tags || []).indexOf(state.tag) === -1) return false;
    if (!state.query) return true;
    var hay = fold(item.name + " " + (item.desc || ""));
    return fold(state.query).split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function badge(tag) {
    return el("span", "badge badge--" + tag, TAGS[tag]);
  }

  // ---------- Render ----------
  function renderStatic() {
    var r = DATA.restaurant;
    $("restName").textContent = r.name;
    $("restSub").textContent = r.subtitle;
    $("restTagline").textContent = r.tagline;
    $("footName").textContent = r.name + " " + r.subtitle;
    $("footHours").textContent = r.hours;
    $("footAddress").textContent = r.address;
    var phone = $("footPhone");
    phone.textContent = r.phone;
    phone.href = "tel:" + r.phone.replace(/[^\d+]/g, "");
    var insta = $("footInsta");
    if (r.instagram) {
      insta.textContent = "@" + r.instagram.replace(/^@/, "");
      insta.href = "https://instagram.com/" + r.instagram.replace(/^@/, "");
      insta.hidden = false;
    }
    $("footNote").textContent = r.note;

    var filters = $("filters");
    FILTERS.forEach(function (t) {
      var b = el("button", "filter", TAGS[t]);
      b.type = "button";
      b.dataset.tag = t;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        state.tag = state.tag === t ? null : t;
        Array.prototype.forEach.call(filters.children, function (c) {
          c.setAttribute("aria-pressed", String(c.dataset.tag === state.tag));
        });
        render();
      });
      filters.appendChild(b);
    });
  }

  function renderItem(item) {
    var hasImg = !!item.img;
    var root = el(hasImg ? "button" : "div", "item" + (item.soldOut ? " item--sold" : ""));
    if (hasImg) {
      root.type = "button";
      root.setAttribute("aria-label", item.name + " detayını göster");
      root.addEventListener("click", function () { openSheet(item); });
    }
    root.dataset.item = item.name;

    var body = el("div", "item__body");
    var head = el("div", "item__head");
    head.appendChild(el("span", "item__name", item.name));
    head.appendChild(el("span", "item__dots"));
    head.appendChild(el("span", "price", item.soldOut ? "Tükendi" : formatPrice(item.price)));
    body.appendChild(head);
    if (item.desc) body.appendChild(el("p", "item__desc", item.desc));

    var tags = (item.tags || []).filter(function (t) { return TAGS[t]; });
    if (tags.length) {
      var wrap = el("div", "item__tags");
      tags.forEach(function (t) { wrap.appendChild(badge(t)); });
      body.appendChild(wrap);
    }
    root.appendChild(body);

    if (hasImg) {
      var img = el("img", "item__thumb");
      img.src = "images/" + item.img;
      img.alt = item.name;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 100; img.height = 100;
      root.appendChild(img);
    }
    return root;
  }

  function render() {
    var menu = $("menu");
    var nav = $("catNav");
    menu.textContent = "";
    nav.textContent = "";
    var visible = 0;

    DATA.categories.forEach(function (cat) {
      var items = cat.items.filter(matches);
      if (!items.length) return;
      visible += items.length;

      var sec = el("section", "section");
      sec.id = cat.id;
      sec.dataset.cat = cat.id;
      var banner = el("div", "section__banner");
      if (cat.img) banner.style.backgroundImage = 'url("images/' + cat.img + '")';
      banner.appendChild(el("h2", "section__title", cat.name));
      banner.appendChild(el("span", "section__count", items.length + " ürün"));
      sec.appendChild(banner);
      var list = el("div", "items");
      items.forEach(function (it) { list.appendChild(renderItem(it)); });
      sec.appendChild(list);
      menu.appendChild(sec);

      var li = el("li");
      var a = el("a", "cats__link", cat.name);
      a.href = "#" + cat.id;
      a.dataset.cat = cat.id;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = $(cat.id);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#" + cat.id);
        setActive(cat.id);
      });
      li.appendChild(a);
      nav.appendChild(li);
    });

    $("empty").hidden = visible > 0;
    updateActive();
  }

  // ---------- Scrollspy ----------
  var activeId = null;
  function setActive(id) {
    activeId = id;
    var links = $("catNav").querySelectorAll(".cats__link");
    Array.prototype.forEach.call(links, function (a) {
      var on = a.dataset.cat === id;
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      if (on) {
        var box = a.closest(".cats");
        var left = a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2;
        box.scrollTo({ left: left, behavior: "smooth" });
      }
    });
  }

  function updateActive() {
    var secs = $("menu").querySelectorAll(".section");
    if (!secs.length) return;
    var line = $("topbar").offsetHeight + 24;
    var current = secs[0].id;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].getBoundingClientRect().top <= line) current = secs[i].id;
    }
    // sayfa sonuna gelince son kategori
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = secs[secs.length - 1].id;
    }
    // hero görünürken hiçbiri seçili olmasın
    var first = secs[0].getBoundingClientRect().top;
    if (first > line + 40 && window.scrollY < $("topbar").offsetTop) current = null;
    if (current !== activeId) setActive(current);
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        updateActive();
        $("toTop").hidden = window.scrollY < 600;
        ticking = false;
      });
    }
  }

  // ---------- Detail sheet ----------
  function openSheet(item) {
    var s = $("sheet");
    $("sheetImg").src = "images/" + item.img;
    $("sheetImg").alt = item.name;
    $("sheetName").textContent = item.name;
    $("sheetDesc").textContent = item.desc || "";
    $("sheetPrice").textContent = item.soldOut ? "Tükendi" : formatPrice(item.price);
    var tags = $("sheetTags");
    tags.textContent = "";
    (item.tags || []).forEach(function (t) { if (TAGS[t]) tags.appendChild(badge(t)); });
    if (typeof s.showModal === "function") s.showModal(); else s.setAttribute("open", "");
  }

  function initSheet() {
    var s = $("sheet");
    s.addEventListener("click", function (e) {
      if (e.target === s) s.close(); // dışına tıklayınca kapat
    });
  }

  // ---------- Init ----------
  function init() {
    renderStatic();
    render();

    var input = $("search");
    var clear = $("searchClear");
    input.addEventListener("input", function () {
      state.query = input.value;
      clear.hidden = !input.value;
      render();
    });
    clear.addEventListener("click", function () {
      input.value = ""; state.query = ""; clear.hidden = true; render(); input.focus();
    });

    $("toTop").addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    function syncBar() {
      document.documentElement.style.setProperty("--topbar-h", $("topbar").offsetHeight + "px");
    }
    syncBar();
    window.addEventListener("resize", syncBar);
    window.addEventListener("scroll", onScroll, { passive: true });
    initSheet();

    if (location.hash && $(location.hash.slice(1))) {
      setTimeout(function () { $(location.hash.slice(1)).scrollIntoView(); updateActive(); }, 60);
    }
    onScroll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.__menuTest = { fold: fold, formatPrice: formatPrice };
})();
