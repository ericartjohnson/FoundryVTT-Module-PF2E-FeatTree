import { Assets, ColorMatrixFilter, NineSliceSprite, Sprite, Text, Texture } from "pixi.js";
import { FeatData } from "./featData";
import { Button } from "@pixi/ui";
import { Layout } from "./layout";

export class Feat extends Layout {
    constructor( /** @type {FeatData} */ featData) {
        super();
        this.featData = featData;
    }

    isInitialized = false;

    /** @type {Button} */
    button;

    iconChrome;
    nameChrome;
    colorBg;
    iconSprite;
    nameText;

    _static_images = {
        iconBg: '/modules/pf2e-feattree-local/imgs/iconbg9s.webp',
        iconBg_inactive: '/modules/pf2e-feattree-local/imgs/iconbg_inactive9s.webp',
        nameBg: '/modules/pf2e-feattree-local/imgs/iconnamebg9s.webp',
        nameBg_inactive: '/modules/pf2e-feattree-local/imgs/iconname_inactivebg9s.webp'
    }

    _dynamic_images = {
        icon: () => '/' + this.featData.imageUrl
    }

    async init() {
        if (this.initialized) return;
        await this._buildChildren();
        await this._layoutChildren();
        this.initialized = true;
    }

    async _buildChildren() {
        await Assets.load(Object.values(this._static_images));
        await Assets.load(this._dynamic_images.icon());

        let chromeImgPath = this.featData.isActive ? this._static_images.iconBg : this._static_images.iconBg_inactive;
        this.iconChrome = new NineSliceSprite(Texture.from(chromeImgPath), 13, 13, 13, 13);
        if (!this.featData.isActive) {
            this.iconChrome.tint = 0x999999;
        }

        let nameChromeImgPath = this.featData.isActive ? this._static_images.nameBg : this._static_images.nameBg_inactive;
        this.nameChrome = new NineSliceSprite(Texture.from(nameChromeImgPath), 8, 8, 8, 8);
        if (!this.featData.isActive) {
            this.nameChrome.tint = 0x999999;
        }

        this.colorBg = new Sprite(Texture.WHITE);
        this.colorBg.alpha = 0.5;

        this.iconsprite = Sprite.from(this._dynamic_images.icon());
        if (!this.featData.isActive) {
            let filter = new ColorMatrixFilter();
            this.iconsprite.filters = [filter];
            filter.desaturate();
        }

        this.nameText = new Text({
            text: this.featData.displayName,
            style: {
                fontFamily: 'Eczar',
                fontSize: 32,
                fill: this.featData.isActive ? 0x000000 : 0x333333,
                align: 'left'
            }
        });

        this.addChild(this.colorBg);
        this.addChild(this.nameText);
        this.addChild(this.iconsprite);
        this.addChild(this.nameChrome);
        this.addChild(this.iconChrome);

        this.button = new Button(this);

        super._buildChildren();
    }

    async _layoutChildren() {

        this.iconChrome.width = 50;
        this.iconChrome.height = 50;

        this.iconsprite.x = 5;
        this.iconsprite.y = 5;
        this.iconsprite.width = 40;
        this.iconsprite.height = 40;

        this.nameText.x = 55;
        this.nameText.y = 16;
        this.nameText.scale = 0.5;

        this.colorBg.y = 10;
        this.colorBg.x = 48;
        this.colorBg.width = this.nameText.width + 15;
        this.colorBg.height = this.nameText.height + 12;

        this.nameChrome.y = 6;
        this.nameChrome.x = 48;
        this.nameChrome.width = this.colorBg.width + 5;
        this.nameChrome.height = this.colorBg.height + 8;

        super._layoutChildren();
    }
}