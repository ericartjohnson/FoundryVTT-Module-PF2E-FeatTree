import { Container } from "pixi.js";

export class Layout extends Container(){
    constructor(){
        super();
    }

    _buildChildren(){
        console.warn("_buildChildren not implemented in: ", this);
    }

    _layoutChildren(){
        console.warn("_layoutChildren not implemented in: ", this);
    }

}