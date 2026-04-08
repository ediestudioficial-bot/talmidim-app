import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById("canvas-container");
if (!container) {
  console.error("mapa.js: elemento #canvas-container não encontrado.");
} else {
  const statusEl = document.createElement("div");
  statusEl.className = "mapa-status";
  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-live", "polite");
  statusEl.textContent = "Carregando Peregrino...";
  container.appendChild(statusEl);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f2840);

  const camera = new THREE.PerspectiveCamera(
    50,
    1,
    0.1,
    1000
  );
  camera.position.set(0, 3, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xc8a84b, 1.0);
  sun.position.set(0, 12, 2);
  scene.add(sun);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.update();

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  resize();
  window.addEventListener("resize", resize);

  const loader = new GLTFLoader();
  loader.load(
    "assets/peregrino.glb",
    (gltf) => {
      console.log("GLB carregado com sucesso", gltf);
      const root = gltf.scene;
      root.rotation.y = Math.PI;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
      const fit = 1.5 / maxDim;
      root.scale.setScalar(fit);

      scene.add(root);
      statusEl.remove();
    },
    (progress) => {
      console.log("Progresso:", progress.loaded, "/", progress.total);
    },
    (error) => {
      console.error("Erro ao carregar GLB:", error);
      statusEl.textContent =
        "Não foi possível carregar o Peregrino. Verifique se assets/peregrino.glb existe.";
      statusEl.classList.add("mapa-status--error");
    }
  );

  function tick() {
    requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  }
  tick();
}
