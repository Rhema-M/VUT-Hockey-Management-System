(function () {
  "use strict";
  const V = window.VUT, listNode = document.querySelector("#news-list"), detailNode = document.querySelector("#news-detail");
  function card(item) {
    return '<article class="card news-card"><div class="placeholder"><span>VUT HOCKEY</span></div><div class="card-body"><span class="news-date">' +
      V.esc(V.date(item.published_at || item.date || item.created_at)) + '</span><h3>' + V.esc(item.title || "News update") +
      '</h3><p>' + V.esc(item.summary || item.excerpt || "Information coming soon.") + '</p>' +
      (item.id ? '<a class="button button-ghost button-small" href="news.html?id=' + encodeURIComponent(item.id) + '">Read update</a>' : "") + "</div></article>";
  }
  async function load() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id && detailNode) {
      if (listNode) listNode.hidden = true;
      try {
        const item = await V.api.get("/news/" + encodeURIComponent(id));
        detailNode.innerHTML = '<span class="eyebrow">' + V.esc(V.date(item.published_at || item.date || item.created_at)) + '</span><h1>' +
          V.esc(item.title || "News update") + '</h1><div class="prose"><p>' + V.esc(item.content || item.body || item.summary || "Information coming soon.") + "</p></div>";
      } catch (error) { V.setState(detailNode, "This news item is unavailable.", "error"); }
      return;
    }
    if (!listNode) return;
    try { const data = V.list(await V.api.get("/news")); listNode.innerHTML = data.length ? data.map(card).join("") : '<div class="data-state">Information coming soon.</div>'; }
    catch (error) { V.setState(listNode, "News is temporarily unavailable.", "error"); }
  }
  load();
}());