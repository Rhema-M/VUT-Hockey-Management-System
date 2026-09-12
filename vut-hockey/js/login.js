(function () {
  "use strict";
  const V = window.VUT, form = document.querySelector("#login-form"), feedback = document.querySelector("#login-feedback");
  if (sessionStorage.getItem("vut_hockey_token")) location.href = "index.html";
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]"); button.disabled = true; button.textContent = "Signing in";
    try {
      const data = await V.api.post("/auth/login", Object.fromEntries(new FormData(form).entries()));
      const token = data && (data.token || data.access_token);
      if (!token) throw new Error("The server did not return an access token.");
      sessionStorage.setItem("vut_hockey_token", token); location.href = "index.html";
    } catch (error) { V.feedback(feedback, error.message, "error"); button.disabled = false; button.textContent = "Sign in"; }
  });
}());