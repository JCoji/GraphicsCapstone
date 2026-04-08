import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addStaticBody, addDynamicBody, createBoxShape, createMeshShape } from './physics';

const loader = new OBJLoader();
const gltfLoader = new GLTFLoader();

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
            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color, map, side: THREE.DoubleSide, roughness: 1.0, metalness: 0.0 });
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
        }
    });
};

const addGround = (scene: THREE.Scene) => {
    const geometry = new THREE.CircleGeometry(100, 64);
    const groundAlbedo    = textureLoader.load('/Snow-10/Snow010A_2K-PNG_Color.png');
    const groundNormal    = textureLoader.load('/Snow-10/Snow010A_2K-PNG_NormalGL.png');
    const groundDisp      = textureLoader.load('/Snow-10/Snow010A_2K-PNG_Displacement.png');
    const groundRoughness = textureLoader.load('/Snow-10/Snow010A_2K-PNG_Roughness.png');
    for (const tex of [groundAlbedo, groundNormal, groundDisp, groundRoughness]) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
    }
    const material = new THREE.MeshStandardMaterial({
        color: 0xe8f4ff,
        map: groundAlbedo,
        normalMap: groundNormal,
        bumpMap: groundDisp,
        bumpScale: 1,
        roughnessMap: groundRoughness,
        roughness: 0.15,
        metalness: 0.1,
        side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(10, 0, 11);
    ground.receiveShadow = true;
    scene.add(ground);

    const groundCollider = new THREE.Object3D();
    groundCollider.position.copy(ground.position);

    scene.add(groundCollider);

    const shape = createBoxShape(200, 0, 200);
    const body = addStaticBody(groundCollider, shape);
    body.setFriction(0.9);
};


export const loadObjects = (scene: THREE.Scene) => {
    addGround(scene);

    // Blue base layer — renders behind the snow overlay
    loader.load(
        '/sled_slope_structure_fixed_uv_v3.obj',
        (obj) => {
            applyStandardMaterial(obj, 0xaaddff);
            scene.add(obj);

            obj.updateMatrixWorld(true);

            obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;

                    const shape = createMeshShape(mesh);
                    const body = addStaticBody(mesh, shape);

                    body.setFriction(0.8);
                }
            });

            console.log('structure physics added');
        },
        undefined,
        (err) => console.error('Failed to load structure base:', err)
    );

    
    loader.load(
        '/sled_slope_structure_fixed_uv_v3.obj',
        (obj) => {
            const snowAlbedo    = textureLoader.load('/Snow-10/Snow010A_2K-PNG_Color.png');
            const snowNormal    = textureLoader.load('/Snow-10/Snow010A_2K-PNG_NormalGL.png');
            const snowDisp      = textureLoader.load('/Snow-10/Snow010A_2K-PNG_Displacement.png');
            const snowRoughness = textureLoader.load('/Snow-10/Snow010A_2K-PNG_Roughness.png');
            for (const tex of [snowAlbedo, snowNormal, snowDisp, snowRoughness]) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(0.5, 0.5);
            }
            obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                        color: 0xe8f4ff,
                        map: snowAlbedo,
                        normalMap: snowNormal,
                        bumpMap: snowDisp,
                        bumpScale: 1,
                        roughnessMap: snowRoughness,
                        roughness: 0.15,
                        transparent: true,
                        opacity: 0.9,
                        side: THREE.DoubleSide,
                        metalness: 0.1,
                        polygonOffset: true,
                        polygonOffsetFactor: -1,
                        polygonOffsetUnits: -1,
                    });
                    (child as THREE.Mesh).castShadow = true;
                    (child as THREE.Mesh).receiveShadow = true;
                }
            });
            scene.add(obj);
            console.log('structure loaded', obj);
        },
        undefined,
        (err) => console.error('Failed to load structure:', err)
    );

    loader.load(
        '/sled_slope_ice.obj',
        (obj) => {
            const iceAlbedo    = textureLoader.load('/ice_textures/Snow_basecolor.png');
            const iceNormal    = textureLoader.load('/ice_textures/Snow_normal.png');
            const iceDisp      = textureLoader.load('/ice_textures/Snow_height.png');
            const iceRoughness = textureLoader.load('/ice_textures/Snow_roughness.png');

            for (const tex of [iceAlbedo, iceNormal, iceDisp, iceRoughness]) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(1, 1);
            }

            obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {

                    (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                        color: 0xd1f1ff,
                        map: iceAlbedo,
                        normalMap: iceNormal,
                        bumpMap: iceDisp,
                        bumpScale: 1,
                        roughnessMap: iceRoughness,
                        roughness: 0.15,
                        side: THREE.DoubleSide,
                        metalness: 0.1,
                        polygonOffset: true,
                        polygonOffsetFactor: -2,
                        polygonOffsetUnits: -2,
                    });

                    (child as THREE.Mesh).castShadow = true;
                    (child as THREE.Mesh).receiveShadow = true;
                }
            });

            // obj.position.y += 0.38;
            scene.add(obj);

            obj.updateMatrixWorld(true);

            obj.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {

                    const mesh = child as THREE.Mesh;

                    const slopeShape = createMeshShape(mesh);

                    const body = addStaticBody(mesh, slopeShape);
                    body.setFriction(0.05);

                    console.log("slope physics added");
                }
            });

            console.log('ice loaded', obj);
        },
        undefined,
        (err) => console.error('Failed to load ice:', err)
    );

    const sleds: THREE.Group[] = [];

    loader.load(
        '/sled_toboggan_improved.obj',
        (obj) => {
            const texture  =  textureLoader.load('/wood1.jpg')
            applyStandardMaterial(obj,  0xffffff, texture);

            const positions = [
                {x: 2, y:8, z:1},
                {x: 6, y:8, z:2},
                {x: 10, y:8, z:10},
                {x: 14, y:8, z:2},
                {x: 18, y:8, z:0.5},
            ];

            positions.forEach((pos, i)=> {
                const sled = obj.clone();
                sled.name = `sled_${i}`;
                sled.position.set(pos.x, pos.y, pos.z);
                sled.scale.z = -1;
                scene.add(sled);

                const sledShape = createBoxShape(2, 0.5, 4);
                const body = addDynamicBody(sled, sledShape, 10);
                body.setFriction(0.05);
                
                sleds.push(sled);
                console.log(`${sled.name} loaded`);
            });

            loadAstronauts(sleds);
        },
        undefined,
        (err) => console.error('Failed to load sled(s):', err)
    );

    loadSnowParticles(scene);
};

