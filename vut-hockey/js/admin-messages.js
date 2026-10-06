(function () {
    "use strict";

    window.VUTAdmin.crudPage({
        endpoint: "/contact",
        singular: "message",
        plural: "Messages",
        empty: "No contact messages.",
        status: true, fields: [],
        columns: [
            { value: function (x) { return x.name || "Not listed"; } },
            { value: function (x) { return x.email || "Not listed"; } },
            { value: function (x) { return (x.message || "").slice(0, 90) || "Empty message"; } },
            { value: function (x) { return VUT.formatDateTime(x.created_at || x.date); } }
        ]
    });
}());