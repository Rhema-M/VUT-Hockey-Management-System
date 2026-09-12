(function () {
  "use strict";
  const V = window.VUT;
  const resources = [["teams", "Teams"], ["players", "Players"], ["fixtures", "Fixtures"], ["messages", "Messages"]];
  Promise.all(resources.map(function (resource) { return V.api.get("/" + resource[0]).then(function (data) { const node = document.querySelector('[data-count="' + resource[0] + '"]'); if (node) node.textContent = V.list(data).length; }).catch(function () {}); })).then(function () {});
}());