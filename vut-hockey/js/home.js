(function () {
  "use strict";
  const V = window.VUT;
  const nextNode = document.querySelector("#next-fixture");
  const newsNode = document.querySelector("#latest-news");
  function fixture(item) {
    return '<article class="card fixture-card reveal"><div class="card-body"><div class="fixture-meta"><span>' +
      V.esc(V.date(item.date)) + '</span><span>' + V.esc(item.venue || "Venue to be confirmed") +
      '</span></div><div class="fixture-teams"><strong>' + V.esc(item.team_name || "VUT Hockey") +
      '</strong><b>VS</b><strong>' + V.esc(item.opponent || "Opponent to be confirmed") + '</strong></div>' +
      '<span class="eyebrow">' + V.esc(item.competition || "Fixture") + '</span></div></article>';
  }
  function news(item) {
    const link = item.id ? "news.html?id=" + encodeURIComponent(item.id) : "news.html";
    return '<article class="card news-card reveal"><div class="placeholder"><span>VUT HOCKEY</span></div><div class="card-body"><span class="news-date">' +
      V.esc(V.date(item.published_at || item.date || item.created_at)) + '</span><h3>' + V.esc(item.title || "News update") +
      '</h3><p>' + V.esc(item.summary || item.excerpt || "Information coming soon.") + '</p><a class="button button-ghost button-small" href="' + link + '">Read update</a></div></article>';
  }
  async function load() {
    try {
      const item = await V.api.get("/fixtures/next");
      const data = V.list(item);
      if (!data.length) V.setState(nextNode, "No fixtures available.");
      else nextNode.innerHTML = data.slice(0, 3).map(fixture).join("");
    } catch (error) { V.setState(nextNode, "Fixtures are temporarily unavailable.", "error"); }
    try {
      const data = V.list(await V.api.get("/news/latest"));
      if (!data.length) V.setState(newsNode, "Information coming soon.");
      else newsNode.innerHTML = data.slice(0, 3).map(news).join("");
    } catch (error) { V.setState(newsNode, "News is temporarily unavailable.", "error"); }
  }
  load();
}());