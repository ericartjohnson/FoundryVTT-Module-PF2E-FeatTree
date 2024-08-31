import { Container } from "pixi.js";

export class Layout extends Container(){
    constructor(){
        super();
    }

    initialized = false;

    async init(){
        if (this.initialized) return;
        await this._buildChildren();
        await this._layoutChildren();
    }

    _buildChildren(){
        this.children.forEach(child => {
            child._buildChildren?.();
        });
    }

    _layoutChildren(){
        this.children.forEach(child => {
            child._layoutChildren?.();
        });
    }

}