(function () {
  "use strict";
  const V = window.VUT, teams = document.querySelector("#teams"), players = document.querySelector("#players");
  function teamCard(item) {
    return '<article class="card news-card"><div class="placeholder"><span>' + V.esc(item.name || "TEAM") + '</span></div><div class="card-body"><h3>' +
      V.esc(item.name || "Team") + '</h3><p>' + V.esc(item.description || "Information coming soon.") + "</p></div></article>";
  }
  function playerCard(item) {
      return '<article class="card news-card"><div class="placeholder"><span>' + V.esc(item.squad_number || "—") + '</span></div><div class="card-body"><h3>' +
      V.esc(item.name || "Player") + '</h3><p>' + V.esc(item.position || "Position not listed") + "</p></div></article>";
  }
  async function load() {
    try { const data = V.list(await V.api.get("/teams")); teams.innerHTML = data.length ? data.map(teamCard).join("") : '<div class="data-state">Information coming soon.</div>'; }
    catch (error) { V.setState(teams, "Team information is temporarily unavailable.", "error"); }
    try { const data = V.list(await V.api.get("/players")); players.innerHTML = data.length ? data.map(playerCard).join("") : '<div class="data-state">Information coming soon.</div>'; }
    catch (error) { V.setState(players, "Player information is temporarily unavailable.", "error"); }
  }
  load();
}());