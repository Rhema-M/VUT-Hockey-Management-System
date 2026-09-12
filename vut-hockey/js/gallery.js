(function () {
  "use strict";
  const V = window.VUT, node = document.querySelector("#gallery-list");
  V.api.get("/gallery").then(function (data) {
    const items = V.list(data);
    if (!items.length) return V.setState(node, "Information coming soon.");
    node.innerHTML = items.map(function (item) {
      const title = item.title || item.caption || "Gallery image";
      const image = item.image;
      return '<article class="gallery-item">' + (image ? '<img src="' + V.esc(image) + '" alt="' + V.esc(title) + '">' : '<div class="placeholder"><span>VUT HOCKEY</span></div>') +
        '<div class="gallery-caption">' + V.esc(title) + "</div></article>";
    }).join("");
  }).catch(function () { V.setState(node, "Gallery is temporarily unavailable.", "error"); });
}());