import Settings from "./settings-app/Settings";
import {registerHandlebarsHelpers, registerHandlebarsTemplates} from "./Handlebars";

Hooks.on('setup', async () => {
    registerHandlebarsHelpers();
    await registerHandlebarsTemplates();
    Settings.registerAllSettings();
})


const parseFilePath = (name: string) => {
    const parts = name.split('_');
    parts[2] = parts[2].replace('.png', '')

    const x = parseInt(parts[1])
    const y = parseInt(parts[2])

    return {
        file: name, x, y
    }
}

window['ALIGN'] = async () => {
    let basePath = 'artwork/Scifi/Maps/Seattle/'
    const folderTarget = 'data';

    let files: string[] = (await FilePicker.browse(folderTarget, basePath)).files;
    for (let i = 0; i < files.length; i++) {
        const parsedData = parseFilePath(files[i].replace('artwork/Scifi/Maps/Seattle/', ''));
        await Tile.create({
            img: `artwork/Scifi/Maps/Seattle/${parsedData.file}`,
            width: 1000,
            height: 1000,
            x: parsedData.x*1000 + (24000*0.25),
            y: parsedData.y*1000 + (32000*0.25)
        })
    }
}