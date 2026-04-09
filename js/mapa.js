/**
 * Parallax suave no fundo (.mapa-bg) — apenas mousemove.
 */
(function () {
  "use strict";

  function init() {
    var el = document.querySelector(".mapa-bg");
    if (!el) {
      return;
    }

    document.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 12;
      var y = (e.clientY / window.innerHeight - 0.5) * 8;
      el.style.transform =
        "scale(1.06) translate(" + -x + "px, " + -y + "px)";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
