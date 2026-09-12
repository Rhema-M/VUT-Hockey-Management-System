(function () {
  "use strict";
  const V = window.VUT, form = document.querySelector("#settings-form"), feedback = document.querySelector("[data-admin-feedback]");
  async function load() {
    try {
      const data = await V.api.get("/settings");
      Object.keys(data || {}).forEach(function (key) { if (form.elements[key]) form.elements[key].value = data[key] || ""; });
    } catch (error) { V.feedback(feedback, error.message, "error"); }
  }
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    try { await V.api.put("/settings", Object.fromEntries(new FormData(form).entries())); V.feedback(feedback, "Settings saved.", "success"); }
    catch (error) { V.feedback(feedback, error.message, "error"); }
  });
  load();
}());