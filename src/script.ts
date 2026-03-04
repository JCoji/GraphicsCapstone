import * as THREE from 'three';
import { init, handleResize, createAndRenderScene } from './utils';

window.addEventListener('load', () => {
    const { camera, renderer } = init();
    window.addEventListener('resize', () => handleResize(camera, renderer));
    const scene = createAndRenderScene(renderer, camera);
    scene.background = new THREE.Color(0x333333);
    renderer.render(scene, camera);
});
