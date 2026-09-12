// Affiliate ref capture & signup-link forwarding.
// 1) Reads ?ref=CODE from the current URL and stores it for 90 days.
// 2) On any click of a my.wealthgrid.ai/signup link, appends the ref so the
//    portal sees it and attributes the new user to the affiliate.
(function () {
  var STORAGE_KEY = "wg_ref";
  var TTL_MS = 90 * 24 * 60 * 60 * 1000;

  var urlRef = new URLSearchParams(window.location.search).get("ref");
  if (urlRef) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: urlRef, expires: Date.now() + TTL_MS }));
    } catch (e) { /* storage disabled — fall back to current URL only */ }
  }

  function getRef() {
    if (urlRef) return urlRef;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.code || !parsed.expires || parsed.expires < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed.code;
    } catch (e) { return null; }
  }

  document.addEventListener("click", function (e) {
    var target = e.target;
    while (target && target.nodeName !== "A") target = target.parentElement;
    if (!target) return;
    var href = target.getAttribute("href");
    if (!href || href.indexOf("my.wealthgrid.ai/signup") === -1) return;
    if (href.indexOf("ref=") !== -1) return;
    var ref = getRef();
    if (!ref) return;
    target.setAttribute("href", href + (href.indexOf("?") === -1 ? "?" : "&") + "ref=" + encodeURIComponent(ref));
  }, true);
})();
