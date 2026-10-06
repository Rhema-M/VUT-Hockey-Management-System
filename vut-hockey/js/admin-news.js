(function () {
  "use strict";

  function formatDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 16);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
  }

  const originalRenderForm = window.VUTAdmin.crudPage;

  window.VUTAdmin.crudPage({
    endpoint: "/news",
    singular: "news item",
    plural: "News",
    empty: "No news items added.",

    fields: [
      { name: "title" },
      { name: "slug" },
      { name: "summary" },
      { name: "content" },
      { name: "published_at" },
      { name: "published" },
      { name: "image", type: "file" }
    ],

    columns: [
      {
        value: function (x) {
          return x.title || "Untitled";
        }
      },
      {
        value: function (x) {
          return x.summary || "Information coming soon.";
        }
      },
      {
        value: function (x) {
          return VUT.date(x.published_at || x.created_at);
        }
      }
    ]
  });
}());