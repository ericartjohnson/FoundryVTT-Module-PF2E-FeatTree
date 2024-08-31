import { Button, ScrollBox } from '@pixi/ui';
import { Application as PixiApp, TilingSprite, Text, NineSliceSprite, Sprite, Container, Assets, Texture, HTMLText } from 'pixi.js';
import { AppLayout, Feat, FeatData } from './models';

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
    detailPane;

    constructor(actor, options = {}) {
        super(options);
        this.actor = actor;
    }

    get title() {
        return "Feat Tree";
    }

    set actor(newActor) {
        window.feattreeActor = newActor;
        this._actor = newActor;
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
            resizable: false,
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
            let appLayout = new AppLayout();
            await appLayout.init();
            this.pixiApp.stage.addChild(appLayout);
            
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
                    fontSize: 100,
                    align: 'center'
                },
                x: 100,
                y: 14,
                scale: 0.5
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
                return new FeatData({
                    displayName: x.name,
                    imageUrl: x.img,
                    isActive: !!actorClassFeatures.find(cf => cf.feat.sourceId == x.uuid),
                    level: x.level,
                    uuid: x.uuid
                });
            });           // Loop through features
            let levelGroupedItems = {};
            treeItems.sort((a, b) => a.level - b.level).forEach((featData) => {
                if (!levelGroupedItems[featData.level]) { levelGroupedItems[featData.level] = []; }
                levelGroupedItems[featData.level].push(featData);
            });
            let scrollItems = {};
            let promises = Object.keys(levelGroupedItems).map(async (level) => {
                scrollItems[level] = [];
                
                // Create level divide
                let levelDivider = new Container();
                let levelText = new Text({
                    text: 'Level '+ level,
                    style: {
                        fontFamily: 'Vollkorn',
                        fontSize: 18,
                        fill: this.actor.actor.system.details.level.value >= level ? 0xFECD78 : 0xAAAAAA,
                        align: 'left'
                    },
                    x: 55,
                    y: 0
                });
                levelDivider.addChild(levelText);
                scrollItems[level].push(levelDivider);

                let levelGroup = levelGroupedItems[level];
                // Create feat DOs
                let featDOs = levelGroup.map(async (item) => {
                    let f = new Feat(item);
                    await f.init();
                    f.button.onPress.connect(() => this._setDetailPane(f.featData.id));
                    return f;
                });

                let fDOs = await Promise.all(featDOs);
                scrollItems[level] = scrollItems[level].concat(fDOs);
            });
            await Promise.all(promises);

            let scrollbox = new ScrollBox({
                elementsMargin: 6,
                width: this.pixiApp.renderer.width,
                height: this.pixiApp.renderer.height - 100,
                vertPadding: 12,
                horPadding: 12,
                type: 'vertical',
                globalScroll: false
            });
            Object.keys(scrollItems).forEach((level) => scrollbox.addItems(scrollItems[level]));

            let scrollContainer = new Container({
                x: 0,
                y: 100,
                width: this.pixiApp.renderer.width - 300,
                height: this.pixiApp.renderer.height - 100
            });
            scrollContainer.addChild(scrollbox);

            this.pixiApp.stage.addChild(scrollContainer);

            // detail box
            await Assets.load("/modules/pf2e-feattree-local/imgs/detailbg9s.webp");
            let detailBoxBorder = new NineSliceSprite(Texture.from("/modules/pf2e-feattree-local/imgs/detailbg9s.webp"), 13, 13, 13, 13);
            detailBoxBorder.width = 300;
            detailBoxBorder.height = this.pixiApp.renderer.height - 100;
            detailBoxBorder.x = this.pixiApp.renderer.width - 300;
            detailBoxBorder.y = 100;

            this.pixiApp.stage.addChild(detailBoxBorder);
        }
    }

    async _setDetailPane(featId) {
        if (this.detailPane) {
            this.pixiApp.stage.removeChild(this.detailPane);
            this.detailPane.destroy(true);
            this.detailPane = null;
        }
        this.detailPane = new Container({
            x: this.pixiApp.renderer.width - 300,
            y: 100
        });
        let feat = await game.packs.get("pf2e.classfeatures").getDocument(featId);

        let featTitle = new Text({
            text: feat.name,
            style: {
                fontFamily: 'Eczar',
                fontSize: 32,
                fill: 0xFFFFFF,
                align: 'center'
            },
            x: 150,
            y: 20,
            anchor: 0.5,
            scale: 0.5
        });

        this.detailPane.addChild(featTitle);

        let featDesc = new HTMLText({
            text: feat.system.description.value,
            style: {
                fontFamily: 'Eczar',
                fontSize: 32,
                fill: 0xFFFFFF,
                align: 'left',
                wordWrap: true,
                wordWrapWidth: 550
            },
            scale: 0.5
        });

        let scrollbox = new ScrollBox({
            elementsMargin: 6,
            width: 290,
            height: this.pixiApp.renderer.height - 100,
            vertPadding: 12,
            horPadding: 12,
            type: 'vertical',
            globalScroll: false
        });
        scrollbox.addItem(featDesc);

        let scrollContainer = new Container({
            x: 0,
            y: 40,
            width: 280,
            height: this.pixiApp.renderer.height - 100
        });
        scrollContainer.addChild(scrollbox);

        this.detailPane.addChild(scrollContainer);

        this.pixiApp.stage.addChild(this.detailPane);
    }
}