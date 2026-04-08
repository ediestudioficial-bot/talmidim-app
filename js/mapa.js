import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("assets/mapa.png", (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  });

  const camera = new THREE.PerspectiveCamera(
    55,
    1,
    0.1,
    1000
  );
  camera.position.set(1.8, 1.6, 3.5);
  camera.lookAt(0.8, 0.8, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 2.0));

  const sun = new THREE.DirectionalLight(0xffd580, 2.5);
  sun.position.set(3, 8, 3);
  scene.add(sun);

  scene.add(new THREE.HemisphereLight(0xffd580, 0x8b6914, 0.6));

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
      const root = gltf.scene;
      root.rotation.y = 0;
      root.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);
      root.updateMatrixWorld(true);

      const boxSized = new THREE.Box3().setFromObject(root);
      const height = Math.max(boxSized.getSize(new THREE.Vector3()).y, 1e-6);
      root.scale.setScalar(1.8 / height);
      root.updateMatrixWorld(true);

      root.position.add(new THREE.Vector3(1.8, 0, 1.5));

      scene.add(root);
      statusEl.remove();
    },
    undefined,
    (error) => {
      console.error("Erro ao carregar GLB:", error);
      statusEl.textContent =
        "Não foi possível carregar o Peregrino. Verifique se assets/peregrino.glb existe.";
      statusEl.classList.add("mapa-status--error");
    }
  );

  function tick() {
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
  }
  tick();
}
