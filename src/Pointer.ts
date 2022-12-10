import * as THREE from "three";
import Entity from "./entities/Entity";

class Pointer {
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private intersected: Entity | null;
    onClick: (entity: Entity) => void | null;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener("mousemove", (event: MouseEvent) => this.onMouseMove(event), false);
        window.addEventListener("click", () => this.handleOnClick(), false);
    }

    getIntersectedObject() {
        return this.intersected;
    }

    private getContainerObject(object: THREE.Object3D): THREE.Object3D | null {
        if (object.userData.isContainer) return object;
        else if (object.parent) return this.getContainerObject(object.parent);
        else return null;
    }

    update(camera: THREE.Camera, entities: Entity[]) {
        this.raycaster.setFromCamera(this.mouse, camera);

        const intersects = this.raycaster.intersectObjects(entities.map(entity => entity.object));

        if (intersects.length > 0) {
            if (this.intersected?.object !== intersects[0].object) {
                const obj = this.getContainerObject(intersects[0].object);
                this.intersected = obj ? entities.find(entity => entity.object === obj)||null : null;
            }
        } else {
            this.intersected = null;
        }
    }

    private handleOnClick() {
        if (this.onClick && this.intersected) this.onClick(this.intersected);
    }

    private onMouseMove(event: MouseEvent) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
}

export default Pointer;