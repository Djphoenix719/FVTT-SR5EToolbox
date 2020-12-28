import Settings from '../settings-app/Settings';
import { MODULE_NAME, STOCK_SETTINGS } from '../Constants';
import { DropData, StockSettings, StockSetting, getItemId } from './VendorAppUtil';
export default class StockSettingsApp extends FormApplication {
    // <editor-fold desc="Static Properties">

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes!, ...Settings.CSS_CLASSES];
        options.template = `modules/${MODULE_NAME}/templates/vendor-app/StockSettingsApp.html`;
        options.width = 'auto';
        options.height = 'auto';
        return options;
    }
    // A controller class for managing drag and drop workflows within an Application instance.
    // The controller manages the following actions: dragstart, dragover, drop
    // @param dragSelector The CSS selector used to target draggable elements.
    // @param dropSelector The CSS selector used to target viable drop targets.
    // @param permissions An object of permission test functions for each action
    // @param callbacks An object of callback functions for each action
    // Example:

    object: Actor;
    _dragDrop: DragDrop[];

    // </editor-fold>

    constructor(object: any, options?: FormApplicationOptions) {
        super(object, options);

        this._dragDrop = [
            new DragDrop({
                dragSelector: '.item',
                dropSelector: '.content',
                permissions: {
                    dragstart: () => true,
                    drop: () => true,
                },
                callbacks: {
                    dragstart: this._onDragStart.bind(this),
                    drop: this._onDrop.bind(this),
                },
            }),
        ];
    }

    // <editor-fold desc="Instance Methods">

    get title(): string {
        return `${this.object.name}: Stock Settings`;
    }

    getData(options?: any): any | Promise<any> {
        const data = super.getData(options);

        let stockSettings = this.object.getFlag(MODULE_NAME, STOCK_SETTINGS);
        if (!stockSettings) {
            stockSettings = {};
        }

        data['stockSettings'] = Object.values(stockSettings);
        data['stockSettings'].sort((a, b) => a.name.localeCompare(b.name));

        return data;
    }

    protected async _onDrop(event: DragEvent) {
        const dropJSON: string | undefined = event.dataTransfer?.getData('text');
        if (!dropJSON) {
            return;
        }

        const dropData: DropData = JSON.parse(dropJSON);

        const id = dropData.id;
        const item = game.items.get(dropData.id);

        if (!item) {
            return;
        }

        let stockSettings: StockSettings | undefined = this.object.getFlag(MODULE_NAME, STOCK_SETTINGS);
        if (!stockSettings) {
            stockSettings = {};
        }

        if (stockSettings.hasOwnProperty(id)) {
            return;
        }

        stockSettings[id] = {
            id,
            name: item.name,
            probability: 1,
            minimum: 0,
            maximum: 1,
        };

        await this.object.setFlag(MODULE_NAME, STOCK_SETTINGS, stockSettings);
        this.render();

        console.log(stockSettings);
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        let data = this.object.getFlag(MODULE_NAME, STOCK_SETTINGS);
        data = flattenObject(data);
        data = mergeObject(data, formData);
        await this.object.setFlag(MODULE_NAME, STOCK_SETTINGS, data);
    }

    protected activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('a.delete').on('click', async (event) => {
            const id = getItemId(event.target);
            if (id) {
                await this.object.setFlag(MODULE_NAME, STOCK_SETTINGS, {
                    [`-=${id}`]: null,
                });
                this.render();
            }
        });
    }

    // </editor-fold>
}
