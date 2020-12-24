import InputApp from './InputApp';

export default class QuantityApp extends InputApp {
    protected get inputId(): string {
        return 'quantity-input';
    }

    protected get inputLabel(): string {
        return 'Quantity';
    }

    protected get inputTitle(): string {
        return 'Purchase Items';
    }
}
