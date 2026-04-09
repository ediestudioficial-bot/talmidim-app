/**
 * Parallax suave no fundo do mapa (.mapa-bg). Só roda se o elemento existir.
 */
(function () {
  "use strict";

  function init() {
    var el = document.querySelector(".mapa-bg");
    if (!el) {
      return;
    }

    var coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;

    function applyMouse(e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 12;
      var y = (e.clientY / window.innerHeight - 0.5) * 8;
      el.style.transform =
        "scale(1.06) translate(" + -x + "px, " + -y + "px)";
    }

    function applyOrientation(e) {
      var x = (e.gamma || 0) * 0.3;
      var y = (e.beta ? e.beta - 45 : 0) * 0.2;
      el.style.transform =
        "scale(1.06) translate(" + x + "px, " + y + "px)";
    }

    if (coarse && typeof window.DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", applyOrientation, true);
    } else {
      document.addEventListener("mousemove", applyMouse);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
