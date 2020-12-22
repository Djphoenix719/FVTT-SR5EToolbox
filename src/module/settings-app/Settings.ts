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
import SettingsApp from './SettingsApp';

const Features = {
    DISABLE_PFS_TAB: 'DISABLE_PFS_TAB',
    FLATTEN_PROFICIENCY: 'FLATTEN_PROFICIENCY',
    HERO_POINTS: 'ENABLE_HERO_POINTS',
    LOOT_APP: 'ENABLE_LOOT_APP',
    NPC_SCALER: 'ENABLE_NPC_SCALER',
    QUANTITIES: 'ENABLE_QUANTITIES',
    QUICK_MYSTIFY: 'ENABLE_QUICK_MYSTIFY',
    REMOVE_DEFAULT_ART: 'REMOVE_DEFAULT_ART',
    ROLL_APP: 'ENABLE_ROLL_APP',
    TOKEN_SETUP: 'ENABLE_TOKEN_SETUP',
};

const MENU_KEY = 'SETTINGS_MENU';

type IFeatureInputType = 'checkbox' | 'number' | 'text' | 'file';
interface IFeatureAttribute {
    icon: string;
    title: string;
}
interface IFeatureInput {
    name: string;
    label: string;
    type: IFeatureInputType;
    help?: string;
    value: any;
    max?: number;
    min?: number;
}
interface IFeatureRegistration {
    name: string;
    type: BooleanConstructor | NumberConstructor | StringConstructor;
    default: any;
    onChange?: (value: any) => void;
}
interface IFeatureDefinition {
    name: string;
    attributes?: IFeatureAttribute[];
    description: string;
    inputs: IFeatureInput[];
    register: IFeatureRegistration[];
    help?: string;
}

const ATTR_RELOAD_REQUIRED: IFeatureAttribute = {
    icon: 'fas fa-sync',
    title: 'Reload Required',
};
const ATTR_REOPEN_SHEET_REQUIRED: IFeatureAttribute = {
    icon: 'fas fa-sticky-note',
    title: 'Sheets must be closed and re-opened.',
};

export const FEATURES: IFeatureDefinition[] = [

];

export default class Settings {
    public static readonly FEATURES = Features;

    public static get<T = any>(key: string): T {
        return game.settings.get(MODULE_NAME, key) as T;
    }

    public static async set(key: string, value: any) {
        return game.settings.set(MODULE_NAME, key, value);
    }

    public static reg(key: string, value: any) {
        game.settings.register(MODULE_NAME, key, value);
    }

    public static registerAllSettings() {
        for (const feature of FEATURES) {
            for (const registration of feature.register) {
                const setting = {
                    name: registration.name,
                    scope: 'world',
                    type: registration.type,
                    default: registration.default,
                    config: false,
                    restricted: true,
                    onChange: registration.onChange,
                };
                Settings.reg(registration.name, setting);
            }
        }

        game.settings.registerMenu(MODULE_NAME, MENU_KEY, {
            name: 'SR5E Toolbox Settings',
            label: 'SR5E Toolbox Settings',
            hint: 'Configure SR5E Toolbox enabled features and other options.',
            icon: 'fas fa-cogs',
            type: SettingsApp,
            restricted: true,
        });
    }
}
