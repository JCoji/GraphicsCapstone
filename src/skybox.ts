import * as THREE from 'three';

export const addSkybox = (scene: THREE.Scene): void => {
    const skyboxTexture = new THREE.TextureLoader().load('/Panorama_Sky_06.png');
    const skybox = new THREE.Mesh(
        new THREE.SphereGeometry(500, 60, 40),
        new THREE.MeshBasicMaterial({ map: skyboxTexture, side: THREE.BackSide })
    );
    scene.add(skybox);
};
