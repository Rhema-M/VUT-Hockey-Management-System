(function () {
  "use strict";
  const V = window.VUT, form = document.querySelector("#contact-form"), message = document.querySelector("#contact-feedback");
  if (!form) return;
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true; button.textContent = "Sending";
    const body = Object.fromEntries(new FormData(form).entries());
    try { await V.api.post("/contact", body); V.feedback(message, "Message sent. Thank you for getting in touch.", "success"); form.reset(); }
    catch (error) { V.feedback(message, error.message || "The message could not be sent.", "error"); }
    button.disabled = false; button.textContent = "Send message";
  });
}());