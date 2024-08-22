Hooks.on("renderCharacterSheetPF2e", (param1, param2, param3, param4) => {
    console.log(param1, param2, param3, param4);
    let feattree = new FeatTreeApplication();
    feattree.render();
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