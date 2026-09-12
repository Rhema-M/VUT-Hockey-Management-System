(function () {
  "use strict";
  const V = window.VUT, node = document.querySelector("#fixtures-list");
  const teamSelect = document.querySelector("#fixture-team");
  const dateInput = document.querySelector("#fixture-date");
  const scopeSelect = document.querySelector("#fixture-scope");
  let records = [];
  function render(items) {
    if (!items.length) return V.setState(node, "No fixtures available.");
    node.innerHTML = items.map(function (item) {
      return '<article class="list-row"><time>' + V.esc(V.date(item.date)) +
        '</time><div><h3>' + V.esc(item.team_name || "VUT Hockey") + ' <span class="eyebrow">vs</span> ' +
        V.esc(item.opponent || "Opponent to be confirmed") + '</h3><p>' + V.esc(item.venue || "Venue to be confirmed") + '</p></div><span class="eyebrow">' +
        V.esc(item.competition || "Fixture") + "</span></article>";
    }).join("");
  }
  function filtered() {
    const team = teamSelect && teamSelect.value;
    const date = dateInput && dateInput.value;
    const scope = scopeSelect && scopeSelect.value;
    return records.filter(function (item) {
      const matchesTeam = !team || String(item.team_id) === team;
      const matchesDate = !date || item.date === date;
      const today = new Date().toISOString().slice(0, 10);
      const matchesScope = !scope || scope === "all" || (scope === "upcoming" ? item.date >= today : item.date < today);
      return matchesTeam && matchesDate && matchesScope;
    });
  }
  function apply() { render(filtered()); }
  function populateTeams(teams) {
    if (!teamSelect) return;
    V.list(teams).forEach(function (team) {
      const option = document.createElement("option");
      option.value = team.id; option.textContent = team.name;
      teamSelect.appendChild(option);
    });
  }
  V.setState(node, "Loading fixtures...");
  Promise.all([V.api.get("/fixtures"), V.api.get("/teams")]).then(function (values) {
    records = V.list(values[0]); populateTeams(values[1]); apply();
  }).catch(function () { V.setState(node, "Fixtures are temporarily unavailable.", "error"); });
  [teamSelect, dateInput, scopeSelect].forEach(function (input) { if (input) input.addEventListener("change", apply); });
}());