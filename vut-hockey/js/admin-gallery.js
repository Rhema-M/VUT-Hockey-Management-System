(function () {
  "use strict";

  const teamSelect = document.querySelector("#team_id");

  async function loadTeams() {
    if (!teamSelect) return;

    try {
      const teams = VUT.list(await VUT.api.get("/teams"));

      teamSelect.innerHTML =
        '<option value="" selected>Select a team</option>';

      teams.forEach(function (team) {
        const option = document.createElement("option");

        option.value = team.id;
        option.textContent = team.name;

        teamSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Failed to load teams:", error);

      teamSelect.innerHTML =
        '<option value="" selected>Could not load teams</option>';
    }
  }

  loadTeams();

  window.VUTAdmin.crudPage({
    endpoint: "/gallery",
    singular: "gallery item",
    plural: "Gallery",
    empty: "No gallery items added.",

    fields: [
      { name: "image", type: "file" },
      { name: "caption" },
      { name: "category" },
      { name: "team_id", type: "number" }
    ],

    columns: [
      {
        value: function (x) {
          return x.caption || "Untitled";
        }
      },
      {
        value: function (x) {
          return x.image || "Not listed";
        }
      },
      {
        value: function (x) {
          return x.category || "—";
        }
      }
    ]
  });
}());