import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const GLB_WALK = new URL("../assets/peregrino-walking.glb", import.meta.url).href;

const MODEL_POS = { x: 0.3, y: -1.2, z: 0 };
const MODEL_SCALE = 1.8;
const BASE_TIME_SCALE = 0.7;

let renderer;
let scene;
let camera;
let mixer;
let walkAction;
let clock;
let canvas;

function pickWalkClip(animations) {
  if (!animations || !animations.length) return null;
  var found = animations.find(function (a) {
    return /walk/i.test(a.name);
  });
  return found || animations[0];
}

function initThree() {
  canvas = document.getElementById("peregrino-canvas");
  if (!canvas) return;

  var w = canvas.clientWidth || window.innerWidth;
  var h = canvas.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(0, 2, 4);
  camera.lookAt(MODEL_POS.x, MODEL_POS.y + 0.5, MODEL_POS.z);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  var ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  var sun = new THREE.DirectionalLight(0xc8a84b, 1.25);
  sun.position.set(4, 8, 5);
  scene.add(sun);

  var fill = new THREE.DirectionalLight(0xfff4e0, 0.35);
  fill.position.set(-3, 4, -2);
  scene.add(fill);

  clock = new THREE.Clock();

  var loader = new GLTFLoader();
  loader.load(
    GLB_WALK,
    function (gltf) {
      var root = gltf.scene;
      root.position.set(MODEL_POS.x, MODEL_POS.y, MODEL_POS.z);
      root.scale.setScalar(MODEL_SCALE);
      root.rotation.y = 0;
      scene.add(root);

      var clip = pickWalkClip(gltf.animations);
      if (clip) {
        mixer = new THREE.AnimationMixer(root);
        walkAction = mixer.clipAction(clip);
        walkAction.loop = THREE.LoopRepeat;
        walkAction.clampWhenFinished = false;
        walkAction.timeScale = BASE_TIME_SCALE;
        walkAction.play();
      }

      window.mapaPeregrino3d = {
        setWalkTimeScale: function (t) {
          if (walkAction && typeof t === "number") walkAction.timeScale = t;
        },
        resetWalkTimeScale: function () {
          if (walkAction) walkAction.timeScale = BASE_TIME_SCALE;
        },
      };
    },
    undefined,
    function () {
      window.mapaPeregrino3d = null;
    }
  );

  function onResize() {
    if (!canvas || !camera || !renderer) return;
    var cw = canvas.clientWidth;
    var ch = canvas.clientHeight;
    if (cw < 1 || ch < 1) return;
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    renderer.setSize(cw, ch, false);
  }

  window.addEventListener("resize", onResize);
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement || canvas);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (mixer && clock) {
      mixer.update(clock.getDelta());
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }
  tick();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThree);
} else {
  initThree();
}
