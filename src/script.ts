import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { init, handleResize, createAndRenderScene } from './utils';
import { loadObjects, snowParticles, updateAstronautRagdolls, hockeyPlayers } from './loadObjects';
import { initPhysics, updatePhysics, getRigidBodyFromName, resetPhysicsState } from './physics';
import { FirstPersonController } from './firstPersonController';
import { addSkybox } from './skybox';

const initFirstPersonView = (scene: THREE.Scene, camera: THREE.Camera, gui: GUI, modeState: any, controls: OrbitControls, renderer: THREE.WebGLRenderer) => {
    const sled = getRigidBodyFromName('sled_2');
    if (!sled) return null;

    const firstPersonController = new FirstPersonController(
        camera,
        sled.threeObject,
        sled.body,
        new THREE.Vector3(0, 0.5, 0.3),
        0.003
    );
    console.log('FirstPersonController initialized');

    const firstPersonToggleController = gui.add(modeState, 'firstPerson').name('First Person (P)').onChange((enabled: boolean) => {
        if (enabled) {
            // enable first person mode and disable orbit controls
            firstPersonController?.enable();
            controls.enabled = false;
            // lock pointer for mouse movement
            renderer.domElement.requestPointerLock();
        } else {
            // disable first person mode and enable orbit controls
            firstPersonController?.disable();
            controls.enabled = true;
            controls.update();
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p') {
            firstPersonToggleController.setValue(!modeState.firstPerson);
            firstPersonToggleController.updateDisplay();
        }
    });

    window.addEventListener('mousemove', (event) => {
        if (!modeState.firstPerson) {
            return;
        }

        if (document.pointerLockElement !== renderer.domElement) {
            return;
        }

        firstPersonController.onMouseMove(event.movementX, event.movementY);
    });
    return {
        controller: firstPersonController,
        reset: () => {
            modeState.firstPerson = false;
            firstPersonToggleController.setValue(false);
            firstPersonToggleController.updateDisplay();
            firstPersonController.disable();
        }
    };
}

window.addEventListener('load', async () => {
    await initPhysics();
    const { camera, renderer } = init();
    window.addEventListener('resize', () => handleResize(camera, renderer));
    const scene = createAndRenderScene(renderer, camera);
    const skybox = addSkybox(scene, 0.8);
    const startOverlay = document.getElementById('start-overlay');
    
    //rotate skybox to align sun with directional light
    skybox.rotation.y = -2.5; 

    //Position camera to view full slope (X:0-21, Y:0-8, Z:-5.5 to 28)
    const initCameraPosition = new THREE.Vector3(-4, 16, 8);
    const initLookAt = new THREE.Vector3(10, 8, -2);    
    
    camera.position.copy(initCameraPosition);
    camera.lookAt(initLookAt);
    camera.near = 0.1;
    camera.far = 1000;
    camera.fov = 60;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffd580, 2.5)
    dirLight.position.set(100, 70, -100);
    scene.add(dirLight);

    // Shadow lighting
    const d = 300

    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 600;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.bias = -0.001

    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initLookAt);
    controls.update();

    const resetCameraView = () => {
        camera.position.copy(initCameraPosition);
        camera.lookAt(initLookAt);
        controls.target.copy(initLookAt);
        controls.update();
    };

    // gui to control first person mode
    const modeState = { firstPerson: false };
    const gui = new GUI({ name: 'Camera' });
    // lazy-load first person controller after objects are loaded and physics bodies are created
    // method also returns a reset method to reset the camera
    let firstPersonView: ReturnType<typeof initFirstPersonView> | null = null;
    let started = false;

    let lastTime = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        const currentTime = performance.now() / 1000;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // lazy-load first person controller after objects are loaded and physics bodies are created
        if (!firstPersonView) {
            firstPersonView = initFirstPersonView(scene, camera, gui, modeState, controls, renderer);
        }
        if (firstPersonView && modeState.firstPerson) {
            firstPersonView.controller.update();
        }

        if (!started) {
            renderer.render(scene, camera);
            return;
        }

        updatePhysics(deltaTime);
        updateAstronautRagdolls(deltaTime);

        if (snowParticles) {
            const positions = snowParticles.geometry.attributes.position.array as Float32Array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= 0.05 * deltaTime * 60;
                if (positions[i] < 0){
                    positions[i] = Math.random() * 100 + 10;
                }
            }
            snowParticles.geometry.attributes.position.needsUpdate = true;
        }

        if (hockeyPlayers) {
            for (const p in hockeyPlayers) {
                const player = hockeyPlayers[p];
                player.obj.position.x += player.direction * 0.1;

                if (player.obj.position.x >= player.maxX) {
                    player.direction = -1;
                    player.obj.rotation.y = Math.PI + Math.PI / 2;
                } else if ((player.obj.position.x <= player.minX)) {
                    player.direction = 1;
                    player.obj.rotation.y = Math.PI / 2;
                }
            }
        }

        if (controls.enabled) {
            controls.update();
        }
        renderer.render(scene, camera);
    };
    animate();

    // scene starts frozen with overlay
    // press space to hide overlay and start
    const start = () => {
        if (started) {
            return;
        }

        started = true;
        // hide overlay
        startOverlay?.classList.add('hidden');
    };

    const resetScene = () => {
        started = false;
        startOverlay?.classList.remove('hidden');

        if (firstPersonView) {
            firstPersonView.reset();
        }

        controls.enabled = true;
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        resetPhysicsState();
        resetCameraView();
    };

    window.addEventListener('keydown', (event) => {
        if (event.code === 'KeyR') {
            event.preventDefault();
            resetScene();
            return;
        }

        if (started) {
            return;
        }

        if (event.code === 'Space') {
            event.preventDefault();
            start();
        }
    });

    loadObjects(scene);
});
