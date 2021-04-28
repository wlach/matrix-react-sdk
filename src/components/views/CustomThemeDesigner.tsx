/*
 * Copyright 2021 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import * as React from "react";
import { ChangeEvent } from "react";
import SettingsStore from "../../settings/SettingsStore";
import { _t } from "../../languageHandler";
import Field from "./elements/Field";
import { SettingLevel } from "../../settings/SettingLevel";
import { setTheme } from "../../theme";
import AccessibleButton from "./elements/AccessibleButton";
import Modal from "../../Modal";
import QuestionDialog from "./dialogs/QuestionDialog";
import LabelledToggleSwitch from "./elements/LabelledToggleSwitch";

interface IProps {
}

interface IState {
    colors: {
        "accent-color": string;
        "primary-color": string;
        "warning-color": string;
        "sidebar-color": string;
        "roomlist-background-color": string;
        "roomlist-text-color": string;
        "roomlist-text-secondary-color": string;
        "roomlist-highlights-color": string;
        "roomlist-separator-color": string;
        "timeline-background-color": string;
        "timeline-text-color": string;
        "timeline-text-secondary-color": string;
        "timeline-highlights-color": string;
    };
    isDark: boolean;
}

// TODO: Figure out what an Element theme would be instead of Riot
const LIGHT_DEFAULT = {
    "accent-color": '#03b381',
    "primary-color": '#2e2f32',
    "warning-color": '#ff4b55',
    "sidebar-color": '#27303a',
    "roomlist-background-color": '#f2f5f8',
    "roomlist-text-color": '#61708b',
    "roomlist-text-secondary-color": '#61708b',
    "roomlist-highlights-color": '#ffffff',
    "roomlist-separator-color": '#e5e5e5',
    "timeline-background-color": '#ffffff',
    "timeline-text-color": '#2e2f32',
    "timeline-text-secondary-color": '#61708b',
    "timeline-highlights-color": '#f3f8fd',
};
const DARK_DEFAULT = {
    "accent-color": '#03b381',
    "primary-color": '#238cf5',
    "warning-color": '#ff4b55',
    "sidebar-color": '#15171b',
    "roomlist-background-color": '#22262e',
    "roomlist-text-color": '#61708b',
    "roomlist-text-secondary-color": '#61708b',
    "roomlist-highlights-color": '#1A1D23',
    "roomlist-separator-color": '#000000',
    "timeline-background-color": '#181b21',
    "timeline-text-color": '#edf3ff',
    "timeline-text-secondary-color": '#3c4556',
    "timeline-highlights-color": '#22262e',
};

export default class CustomThemeDesigner extends React.PureComponent<IProps, IState> {
    private flagWatcher: string;

    public constructor(props, context) {
        super(props, context);

        this.state = {
            colors: LIGHT_DEFAULT,
            isDark: false,
        };

        this.flagWatcher = SettingsStore.watchSetting("feature_theme_designer", null, this.onFlagChange);
    }

    public componentDidMount() {
        if (SettingsStore.getValue("feature_theme_designer")) {
            this.updateTheme();
        }
    }

    public componentWillUnmount() {
        SettingsStore.unwatchSetting(this.flagWatcher);
    }

    onFlagChange = () => {
        this.forceUpdate(); // nothing to actually do, so just update
        if (SettingsStore.getValue("feature_theme_designer")) {
            this.updateTheme();
        }
    };

    onChange = async (color: string, ev: ChangeEvent<HTMLInputElement>) => {
        this.setState({[color]: ev.target.value} as any);
    };

    onToggle = (checked) => {
        this.setState({isDark: checked});
    };

    reset = () => {
        if (this.state.isDark) {
            this.setState({colors: DARK_DEFAULT}, () => this.updateTheme());
        } else {
            this.setState({colors: LIGHT_DEFAULT}, () => this.updateTheme());
        }
    };

    updateTheme = async () => {
        let themes = SettingsStore.getValueAt(SettingLevel.DEVICE, "custom_themes");
        if (!themes) themes = [];
        themes = themes.filter(t => t.name !== 'designer');
        themes.push({
            name: 'designer',
            is_dark: this.state.isDark,
            colors: {
                ...this.state.colors,
            },
        });
        await SettingsStore.setValue("custom_themes", null, SettingLevel.DEVICE, themes);
        await setTheme("custom-designer");
    };

    showJson = () => {
        const theme = {
            name: 'My Theme',
            is_dark: this.state.isDark,
            colors: {
                ...this.state.colors,
            },
        };
        Modal.createTrackedDialog('Custom theme colours', '', QuestionDialog, {
            hasCancelButton: true,
            quitOnly: true,
            title: _t("Custom theme JSON"),
            description: (<pre><code>{JSON.stringify(theme, null, 2)}</code></pre>),
            button: _t("Close"),
        });
    };

    public render() {
        if (!SettingsStore.getValue("feature_theme_designer")) {
            return null;
        }
        return (
            <div className="mx_CustomThemeDesigner">
                <b>{_t("Custom theme designer")}</b>
                <div className="mx_CustomThemeDesigner_swatches">
                    {Object.keys(this.state.colors).map(k => (
                        <Field
                            style={{borderBottomColor: this.state.colors[k]}}
                            value={this.state.colors[k]}
                            onChange={(ev) => this.onChange(k, ev)}
                            label={k} />
                    ))}
                </div>
                <LabelledToggleSwitch toggleInFront={true} onChange={this.onToggle} value={this.state.isDark} label={_t("Dark theme")} />
                <AccessibleButton onClick={this.updateTheme} kind='primary'>{_t("Update theme")}</AccessibleButton>
                <AccessibleButton onClick={this.showJson} kind='primary'>{_t("Get JSON")}</AccessibleButton>
                <AccessibleButton onClick={this.reset} kind='primary'>{_t("Reset")}</AccessibleButton>
            </div>
        );
    }
}