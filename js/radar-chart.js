/**
 * Gráfico radar em canvas — 7 eixos, preenchimento dourado suave.
 */
(function (global) {
  "use strict";

  var GOLD = "#C8A84B";
  var GOLD_FILL = "rgba(200, 168, 75, 0.22)";
  var GRID = "rgba(0, 19, 38, 0.09)";
  var AXIS = "rgba(0, 19, 38, 0.1)";
  var RING = "rgba(200, 168, 75, 0.4)";

  function drawRadarChart(canvas, scores, labels) {
    if (!canvas || !canvas.getContext || !scores || !labels || scores.length !== labels.length) {
      return;
    }

    var dpr = Math.min(global.window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(rect.width, 280);
    var h = Math.max(rect.height, 280);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    var ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    var cx = w / 2;
    var cy = h / 2;
    var R = Math.min(w, h) * 0.36;
    var n = scores.length;
    var angle0 = -Math.PI / 2;
    var step = (2 * Math.PI) / n;

    var g;
    var i;
    var a;
    var r;
    var x;
    var y;

    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    for (g = 1; g <= 4; g++) {
      r = (R * g) / 4;
      ctx.beginPath();
      for (i = 0; i <= n; i++) {
        a = angle0 + (i % n) * step;
        x = cx + Math.cos(a) * r;
        y = cy + Math.sin(a) * r;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.strokeStyle = AXIS;
    for (i = 0; i < n; i++) {
      a = angle0 + i * step;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }

    ctx.strokeStyle = RING;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (i = 0; i <= n; i++) {
      a = angle0 + (i % n) * step;
      x = cx + Math.cos(a) * R;
      y = cy + Math.sin(a) * R;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    for (i = 0; i < n; i++) {
      a = angle0 + i * step;
      var t = Math.max(0, Math.min(100, scores[i])) / 100;
      x = cx + Math.cos(a) * R * t;
      y = cy + Math.sin(a) * R * t;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = GOLD_FILL;
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#43474d";
    ctx.font = '600 11px "Public Sans", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var labelR = R * 1.14;
    for (i = 0; i < n; i++) {
      a = angle0 + i * step;
      x = cx + Math.cos(a) * labelR;
      y = cy + Math.sin(a) * labelR;
      ctx.fillText(labels[i], x, y);
    }
  }

  global.drawTalmidimRadarChart = drawRadarChart;
})(typeof window !== "undefined" ? window : this);
