(function () {
  "use strict";
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }
  document.querySelectorAll("[data-year]").forEach(function (node) { node.textContent = String(new Date().getFullYear()); });
  window.addEventListener("scroll", function () {
    document.querySelectorAll(".reveal").forEach(function (node) {
      if (node.getBoundingClientRect().top < window.innerHeight * .9) node.classList.add("is-visible");
    });
  }, { passive: true });
}());