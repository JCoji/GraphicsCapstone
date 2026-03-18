import * as THREE from 'three';

declare const Ammo: any;

export class FirstPersonController {
    private camera: THREE.Camera;
    private sledObject: THREE.Object3D;
    private sledBody: any;
    private yaw = 0;
    private yawCenter = 0;
    private pitch = 0;
    private enabled = false;
    private readonly cameraOffset: THREE.Vector3;
    private readonly mouseSensitivity: number;
    private readonly yawLimit = THREE.MathUtils.degToRad(90);
    private readonly pitchLimit = THREE.MathUtils.degToRad(45);
    private readonly lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    private readonly lookQuaternion = new THREE.Quaternion();
    private readonly worldPosition = new THREE.Vector3();
    private readonly worldQuaternion = new THREE.Quaternion();
    private readonly worldOffset = new THREE.Vector3();
    private readonly forwardXZ = new THREE.Vector3();
    private readonly bodyTransform: any = null;

    constructor(
        camera: THREE.Camera,
        sledObject: THREE.Object3D,
        sledBody: any,
        cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0.3),
        mouseSensitivity = 0.003
    ) {
        this.camera = camera;
        this.sledObject = sledObject;
        this.sledBody = sledBody;
        this.cameraOffset = cameraOffset.clone();
        this.mouseSensitivity = mouseSensitivity;

        const cameraEuler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
        this.yaw = cameraEuler.y;
        this.pitch = THREE.MathUtils.clamp(cameraEuler.x, -this.pitchLimit, this.pitchLimit);

        if (typeof Ammo !== 'undefined' && this.sledBody) {
            this.bodyTransform = new Ammo.btTransform();
        }
    }

    update(): void {
        if (!this.enabled) {
            return;
        }

        this.updateSledPose();
        this.worldOffset.copy(this.cameraOffset).applyQuaternion(this.worldQuaternion);
        this.camera.position.copy(this.worldPosition).add(this.worldOffset);

        this.lookEuler.set(this.pitch, this.yaw, 0);
        this.lookQuaternion.setFromEuler(this.lookEuler);
        this.camera.quaternion.copy(this.lookQuaternion);
    }

    onMouseMove(deltaX: number, deltaY: number): void {
        if (!this.enabled) {
            return;
        }

        this.setYaw(this.yaw - deltaX * this.mouseSensitivity);
        this.setPitch(this.pitch - deltaY * this.mouseSensitivity);
    }

    setPitch(pitch: number): void {
        this.pitch = THREE.MathUtils.clamp(pitch, -this.pitchLimit, this.pitchLimit);
    }

    setYaw(yaw: number): void {
        this.yaw = this.clampYaw(yaw);
    }

    getYaw(): number {
        return this.yaw;
    }

    getPitch(): number {
        return this.pitch;
    }

    enable(): void {
        this.updateSledPose();
        this.forwardXZ.set(0, 0, -1).applyQuaternion(this.worldQuaternion);
        this.forwardXZ.y = 0;

        if (this.forwardXZ.lengthSq() > 1e-8) {
            this.forwardXZ.normalize();
            this.yaw = Math.atan2(-this.forwardXZ.x, -this.forwardXZ.z);
        }

        this.yawCenter = this.yaw;
        this.setYaw(this.yaw);
        this.enabled = true;
        this.update();
    }

    disable(): void {
        this.enabled = false;
    }

    private clampYaw(yaw: number): number {
        return THREE.MathUtils.clamp(yaw, this.yawCenter - this.yawLimit, this.yawCenter + this.yawLimit);
    }

    private updateSledPose(): void {
        if (!this.sledBody || !this.bodyTransform) {
            this.sledObject.getWorldPosition(this.worldPosition);
            this.sledObject.getWorldQuaternion(this.worldQuaternion);
            return;
        }

        const motionState = this.sledBody.getMotionState();
        if (!motionState) {
            this.sledObject.getWorldPosition(this.worldPosition);
            this.sledObject.getWorldQuaternion(this.worldQuaternion);
            return;
        }

        motionState.getWorldTransform(this.bodyTransform);
        const origin = this.bodyTransform.getOrigin();
        const rotation = this.bodyTransform.getRotation();
        this.worldPosition.set(origin.x(), origin.y(), origin.z());
        this.worldQuaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
}
