/* Shared API client. All requests use the backend envelope { success, data }. */
(function () {
  "use strict";
  const API_BASE = "/api";

  async function request(path, options) {
    const config = Object.assign({ headers: {} }, options || {});
    config.headers = Object.assign({}, config.headers);
    if (!(config.body instanceof FormData)) config.headers["Content-Type"] = "application/json";
    const token = sessionStorage.getItem("vut_hockey_token");
    if (token) config.headers.Authorization = "Bearer " + token;
    const response = await fetch(API_BASE + path, config);
    let payload = null;
    try { payload = await response.json(); } catch (error) { payload = { success: false, error: "The server returned an invalid response." }; }
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || "The request could not be completed.");
    }
    return payload.data;
  }

  function get(path) { return request(path); }
  function send(path, method, body) {
    return request(path, {
      method: method,
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }
  function post(path, body) { return send(path, "POST", body); }
  function put(path, body) { return send(path, "PUT", body); }
  function remove(path) { return request(path, { method: "DELETE" }); }

  function list(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return data ? [data] : [];
  }
  function esc(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function date(value, options) {
    if (!value) return "Date to be confirmed";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return esc(value);
    return parsed.toLocaleDateString(undefined, options || { day: "numeric", month: "short", year: "numeric" });
  }
  function formatDateTime(value) {
    if (!value) return "Not recorded";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? esc(value) : parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
  function setState(node, message, type) {
    if (!node) return;
    node.innerHTML = '<div class="data-state ' + (type || "") + '">' + esc(message) + "</div>";
  }
  function feedback(node, message, type) {
    if (!node) return;
    node.className = "form-message " + (type || "");
    node.textContent = message;
    node.hidden = false;
  }
  function requireAuth() {
    if (!sessionStorage.getItem("vut_hockey_token")) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }
  window.VUT = { api: { request, get, post, put, remove }, list, esc, date, formatDateTime, setState, feedback, requireAuth };
}());