/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MODULE_NAME } from '../Constants';
import Settings from '../settings-app/Settings';

/**
 * Callback type for select apps
 * @internal
 */
export type InputAppCallback = (value: number) => void;

export type InputAppOptions = ApplicationOptions & {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
};

/**
 * Base class for app that uses a select drop down
 * @internal
 */
export default abstract class InputApp extends Application {
    // <editor-fold desc="Static Properties">

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = [...options.classes!, ...Settings.CSS_CLASSES];
        options.template = `modules/${MODULE_NAME}/templates/InputApp.html`;
        options.width = 200;
        options.height = 'auto';
        return options;
    }

    // </editor-fold>
    // <editor-fold desc="Static Methods"></editor-fold>
    // <editor-fold desc="Properties">

    protected readonly _min: number;
    protected readonly _max: number;
    protected readonly _step: number;
    private readonly _value?: number;
    private readonly _callback?: InputAppCallback;

    // </editor-fold>
    // <editor-fold desc="Constructor & Initialization">

    constructor(callback?: InputAppCallback, options?: InputAppOptions) {
        super(options);

        this._callback = callback;

        this._min = -2 ^ 32;
        this._max = 2 ^ 32;
        this._step = 1;

        if (options) {
            if (options.min) this._min = options.min;
            if (options.max) this._max = options.max;
            if (options.step) this._step = options._step;
            if (options.value) this._value = options.value;
        }
    }

    // </editor-fold>
    // <editor-fold desc="Getters & Setters">

    public get title(): string {
        return game.i18n.localize(this.inputTitle);
    }

    public get id(): string {
        return this.unique ? this.inputId : super.id;
    }

    /**
     * Should duplicate of this app be allowed
     * @protected
     */
    protected get unique(): boolean {
        return true;
    }

    /**
     * The localization string to be used in the header for the title
     * @protected
     */
    protected abstract get inputTitle(): string;

    /**
     * The localization string to be used in the body to label the input
     * @protected
     */
    protected abstract get inputLabel(): string;

    /**
     * The id of the input, to preserve uniqueness. Used for app id if not
     *  unique, and input id attribute for global finds.
     * @protected
     */
    protected abstract get inputId(): string;

    // </editor-fold>
    // <editor-fold desc="Instance Methods">

    getData(options?: any): any | Promise<any> {
        const data = super.getData(options);

        data.data = {
            inputId: this.inputId,
            inputLabel: this.inputLabel,

            min: this._min,
            max: this._max,
            step: this._step,
            value: this._value,
        };

        return data;
    }

    protected activateListeners(html: JQuery): void {
        super.activateListeners(html);

        const button = html.find(`button#${this.inputId}-confirm`);
        button.on('click', async (event) => {
            event.preventDefault();
            const input = html.find(`#${this.inputId}`) as JQuery<HTMLInputElement>;
            const value = parseInt(input.val() as string);
            if (value !== this._value && this._callback !== undefined) {
                this._callback(value);
            }
            await this.close();
        });
    }

    // </editor-fold>
}