const loadAstronauts = (sleds: THREE.Group[]) => {
    const astronautModels = [
        '/astronauts/Astronaut.glb',
        '/astronauts/Astronaut-2.glb',
        '/astronauts/Astronaut-3.glb',
    ];

    sleds.forEach((sled, idx) => {
        const astronautIdx = idx % astronautModels.length;

        gltfLoader.load(
            astronautModels[astronautIdx],
            (gltf) => {
                const astronaut = gltf.scene;
                astronaut.name = `astronaut_${idx}`;
                
                // Position astronaut seated on sled (relative position)
                astronaut.position.set(0, 0, 0);
                astronaut.scale.set(0.5, 0.5, 0.5);
                
                // Manipulate bones for seated pose
                poseAstronautSeated(astronaut);
                
                // Add astronaut as child of sled so it moves with it
                sled.add(astronaut);
                
                registerRagdoll(astronaut, sled);
                
                console.log(`${astronaut.name} loaded and attached to ${sled.name}`);
            },
            undefined,
            (err) => console.error(`Failed to load astronaut ${astronautModels[astronautIdx]}:`, err)
        );
    });
};

const poseAstronautSeated = (model: THREE.Group) => {
    const bones: { [key: string]: THREE.Bone } = {}

    // Traverse the model to find bones
    model.traverse((node) => {
        if (node instanceof THREE.Bone) {
            bones[node.name] = node;
        }
    });

    // Pose to seated position

    // Rotate hips back slightly
    bones.Hips.rotation.x -= Math.PI / 12;

    // Rotate upper legs up 90 degrees
    bones.UpperLegL.rotation.x -= Math.PI / 2;
    bones.UpperLegR.rotation.x -= Math.PI / 2;

    // Move feet up and forward
    bones.FootL.position.y += 0.008;
    bones.FootL.position.z += 0.006;
    bones.FootR.position.y += 0.008;
    bones.FootR.position.z += 0.006;

    // Rotate feet up 45 degrees
    bones.FootL.rotation.x -= Math.PI / 4;
    bones.FootR.rotation.x -= Math.PI / 4;

    // Lower object slightly into sled
    model.position.y -= 0.3;
};

