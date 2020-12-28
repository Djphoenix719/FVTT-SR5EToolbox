import Settings from './settings-app/Settings';
import { registerHandlebarsHelpers, registerHandlebarsTemplates } from './Handlebars';
import { extendActorSheet } from './vendor-app/VendorApp';
import { getItemId } from './vendor-app/VendorAppUtil';

Hooks.on('init', () => (CONFIG.debug.hooks = true));
Hooks.on('setup', async () => {
    registerHandlebarsHelpers();
    await registerHandlebarsTemplates();
    Settings.registerAllSettings();
});

Hooks.on('renderItemDirectory', (app, html: JQuery, options) => {
    function hasPdfSource(item: Item | null): item is Item & { openPdfSource: Function } {
        return !!(item && item['openPdfSource']);
    }

    const items = html.find('li.item');
    for (const li of items) {
        const item = game.items.get($(li).data('entity-id'));
        const source = item.data.data['description']['source'];
        if (source) {
            const element = $(`<span class="pdf-source">${source}</span>`);
            $(li).append(element);
        }
    }

    html.find('span.pdf-source').on('click', (event) => {
        const item = game.items.get($(event.target).parent().data('entity-id'));
        if (hasPdfSource(item)) {
            item.openPdfSource();
        }
    });
});

Hooks.on('ready', extendActorSheet);
// Hooks.on('ready', () =>
//     setTimeout(async () => {
//         const name = 'Vendor';
//         const old = game.actors.getName(name);
//
//         if (old) {
//             await old.delete();
//         }
//
//         const actor =
//             game.actors.getName(name) ??
//             (await Actor.create({
//                 type: 'character',
//                 name: name,
//             }));
//         await actor.setFlag('core', 'sheetClass', 'sr5e-toolbox.VendorApp');
//         actor.sheet.render(true);
//     }, 1000),
// );

window['ALIGN_MAP'] = async () => {
    let basePath = 'artwork/Scifi/Maps/Seattle/';
    const folderTarget = 'data';

    const parseFilePath = (name: string) => {
        const parts = name.split('_');
        parts[1] = parts[1].replace('.jpg', '');

        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);

        return {
            file: name,
            x,
            y,
        };
    };

    let files: string[] = (await FilePicker.browse(folderTarget, basePath)).files;
    for (let i = 0; i < files.length; i++) {
        const parsedData = parseFilePath(files[i].replace('artwork/Scifi/Maps/Seattle/', ''));
        await Tile.create({
            img: `artwork/Scifi/Maps/Seattle/${parsedData.file}`,
            width: 1000,
            height: 1000,
            x: parsedData.x * 1000,
            y: parsedData.y * 1000,
        });
    }
};
