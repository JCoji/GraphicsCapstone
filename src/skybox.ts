import * as THREE from 'three';

export const addSkybox = (scene: THREE.Scene, brightness = 1.0): THREE.Mesh => {
    const skyboxTexture = new THREE.TextureLoader().load('/Panorama_Sky_06.png');
    const skybox = new THREE.Mesh(
        new THREE.SphereGeometry(500, 60, 40),
        new THREE.MeshBasicMaterial({
            map: skyboxTexture,
            side: THREE.BackSide,
            color: new THREE.Color(brightness, brightness, brightness),
        })
    );
    scene.add(skybox);
    return skybox;
};
