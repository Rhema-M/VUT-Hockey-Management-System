(function () {
  "use strict";
  const V = window.VUT, node = document.querySelector("#results-list");
  const teamSelect = document.querySelector("#result-team");
  const dateInput = document.querySelector("#result-date");
  let records = [];
  function render(items) {
    if (!items.length) return V.setState(node, "No results available.");
    node.innerHTML = items.map(function (item) {
      const score = item.team_score !== undefined ? item.team_score + " – " + item.opponent_score : "Score not recorded";
      return '<article class="list-row"><time>' + V.esc(V.date(item.date)) +
        '</time><div><h3>' + V.esc(item.team_name || "VUT Hockey") + ' <span class="eyebrow">vs</span> ' +
        V.esc(item.opponent || "Opponent not listed") + '</h3><p>' + V.esc(item.competition || "Result") + '</p></div><strong>' +
        V.esc(score) + "</strong></article>";
    }).join("");
  }
  function filtered() {
    const team = teamSelect && teamSelect.value;
    const date = dateInput && dateInput.value;
    return records.filter(function (item) {
      return (!team || String(item.team_id) === team) && (!date || item.date === date);
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
  V.setState(node, "Loading results...");
  Promise.all([V.api.get("/results"), V.api.get("/teams")]).then(function (values) {
    records = V.list(values[0]); populateTeams(values[1]); apply();
  }).catch(function () { V.setState(node, "Results are temporarily unavailable.", "error"); });
  [teamSelect, dateInput].forEach(function (input) { if (input) input.addEventListener("change", apply); });
}());