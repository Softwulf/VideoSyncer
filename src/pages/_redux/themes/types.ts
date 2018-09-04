import { Action } from 'redux';
import { Theme } from '@material-ui/core';

export type ThemeName = 'dark' | 'light';

export type ThemeState = {
    name: ThemeName
    theme: Theme
}

export interface SetThemeAction extends Action {
    type: '@@theme/SET_THEME';
    payload: {
        name: ThemeName
        containerId?: string
    };
}

export type ThemeActions = SetThemeAction;