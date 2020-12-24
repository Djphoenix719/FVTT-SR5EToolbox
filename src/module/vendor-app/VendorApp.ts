import { MODULE_NAME } from '../Constants';
import Settings from '../settings-app/Settings';
import QuantityApp from '../input-app/QuantityApp';
import { getItemId, getQuantityAmount } from './VendorAppUtil';

interface Stock {
    itemId: string;
    probability: number;
    minStock: number;
    maxStock: number;
}

class VendorApp extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${MODULE_NAME}/templates/vendor-app/VendorApp.html`;
        options.classes = [...options.classes!, ...Settings.CSS_CLASSES, 'sheet', 'actor'];
        options.width = 600;
        options.height = 800;
        return options;
    }

    public getData(): ActorSheetData {
        let data = super.getData();

        // Typing was incorrect in Foundry PC Types, so overriding here.
        const stock: Item[] = (duplicate(data.items) as unknown) as Array<Item>;
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
                const item = this.actor.getOwnedSR5Item(itemId);
                item.sheet.render(true);
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

            if (itemId) {
                const item = this.actor.getOwnedSR5Item(itemId);
                item.openPdfSource();
            }
        });

        html.find('input.quantity').on('change', (event) => {
            const input = event.target as HTMLInputElement;
            const itemId = getItemId(input);

            if (itemId) {
                const item = this.actor.getOwnedSR5Item(itemId);
                item.update({
                    'data.technology.quantity': parseInt(input.value),
                });
            }
        });
        html.find('input.cost').on('change', (event) => {
            const input = event.target as HTMLInputElement;
            const itemId = getItemId(input);

            if (itemId) {
                const item = this.actor.getOwnedSR5Item(itemId);
                item.update({
                    'data.technology.cost': parseInt(input.value),
                });
            }
        });

        html.find('a.purchase').on('click', (event) => {
            const anchor = event.target as HTMLAnchorElement;
            const itemId = getItemId(anchor);

            if (itemId) {
                const item = this.actor.getOwnedSR5Item(itemId);
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
        });
    }
}

export function extendActorSheet() {
    Actors.registerSheet(MODULE_NAME, VendorApp, {
        types: ['character'],
        makeDefault: false,
    });
}