// Snow particles
export let snowParticles: THREE.Points | null = null;

const loadSnowParticles = (scene: THREE.Scene) => {
    const flakeCount = 1000;

    const snowGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(flakeCount * 3);

    for (let i = 0; i < flakeCount; i++) {
        positions[i * 3]     = Math.random() * 200 - 100;
        positions[i * 3 + 1] = Math.random() * 100 + 10;
        positions[i * 3 + 2] = Math.random() * 200 - 100;
    }

    snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snowParticles = new THREE.Points(
        snowGeometry,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 }),
    );
    scene.add(snowParticles);
}

// Ragdoll data structure, leg bones not included since they anchor the models to the sleds
interface AstronautRagdoll {
    sled: THREE.Group;
    bones: {
        spine?:     THREE.Bone;
        neck?:      THREE.Bone;
        head?:      THREE.Bone;
        upperArmL?: THREE.Bone;
        upperArmR?: THREE.Bone;
        lowerArmL?: THREE.Bone;
        lowerArmR?: THREE.Bone;
    };
    restRotations: Map<THREE.Bone, THREE.Euler>;
    prevSledPos: THREE.Vector3;
}

const astronautRagdolls: AstronautRagdoll[] = [];

// Map bone names to their corresponding body parts
const BONE_ALIASES: Record<keyof AstronautRagdoll['bones'], string[]> = {
    spine:     ['Abdomen', 'Torso', 'Hips'],
    neck:      ['Neck'],
    head:      ['Head'],
    upperArmL: ['UpperArmL'],
    upperArmR: ['UpperArmR'],
    lowerArmL: ['LowerArmL'],
    lowerArmR: ['LowerArmR'],
};

const registerRagdoll = (model: THREE.Group, sled: THREE.Group) => {

    // Determine which bones correspond to which body parts 

    // List of bones
    const boneMap: Record<string, THREE.Bone> = {};
    model.traverse((node) => { if (node instanceof THREE.Bone) boneMap[node.name] = node; });

    const bones: AstronautRagdoll['bones'] = {} as AstronautRagdoll['bones'];

    // For each bone, find the first matching bone name based on aliases
    for (const [key, aliases] of Object.entries(BONE_ALIASES)) {
        const resolvedBone = aliases.map(alias => boneMap[alias]).find(Boolean);
        bones[key as keyof AstronautRagdoll['bones']] = resolvedBone;
    }

    // Ragdoll object
    const ragdoll: AstronautRagdoll = {
        sled,
        bones,
        restRotations: new Map(),
        prevSledPos: sled.getWorldPosition(new THREE.Vector3()),
    };

    // Rest rotations for bones to return to when not affected by physics
    for (const bone of Object.values(ragdoll.bones)) {
        if (bone) ragdoll.restRotations.set(bone, bone.rotation.clone());
    }

    astronautRagdolls.push(ragdoll);
};

export const updateAstronautRagdolls = (deltaTime: number) => {
    const dt = Math.max(deltaTime, 0.001); // Avoid division by zero
    const _sledPos = new THREE.Vector3();
    const _sledFwd = new THREE.Vector3();

    for (const ragdoll of astronautRagdolls) {
        
        // Sled velocity from position difference
        ragdoll.sled.getWorldPosition(_sledPos);
        const sledVel = _sledPos.clone().sub(ragdoll.prevSledPos).divideScalar(dt);
        ragdoll.prevSledPos.copy(_sledPos);

        // Project velocity onto the sled's forward axis to get speed
        ragdoll.sled.getWorldDirection(_sledFwd);
        const projectedSpeed = sledVel.dot(_sledFwd);
        const speed = Math.abs(projectedSpeed) > 0.01 ? projectedSpeed : sledVel.length(); // Fallback to overall speed if projection is too small

        // Lean back when going fast, clamp so bones don't over rotate.
        const targetLeanX = THREE.MathUtils.clamp(-speed * 0.2, -0.6, 0.6);

        // Smoothly lerp each upper-body bone toward the target rotation.
        for (const [key, bone] of Object.entries(ragdoll.bones) as Array<[keyof AstronautRagdoll['bones'], THREE.Bone | undefined]>) {
            if (!bone) continue;
            const rest = ragdoll.restRotations.get(bone)!;
            let weight = 0;

            if (key === 'spine') {
                weight = 1;
            } 

            bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rest.x + targetLeanX * weight, 0.1);
        }
    }
};

