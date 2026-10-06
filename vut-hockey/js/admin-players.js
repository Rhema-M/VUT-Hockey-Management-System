(function () {
  "use strict";

  const form = document.querySelector("[data-admin-form]");
  const teamSelect = document.querySelector("#team_id");

  async function loadTeams() {
    if (!teamSelect) return;

    try {
      const teams = VUT.list(await VUT.api.get("/teams"));

      teamSelect.innerHTML =
        '<option value="" selected disabled>Select a team</option>';

      teams.forEach(function (team) {
        const option = document.createElement("option");

        option.value = team.id;
        option.textContent = team.name;

        teamSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Failed to load teams:", error);

      teamSelect.innerHTML =
        '<option value="" selected disabled>Could not load teams</option>';
    }
  }

  loadTeams();

  window.VUTAdmin.crudPage({
    endpoint: "/players",
    singular: "player",
    plural: "Players",
    empty: "No players added.",

    fields: [
      { name: "team_id", type: "number" },
      { name: "name" },
      { name: "position" },
      { name: "squad_number", type: "number" },
      { name: "biography" }
    ],

    columns: [
      {
        value: function (x) {
          return x.name || "Unnamed player";
        }
      },
      {
        value: function (x) {
          return x.position || "Not listed";
        }
      },
      {
        value: function (x) {
          return x.squad_number || "—";
        }
      }
    ]
  });
}());