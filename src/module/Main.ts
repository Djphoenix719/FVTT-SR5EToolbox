import Settings from './settings-app/Settings';
import { registerHandlebarsHelpers, registerHandlebarsTemplates } from './Handlebars';
import { extendActorSheet } from './vendor-app/VendorApp';

Hooks.on('setup', async () => {
    registerHandlebarsHelpers();
    await registerHandlebarsTemplates();
    Settings.registerAllSettings();
});

Hooks.on('ready', extendActorSheet);
Hooks.on('ready', () => setTimeout(() => game.actors.getName('Test Vendor')?.sheet.render(true), 1000));

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
