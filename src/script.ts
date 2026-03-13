import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { init, handleResize, createAndRenderScene } from './utils';
import { loadObjects } from './loadObjects';

window.addEventListener('load', () => {
    const { camera, renderer } = init();
    window.addEventListener('resize', () => handleResize(camera, renderer));
    const scene = createAndRenderScene(renderer, camera);
    scene.background = new THREE.Color(0x333333);

    // Position camera to view full slope (X:0-21, Y:0-8, Z:-5.5 to 28)
    camera.position.set(-4, 16, 8);
    camera.lookAt(10, 8, -2);
    camera.near = 0.1;
    camera.far = 1000;
    camera.fov = 60;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(30, 20, 40);
    scene.add(dirLight);

    // Shadow lighting
    const d = 50

    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.bias = -0.001

    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(10, 8, -2);
    controls.update();

    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    loadObjects(scene);
});
