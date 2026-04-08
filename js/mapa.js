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
  // TODO: trocar por mapa.jpg (TextureLoader em assets/mapa.jpg como textura/fundo da cena)

  const focusPoint = new THREE.Vector3(0, 1, 0);

  const camera = new THREE.PerspectiveCamera(
    50,
    1,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 4);
  camera.lookAt(focusPoint);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xc8a84b, 1.5);
  sun.position.set(2, 8, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0x0f2840, 0xc8a84b, 0.4);
  scene.add(hemi);

  const groundGeo = new THREE.PlaneGeometry(10, 10);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a1f35 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(focusPoint);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.8;
  controls.maxPolarAngle = 1.8;
  controls.minDistance = 2;
  controls.maxDistance = 12;
  controls.update();

  let characterRoot = null;
  let baseModelHeight = 1;

  function applyCharacterScale() {
    if (!characterRoot) return;
    const dist = camera.position.distanceTo(focusPoint);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
    const targetHeight = visibleHeight * 0.7;
    characterRoot.scale.setScalar(targetHeight / baseModelHeight);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    applyCharacterScale();
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
      root.updateMatrixWorld(true);

      const boxSized = new THREE.Box3().setFromObject(root);
      baseModelHeight = Math.max(boxSized.getSize(new THREE.Vector3()).y, 1e-6);

      root.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = false;
        }
      });

      characterRoot = root;
      applyCharacterScale();
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
