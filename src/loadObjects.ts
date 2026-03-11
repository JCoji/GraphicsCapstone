import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();

const textureLoader = new THREE.TextureLoader();

const applyBasicMaterial = (obj: THREE.Group, color: number) => {
    obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        }
    });
};

const applyStandardMaterial = (obj: THREE.Group, color: number, map: THREE.Texture | null = null) => {
    obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color, map, side: THREE.DoubleSide });
        }
    });
};

const addGround = (scene: THREE.Scene) => {
    const geometry = new THREE.CircleGeometry(30, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0x4caf50, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(10, -1, 11);
    scene.add(ground);
};

export const loadObjects = (scene: THREE.Scene) => {
    addGround(scene);
    loader.load(
        '/sled_slope_structure.obj',
        (obj) => {
            applyBasicMaterial(obj, 0xffffff);
            scene.add(obj);
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
            console.log('ice loaded', obj);
        },
        undefined,
        (err) => console.error('Failed to load ice:', err)
    );

    loader.load(
        '/sled_toboggan_improved.obj',
        (obj) => {
            const texture  =  textureLoader.load('/wood_texture.jpg')
            //0x633200
            applyStandardMaterial(obj,  0xffffff, texture);
            scene.add(obj);
            console.log('Sled Loaded', obj);
            obj.position.set(10, 5, 10);
            
        },
        undefined,
        (err) => console.error('Failed to load sled:', err)
    );
};
