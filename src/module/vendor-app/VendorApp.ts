import { MODULE_NAME, STOCK_SETTINGS } from '../Constants';
import Settings from '../settings-app/Settings';
import QuantityApp from '../input-app/QuantityApp';
import { getItemId, getQuantityAmount, StockSettings, StockSetting, rollMinMax } from './VendorAppUtil';
import { Flags } from '../Flags';
import SR5ActorData = Shadowrun.SR5ActorData;
import StockSettingsApp from './StockSettingsApp';

class VendorApp extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${MODULE_NAME}/templates/vendor-app/VendorApp.html`;
        options.classes = [...options.classes!, ...Settings.CSS_CLASSES, 'sheet', 'actor'];
        options.width = 600;
        options.height = 800;
        return options;
    }

    actor: Actor<SR5ActorData>;

    protected _getHeaderButtons(): any[] {
        return [
            {
                label: 'Stock Settings',
                class: 'configure-sheet',
                icon: 'fas fa-cog',
                onclick: (event) => new StockSettingsApp(this.actor).render(true),
            },
            ...super._getHeaderButtons(),
        ];
    }

    public getData(): ActorSheetData {
        let data = super.getData();

        const stock: Item[] = duplicate(data.items);
        stock.sort((a, b) => a.name.localeCompare(b.name));
        data['stock'] = stock;

        return data;
    }

    protected activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('a.edit-item').on('click', (event) => {
            const anchor = event.target as HTMLAnchorElement;
            const itemId = getItemId(anchor);

            if (itemId) {
                const item = this.actor.getOwnedItem(itemId);
                if (item) {
                    item.sheet.render(true);
                }
            }
        });
        html.find('a.delete-item').on('click', (event) => {
            const anchor = event.target as HTMLAnchorElement;
            const itemId = getItemId(anchor);

            if (itemId) {
                this.actor.deleteOwnedItem(itemId);
            }
        });
        html.find('a.open-pdf').on('click', (event) => {
            const anchor = event.target as HTMLAnchorElement;
            const itemId = getItemId(anchor);

            function hasPdfSource(item: Item | null): item is Item & { openPdfSource: Function } {
                return !!(item && item['openPdfSource']);
            }

            if (itemId) {
                const item = this.actor.getOwnedItem(itemId);
                if (hasPdfSource(item)) {
                    item.openPdfSource();
                }
            }
        });

        html.find('input.quantity').on('change', (event) => {
            const input = event.target as HTMLInputElement;
            const itemId = getItemId(input);

            if (itemId) {
                const item = this.actor.getOwnedItem(itemId);
                if (item) {
                    item.update({
                        'data.technology.quantity': parseInt(input.value),
                    });
                }
            }
        });
        html.find('input.cost').on('change', (event) => {
            const input = event.target as HTMLInputElement;
            const itemId = getItemId(input);

            if (itemId) {
                const item = this.actor.getOwnedItem(itemId);
                if (item) {
                    item.update({
                        'data.technology.cost': parseInt(input.value),
                    });
                }
            }
        });

        html.find('a.purchase').on('click', (event) => {
            const anchor = event.target as HTMLAnchorElement;
            const itemId = getItemId(anchor);

            if (itemId) {
                const item = this.actor.getOwnedItem(itemId);

                if (item) {
                    const oldAmount: number = item.data.data.technology.quantity;

                    const execute = (amount: number) => {
                        item.update({
                            'data.technology.quantity': oldAmount - amount,
                        });
                    };

                    if (event.shiftKey || event.ctrlKey || event.altKey || oldAmount === 1) {
                        const delta = Math.clamped(getQuantityAmount(event), 1, oldAmount);
                        execute(delta);
                    } else {
                        const app = new QuantityApp(execute, {
                            min: 1,
                            max: oldAmount,
                            step: 1,
                            value: 1,
                        });
                        app.render(true);
                    }
                }
            }
        });

        html.find('button#clear-stock').on('click', async (event) => {
            for (const item of this.actor.items) {
                await this.actor.deleteOwnedItem(item._id);
            }
        });

        html.find('button#refresh-stock').on('click', async (event) => {
            const stockSettings: StockSettings = this.actor.getFlag(MODULE_NAME, STOCK_SETTINGS) ?? {};

            for (const stock of Object.values(stockSettings)) {
                if (Math.random() <= stock.probability) {
                    const item = duplicate(game.items.get(stock.id));
                    item.data['technology']['quantity'] = rollMinMax(stock.minimum, stock.maximum);
                    await this.actor.createOwnedItem(item);
                }
            }
        });
    }
}

export function extendActorSheet() {
    Actors.registerSheet(MODULE_NAME, VendorApp, {
        types: ['character'],
        makeDefault: false,
    });
}
