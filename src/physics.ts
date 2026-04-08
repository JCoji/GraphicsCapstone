import * as THREE from 'three';

// Global Ammo from script tag
declare const Ammo: any;

let AmmoLib: any = null;
let physicsWorld: any = null;
interface RigidBodyEntry {
    threeObject: THREE.Object3D;
    body: any;
    // Store initial position and rotation for reset
    initialPosition: THREE.Vector3;
    initialQuaternion: THREE.Quaternion;
    isDynamic: boolean;
}

let rigidBodies: RigidBodyEntry[] = [];
let tmpTrans: any = null;

export const initPhysics = async () => {
    // Ammo is loaded globally from script tag
    AmmoLib = await Ammo();
    tmpTrans = new AmmoLib.btTransform();

    // Setup physics world
    const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
    const dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new AmmoLib.btDbvtBroadphase();
    const solver = new AmmoLib.btSequentialImpulseConstraintSolver();
    physicsWorld = new AmmoLib.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new AmmoLib.btVector3(0, -9.81, 0));
};

export const addStaticBody = (threeObject: THREE.Object3D, shape: any) => {
    const mass = 0; // Static
    const localInertia = new AmmoLib.btVector3(0, 0, 0);

    const worldPos = new THREE.Vector3();
    threeObject.getWorldPosition(worldPos);
    const worldQuat = new THREE.Quaternion();
    threeObject.getWorldQuaternion(worldQuat);

    const transform = new AmmoLib.btTransform();
    transform.setIdentity();
    transform.setOrigin(new AmmoLib.btVector3(worldPos.x, worldPos.y, worldPos.z));
    transform.setRotation(new AmmoLib.btQuaternion(worldQuat.x, worldQuat.y, worldQuat.z, worldQuat.w));

    const motionState = new AmmoLib.btDefaultMotionState(transform);
    const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new AmmoLib.btRigidBody(rbInfo);
    body.setFriction(1.0);

    physicsWorld.addRigidBody(body);
    rigidBodies.push({
        threeObject,
        body,
        initialPosition: worldPos.clone(),
        initialQuaternion: worldQuat.clone(),
        isDynamic: false,
    });
    return body;
};

export const addDynamicBody = (threeObject: THREE.Object3D, shape: any, mass: number = 1) => {
    const localInertia = new AmmoLib.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    const worldPos = new THREE.Vector3();
    threeObject.getWorldPosition(worldPos);
    const worldQuat = new THREE.Quaternion();
    threeObject.getWorldQuaternion(worldQuat);

    const transform = new AmmoLib.btTransform();
    transform.setIdentity();
    transform.setOrigin(new AmmoLib.btVector3(worldPos.x, worldPos.y, worldPos.z));
    transform.setRotation(new AmmoLib.btQuaternion(worldQuat.x, worldQuat.y, worldQuat.z, worldQuat.w));

    const motionState = new AmmoLib.btDefaultMotionState(transform);
    const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new AmmoLib.btRigidBody(rbInfo);
    body.setFriction(1.0);

    physicsWorld.addRigidBody(body);
    rigidBodies.push({
        threeObject,
        body,
        initialPosition: worldPos.clone(),
        initialQuaternion: worldQuat.clone(),
        isDynamic: mass > 0,
    });
    return body;
};

export const updatePhysics = (deltaTime: number) => {
    if (!physicsWorld) return;

    const maxDelta = 1 / 30; // Cap at 30 FPS
    deltaTime = Math.min(deltaTime, maxDelta);

    physicsWorld.stepSimulation(deltaTime, 20);

    // Update Three.js objects
    for (const rb of rigidBodies) {
        const ms = rb.body.getMotionState();
        if (ms) {
            ms.getWorldTransform(tmpTrans);
            const p = tmpTrans.getOrigin();
            const q = tmpTrans.getRotation();
            rb.threeObject.position.set(p.x(), p.y(), p.z());
            rb.threeObject.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
};

export const getRigidBodyFromName = (name: string) => {
    const match = rigidBodies.find((entry) => entry.threeObject.name === name);
    return match ?? null;
};

export const resetPhysicsState = () => {
    if (!physicsWorld || !tmpTrans) {
        return;
    }

    for (const rb of rigidBodies) {
        tmpTrans.setIdentity();
        tmpTrans.setOrigin(new AmmoLib.btVector3(rb.initialPosition.x, rb.initialPosition.y, rb.initialPosition.z));
        tmpTrans.setRotation(new AmmoLib.btQuaternion(
            rb.initialQuaternion.x,
            rb.initialQuaternion.y,
            rb.initialQuaternion.z,
            rb.initialQuaternion.w
        ));

        rb.body.setWorldTransform(tmpTrans);

        const motionState = rb.body.getMotionState();
        if (motionState) {
            motionState.setWorldTransform(tmpTrans);
        }

        rb.threeObject.position.copy(rb.initialPosition);
        rb.threeObject.quaternion.copy(rb.initialQuaternion);

        if (rb.isDynamic) {
            rb.body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));
            rb.body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
            rb.body.clearForces();
            rb.body.activate();
        }
    }

    physicsWorld.stepSimulation(0, 0);
};

export const createBoxShape = (width: number, height: number, depth: number) => {
    const shape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(width / 2, height / 2, depth / 2));
    shape.setMargin(0.04);
    return shape;
};

export const createMeshShape = (mesh: THREE.Mesh) => {

    mesh.updateMatrixWorld(true);

    const geometry = mesh.geometry;
    const vertices = geometry.attributes.position.array;
    const indices = geometry.index ? geometry.index.array : null;

    const matrix = mesh.matrixWorld;

    const ammoVertices = [];

    for (let i = 0; i < vertices.length; i += 3) {

        const localPos = new THREE.Vector3(
            vertices[i],
            vertices[i + 1],
            vertices[i + 2]
        );

        localPos.applyMatrix4(matrix);

        ammoVertices.push(
            new AmmoLib.btVector3(localPos.x, localPos.y, localPos.z)
        );
    }

    const triangleMesh = new AmmoLib.btTriangleMesh();

    if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
            triangleMesh.addTriangle(
                ammoVertices[indices[i]],
                ammoVertices[indices[i + 1]],
                ammoVertices[indices[i + 2]]
            );
        }
    } else {
        for (let i = 0; i < ammoVertices.length; i += 3) {
            triangleMesh.addTriangle(
                ammoVertices[i],
                ammoVertices[i + 1],
                ammoVertices[i + 2]
            );
        }
    }

    const shape = new AmmoLib.btBvhTriangleMeshShape(triangleMesh, true, true);
    shape.setMargin(0);

    return shape;
};