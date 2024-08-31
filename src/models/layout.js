import { Container } from "pixi.js";

export class Layout extends Container(){
    constructor(){
        super();
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