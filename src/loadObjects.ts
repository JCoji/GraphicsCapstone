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
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
        }
    });
};

const addGround = (scene: THREE.Scene) => {
    const geometry = new THREE.CircleGeometry(30, 64);
    const material = new THREE.MeshStandardMaterial({ color: 0x4caf50, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(10, -1, 11);
    ground.receiveShadow = true;
    scene.add(ground);
};

export const loadObjects = (scene: THREE.Scene) => {
    addGround(scene);
    loader.load(
        '/sled_slope_structure.obj',
        (obj) => {
            applyBasicMaterial(obj, 0xffffff);
            // applyStandardMaterial(obj, 0xffffff);
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
            // applyStandardMaterial(obj, 0xaaddff);
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
            applyStandardMaterial(obj,  0xffffff, texture);

            const positions = [
                {x: 2, y:8, z:-2},
                {x: 6, y:8, z:-2},
                {x: 10, y:8, z:-2},
                {x: 14, y:8, z:-2},
                {x: 18, y:8, z:-2},
            ];

            positions.forEach((pos, i)=> {
                const sled = obj.clone();
                sled.name = `sled_${i}`;
                sled.position.set(pos.x, pos.y, pos.z);
                sled.scale.z = -1;
                scene.add(sled)
                console.log(`${sled.name} loaded`)
            });

        },
        undefined,
        (err) => console.error('Failed to load sled(s):', err)
    );
};
