import { Button, ScrollBox } from '@pixi/ui';
import { Application as PixiApp, Graphics, TilingSprite, Text, NineSliceSprite, Sprite, ColorMatrixFilter, Container, Assets, Texture } from 'pixi.js';

window.game.feattree = null;

Hooks.on("renderCharacterSheetPF2e", (sheet, html, actor) => {
    html.find(".tab.feats")
        .append('<button class="feattree" type="button"></button>');
    html.find(".tab.feats button.feattree").click((e) => {
        if (window.game.feattree) {
            window.game.feattree.actor = actor;
            window.game.feattree.bringToTop();
        } else {
            window.game.feattree = new FeatTreeApplication(actor, { left: window.innerWidth / 2 - 512, top: window.innerHeight / 2 - 350 });
            window.game.feattree.render(true);
        }
    });
});

class FeatTreeApplication extends Application {
    _actor;
    pixiApp;
    container;

    constructor(actor, options = {}) {
        super(options);
        this.actor = actor;
    }

    get title() {
        return "Feat Tree";
    }

    set actor(newActor) {
        window.testActor = newActor;
        this._actor = newActor;
        console.log(this._actor);
        this._reset();
    }

    get actor() {
        return this._actor;
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "feattree",
            classes: [],
            template: "modules/pf2e-feattree-local/templates/feattree.hbs",
            left: 0,
            top: 0,
            width: 1024,
            height: 700,
            resizable: true,
            minimizable: true
        }
    }

    getData() {
        return {
            actor: this._actor
        }
    }

    activateListeners(html) {
        this.container = html;
        this.pixiApp = new PixiApp();
        this.pixiApp.init({
            width: 1024, // Width of the canvas
            height: 670, // Height of the canvas
            backgroundColor: 0x000000, // Background color (optional)
            resolution: 1, // Resolution
            autoResize: false // Resize the renderer when the window size changes
        }).then(() => {
            this.container.append(this.pixiApp.canvas);
            this._reset(); // reset re-builds (or builds for the first time) pixi children for the current actor
        });

    }

    _onResize(event) {
        this.pixiApp.renderer.resize(this.container.parent().innerWidth(), this.container.parent().innerHeight());
        this.pixiApp.stage.children[0].width = this.pixiApp.renderer.width;
        this.pixiApp.stage.children[0].height = this.pixiApp.renderer.height;
    }

    close(options = {}) {
        this.pixiApp = null;
        this.titleText = null;
        window.game.feattree = null;
        super.close(options);
    }

    async _reset() {
        if (this.pixiApp?.stage) {
            this.pixiApp.stage.removeChildren();
            await Assets.load('/modules/pf2e-feattree-local/imgs/windowtilebg.webp');
            let windowbg = TilingSprite.from('/modules/pf2e-feattree-local/imgs/windowtilebg.webp', { width: 16, height: 16 });
            windowbg.width = this.pixiApp.renderer.width;
            windowbg.height = this.pixiApp.renderer.height;
            windowbg.tileScale = { x: 4, y: 4 };
            windowbg.tint = 0xFF6666;
            windowbg.alpha = 0.2;
            this.pixiApp.stage.addChild(windowbg);

            let titleText = new Text({
                text: this.actor.title,
                style: {
                    fill: 0xEEEEEE,
                    fontFamily: 'Eczar',
                    fontSize: 50,
                    align: 'center'
                },
                x: 100,
                y: 14
            });
            // this.pixiApp.stage.addChild(titleText);

            const button = new Button(titleText);
            button.onPress.connect(() => { console.log("PRESSED"); });
            this.pixiApp.stage.addChild(button.view);

            await Assets.load('/' + this.actor.actor.prototypeToken.texture.src);
            let actorImage = Sprite.from('/' + this.actor.actor.prototypeToken.texture.src);
            actorImage.width = 50;
            actorImage.height = 50;
            actorImage.x = 24;
            actorImage.y = 24;
            this.pixiApp.stage.addChild(actorImage);


            let actorClassFeatures = this.actor.feats.find(x => x.id == "classfeature").feats;
            let treeItems = Object.values(this.actor.class.system.items).map(x => {
                return {
                    name: x.name.replace("(Choice) ", ""),
                    img: x.img,
                    active: !!actorClassFeatures.find(cf => cf.feat.name == x.name.replace("(Choice) ", "")),
                    level: x.level
                }
            });
            // Loop through features
            let featDOs = treeItems.sort((a, b) => a.level - b.level).map(async (item) => {

                let featContainer = new Container();

                let chromeImgPath = item.active ? '/modules/pf2e-feattree-local/imgs/iconbg9s.webp' : '/modules/pf2e-feattree-local/imgs/iconbg_inactive9s.webp';
                await Assets.load(chromeImgPath);
                let iconChrome = new NineSliceSprite(Texture.from(chromeImgPath), 13, 13, 13, 13);
                if (!item.active) {
                    iconChrome.tint = 0x999999;
                }
                iconChrome.width = 50;
                iconChrome.height = 50;

                let nameChromeImgPath = item.active ? '/modules/pf2e-feattree-local/imgs/iconnamebg9s.webp' : '/modules/pf2e-feattree-local/imgs/iconname_inactivebg9s.webp';
                await Assets.load(nameChromeImgPath);
                let nameChrome = new NineSliceSprite(Texture.from(nameChromeImgPath), 8, 8, 8, 8);
                if (!item.active) {
                    nameChrome.tint = 0x999999;
                }
                nameChrome.y = 6;
                nameChrome.x = 48;

                let bg = new Sprite(Texture.WHITE);
                bg.alpha = 0.5;
                bg.y = 10;
                bg.x = 48;

                await Assets.load('/' + item.img);
                let iconsprite = Sprite.from('/' + item.img);
                iconsprite.x = 5;
                iconsprite.y = 5;
                iconsprite.width = 40;
                iconsprite.height = 40;
                if (!item.active) {
                    let filter = new ColorMatrixFilter();
                    iconsprite.filters = [filter];
                    filter.desaturate();
                }

                let nameText = new Text({
                    text: item.name,
                    style: {
                        fontFamily: 'Eczar',
                        fontSize: 16,
                        fill: item.active? 0x000000 : 0x333333,
                        align: 'left'
                    },
                    x: 55,
                    y: 16
                });

                bg.width = nameText.width + 15;
                bg.height = nameText.height + 12;
                nameChrome.width = bg.width + 5;
                nameChrome.height = bg.height + 8;

                featContainer.addChild(bg);
                featContainer.addChild(nameText);
                featContainer.addChild(iconsprite);
                featContainer.addChild(nameChrome);
                featContainer.addChild(iconChrome);

                return featContainer;
            });
            let scrollContainer = new Container({
                x: 0,
                y: 100,
                width: this.pixiApp.renderer.width,
                height: this.pixiApp.renderer.height - 100
            });
            let scrollbox = new ScrollBox({
                elementsMargin: 6,
                width: this.pixiApp.renderer.width,
                height: this.pixiApp.renderer.height - 100,
                vertPadding: 12,
                horPadding: 12,
                type: 'vertical'
            });
            let fDOs = await Promise.all(featDOs);
            scrollbox.addItems(fDOs);
            scrollContainer.addChild(scrollbox);
            this.pixiApp.stage.addChild(scrollContainer);
        }
    }
}