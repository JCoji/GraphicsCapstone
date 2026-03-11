import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { init, handleResize, createAndRenderScene } from './utils';

window.addEventListener('load', () => {
    const { camera, renderer } = init();
    window.addEventListener('resize', () => handleResize(camera, renderer));
    const scene = createAndRenderScene(renderer, camera);
    scene.background = new THREE.Color(0x333333);

    // Position camera to view full slope (X:0-21, Y:0-8, Z:-5.5 to 28)
    camera.position.set(35, 20, -10);
    camera.lookAt(10, 3, 10);
    camera.near = 0.1;
    camera.far = 1000;
    camera.fov = 60;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, -10);
    scene.add(dirLight);

    const loader = new OBJLoader();

    const applyBasicMaterial = (obj: THREE.Group, color: number) => {
        obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color });
            }
        });
    };

    loader.load(
        '/sled_slope_structure.obj',
        (obj) => {
            applyBasicMaterial(obj, 0x8888ff);
            scene.add(obj);
            renderer.render(scene, camera);
            console.log('structure loaded', obj);
        },
        undefined,
        (err) => console.error('Failed to load structure:', err)
    );

    loader.load(
        '/sled_slope_ice.obj',
        (obj) => {
            applyBasicMaterial(obj, 0xaaddff);
            scene.add(obj);
            renderer.render(scene, camera);
            console.log('ice loaded', obj);
        },
        undefined,
        (err) => console.error('Failed to load ice:', err)
    );

    renderer.render(scene, camera);
});
