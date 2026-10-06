(function () {
  "use strict";

  const V = window.VUT;

  const navItems = [
    ["index.html", "Overview"],
    ["teams.html", "Teams"],
    ["players.html", "Players"],
    ["fixtures.html", "Fixtures"],
    ["results.html", "Results"],
    ["news.html", "News"],
    ["gallery.html", "Gallery"],
    ["messages.html", "Messages"],
    ["settings.html", "Settings"]
  ];

  function idOf(item) {
    return item && (item.id || item._id || item.uuid);
  }

  function setupShell() {
    const sidebar = document.querySelector(".admin-sidebar");
    const nav = document.querySelector(".admin-nav");

    if (nav) {
      const current = location.pathname.split("/").pop() || "index.html";

      nav.innerHTML = navItems.map(function (item) {
        return '<a href="' + item[0] + '"' +
          (current === item[0] ? ' aria-current="page"' : "") +
          ">" + item[1] + "</a>";
      }).join("");
    }

    const toggle = document.querySelector(".admin-menu-toggle");

    if (toggle && sidebar) {
      toggle.addEventListener("click", function () {
        sidebar.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", function () {
        sessionStorage.removeItem("vut_hockey_token");
        location.href = "login.html";
      });
    });
  }

  async function boot() {
    if (!V.requireAuth()) return;

    setupShell();

    try {
      const user = await V.api.get("/auth/me");

      document.querySelectorAll("[data-admin-user]").forEach(function (node) {
        node.textContent = user.name || user.email || "Administrator";
      });
    } catch (error) {
      sessionStorage.removeItem("vut_hockey_token");
      location.href = "login.html";
    }
  }

  async function setupSelectFields(form, fields) {
    const selectFields = fields.filter(function (field) {
      return field.type === "select";
    });

    for (const field of selectFields) {
      const input = form.elements[field.name];

      if (!input) continue;

      const select = document.createElement("select");

      select.id = input.id;
      select.name = input.name;
      select.required = input.required;
      select.className = input.className;

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = field.placeholder || "Select an option";
      placeholder.disabled = true;
      placeholder.selected = true;

      select.appendChild(placeholder);

      try {
        const data = await V.api.get(field.optionsEndpoint);
        const options = V.list(data);

        options.forEach(function (option) {
          const element = document.createElement("option");

          element.value = option[field.optionValue];
          element.textContent = option[field.optionLabel];

          select.appendChild(element);
        });

        input.replaceWith(select);
      } catch (error) {
        console.error("Could not load options for " + field.name, error);
      }
    }
  }

  function renderForm(form, fields, item) {
    fields.forEach(function (field) {
      const input = form.elements[field.name];

      if (!input) return;

      if (input.type === "file") return;

      if (input.type === "checkbox") {
        input.checked = Boolean(item && item[field.name]);
      } else {
        input.value =
          item && item[field.name] !== undefined
            ? item[field.name]
            : "";
      }
    });

    const id = form.querySelector("[name=id]");

    if (id) {
      id.value = item ? idOf(item) || "" : "";
    }
  }

  function formData(form, fields) {
    const hasFile = fields.some(function (field) {
      const input = form.elements[field.name];

      return input && input.type === "file";
    });

    if (hasFile) {
      const multipart = new FormData();

      fields.forEach(function (field) {
        const input = form.elements[field.name];

        if (!input) return;

        if (input.type === "file") {
          if (input.files && input.files[0]) {
            multipart.append(field.name, input.files[0]);
          }
        } else if (input.type === "checkbox") {
          multipart.append(
            field.name,
            input.checked ? "true" : "false"
          );
        } else if (input.value !== "") {
          multipart.append(field.name, input.value);
        }
      });

      return multipart;
    }

    const data = {};

    fields.forEach(function (field) {
      const input = form.elements[field.name];

      if (!input) return;

      if (input.type === "checkbox") {
        data[field.name] = input.checked;
      } else if (input.value !== "") {
        data[field.name] =
          field.type === "number"
            ? Number(input.value)
            : input.value;
      }
    });

    return data;
  }

  function crudPage(config) {
    const listNode = document.querySelector("[data-admin-list]");
    const form = document.querySelector("[data-admin-form]");
    const feedback = document.querySelector("[data-admin-feedback]");
    const titleNode = document.querySelector("[data-form-title]");

    const colspan =
      config.columns.length + (config.status ? 2 : 1);

    let records = [];

    function show(message, type) {
      if (!feedback) return;

      feedback.textContent = message;
      feedback.className = "admin-feedback " + (type || "");
      feedback.hidden = false;
    }

    function render() {
      if (!records.length) {
        listNode.innerHTML =
          '<tr><td class="empty-cell" colspan="' +
          colspan +
          '">' +
          config.empty +
          "</td></tr>";

        return;
      }

      listNode.innerHTML = records.map(function (item) {
        return (
          "<tr>" +
          config.columns.map(function (column) {
            return (
              "<td>" +
              V.esc(column.value(item)) +
              "</td>"
            );
          }).join("") +

          "<td>" +
          (
            config.status
              ? '<select class="status-select" data-status="' +
                V.esc(idOf(item)) +
                '" aria-label="Message status">' +
                '<option value="new"' +
                (item.status === "new" ? " selected" : "") +
                ">New</option>" +
                '<option value="read"' +
                (item.status === "read" ? " selected" : "") +
                ">Read</option>" +
                '<option value="archived"' +
                (item.status === "archived" ? " selected" : "") +
                ">Archived</option>" +
                "</select>"
              : ""
          ) +
          "</td>" +

          "<td><div class=\"actions\">" +

          (
            config.status
              ? ""
              : '<button class="button button-muted button-small" type="button" data-edit="' +
                V.esc(idOf(item)) +
                '">Edit</button>'
          ) +

          '<button class="button button-danger button-small" type="button" data-delete="' +
          V.esc(idOf(item)) +
          '">Delete</button>' +

          "</div></td></tr>"
        );
      }).join("");

      listNode.querySelectorAll("[data-edit]").forEach(function (button) {
        button.addEventListener("click", function () {
          const item = records.find(function (record) {
            return String(idOf(record)) === button.dataset.edit;
          });

          renderForm(form, config.fields, item);

          if (titleNode) {
            titleNode.textContent =
              "Edit " + config.singular;
          }

          form.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      });

      listNode.querySelectorAll("[data-delete]").forEach(function (button) {
        button.addEventListener("click", async function () {
          if (
            !window.confirm(
              "Delete this " +
              config.singular +
              "? This cannot be undone."
            )
          ) {
            return;
          }

          try {
            await V.api.remove(
              config.endpoint +
              "/" +
              encodeURIComponent(button.dataset.delete)
            );

            show(config.singular + " deleted.");

            await load();
          } catch (error) {
            show(error.message, "error");
          }
        });
      });

      listNode.querySelectorAll("[data-status]").forEach(function (select) {
        select.addEventListener("change", async function () {
          try {
            await V.api.put(
              config.endpoint +
              "/" +
              encodeURIComponent(select.dataset.status),
              {
                status: select.value
              }
            );

            show("Message status updated.");
          } catch (error) {
            show(error.message, "error");
          }
        });
      });
    }

    async function load() {
      listNode.innerHTML =
        '<tr><td class="empty-cell" colspan="' +
        colspan +
        '">Loading ' +
        config.plural.toLowerCase() +
        "...</td></tr>";

      try {
        records = V.list(
          await V.api.get(config.endpoint)
        );

        render();
      } catch (error) {
        listNode.innerHTML =
          '<tr><td class="empty-cell" colspan="' +
          colspan +
          '">' +
          V.esc(error.message) +
          "</td></tr>";
      }
    }

    if (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const id =
          form.elements.id &&
          form.elements.id.value;

        const data =
          formData(form, config.fields);

        try {
          if (id) {
            await V.api.put(
              config.endpoint +
              "/" +
              encodeURIComponent(id),
              data
            );
          } else {
            await V.api.post(
              config.endpoint,
              data
            );
          }

          show(
            config.singular +
            (id ? " updated." : " created.")
          );

          form.reset();

          if (form.elements.id) {
            form.elements.id.value = "";
          }

          if (titleNode) {
            titleNode.textContent =
              "Add " + config.singular;
          }

          await load();
        } catch (error) {
          show(error.message, "error");
        }
      });

      const cancel =
        form.querySelector("[data-cancel]");

      if (cancel) {
        cancel.addEventListener("click", function () {
          form.reset();

          if (form.elements.id) {
            form.elements.id.value = "";
          }

          if (titleNode) {
            titleNode.textContent =
              "Add " + config.singular;
          }
        });
      }

      setupSelectFields(
        form,
        config.fields
      );
    }

    load();
  }

  window.VUTAdmin = {
    boot,
    crudPage
  };
}());