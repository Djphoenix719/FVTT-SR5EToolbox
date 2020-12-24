/**
 * Return the item id present in the specified elements data attributes,
 *  or the closes list-item provided data id.
 * @param html The element to search on.
 */
export function getItemId(html: JQuery | HTMLElement): string | undefined {
    if (html instanceof HTMLElement) {
        html = $(html);
    }

    const dataId: string | undefined = html.data('item-id');
    if (dataId) return dataId;

    const parent = html.closest('div.list-item');
    if (parent) return parent.data('item-id');
    else return undefined;
}

/**
 * Get click amount.
 * @param event The event to infer from.
 * @param baseAmount Starting amount before modification.
 */
export function getQuantityAmount(event: JQuery.Event, baseAmount: number = 1): number {
    let amount = baseAmount;

    //TODO: Settings for Control/Shift/Alt amounts.
    if (event.ctrlKey) amount *= 5;
    if (event.shiftKey) amount *= 10;
    if (event.altKey) amount *= 100;

    return amount;
}
