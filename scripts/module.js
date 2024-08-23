Hooks.on("renderCharacterSheetPF2e", (sheet, html, actor) => {
    console.log(sheet, html, actor);
    html.find(".tab.feats")
        .append('<button class="feattree"><img src="modules/pf2e-feattree/imgs/feattree_clean.svg"/></button>');
    html.find(".tab.feats button.feattree").click((e) => {
        let feattree = new FeatTreeApplication();
        feattree.render(true);
    });
});

class FeatTreeApplication extends Application {
    constructor(options = {}) {
        super(options);
    }

    get title() {
        return "Feat Tree";
    }

    static get defaultOptions(){
        return {
            ...super.defaultOptions,
            id: "feattree",
            classes: [],
            template: "modules/pf2e-feattree/templates/feattree.hbs",
            left: 0,
            top: 0,
            width: 800,
            height: 400,
            resizable: true
        }
    }
}