import * as THREE from 'three';

export const handleResize = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): void => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

export const init = (): { camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer } => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor(new THREE.Color(0x000000));
    const camera = new THREE.PerspectiveCamera();

    window.addEventListener('resize', () => handleResize(camera, renderer));

    return { camera, renderer };
}

export const createAndRenderScene = (renderer: THREE.WebGLRenderer, camera: THREE.Camera): THREE.Scene => {
    const scene = new THREE.Scene();
    renderer.render(scene, camera);
    return scene;
}
