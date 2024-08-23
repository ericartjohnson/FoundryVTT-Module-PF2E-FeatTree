Hooks.on("renderCharacterSheetPF2e", (sheet, html, actor) => {
    console.log(sheet, html, actor);
    html.find(".tab.feats")
        .append('<button class="feattree"></button>');
    html.find(".tab.feats button.feattree").click((e) => {
        let feattree = new FeatTreeApplication(actor);
        feattree.render(true);
    });
});

class FeatTreeApplication extends Application {
    _actor;
    constructor(actor, options = {}) {
        super(options);
        this._actor = actor;
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

    getData() {
        return {
            actor: this._actor
        }
    }
}