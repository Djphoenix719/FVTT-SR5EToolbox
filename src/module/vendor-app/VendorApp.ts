import { MODULE_NAME } from '../Constants';

type ActorSheetConstructor = new (...args: any[]) => ActorSheet;

// function createExtensionClass() {
//     const baseClass: ActorSheetConstructor = CONFIG.Actor.sheetClasses['character']['shadowrun5e.SR5ActorSheet'].cls;
//     return class VendorApp extends baseClass {};
// }

class VendorApp extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${MODULE_NAME}/templates/vendor-app/VendorApp.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, 'sr5e-toolbox', 'vendor-app', 'sr5', 'sheet', 'actor'];
        options.tabs = [
            {
                navSelector: `.settings-app-nav`,
                contentSelector: `.settings-app-body`,
                initial: `about`,
            },
        ];
        options.width = 600;
        options.height = 800;
        return options;
    }
}

export function extendActorSheet() {
    Actors.registerSheet(MODULE_NAME, VendorApp, {
        types: ['character'],
        makeDefault: false,
    });
}
