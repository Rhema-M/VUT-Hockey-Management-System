(function () {
  "use strict";

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
    endpoint: "/fixtures",
    singular: "fixture",
    plural: "Fixtures",
    empty: "No fixtures added.",

    fields: [
      { name: "team_id", type: "number" },
      { name: "opponent" },
      { name: "date" },
      { name: "time" },
      { name: "venue" },
      { name: "competition" },
      { name: "status" }
    ],

    columns: [
      {
        value: function (x) {
          return VUT.date(x.date);
        }
      },
      {
        value: function (x) {
          return (x.team_name || "VUT Hockey") +
            " vs " +
            (x.opponent || "Opponent");
        }
      },
      {
        value: function (x) {
          return x.venue || "Not listed";
        }
      }
    ]
  });
}());