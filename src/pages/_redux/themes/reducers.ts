import { Reducer } from 'redux';
import { ThemeState, ThemeActions, ThemeName } from './types';
import { Theme, createMuiTheme } from '@material-ui/core';

import { deepOrange, amber } from '@material-ui/core/colors';

const getTheme = (theme: ThemeName): Theme => {
    if (theme !== 'dark' && theme !== 'light') defaultState.name;
    return createMuiTheme({
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none'
                }
            }
        },
        palette: {
            type: theme,
            contrastThreshold: 3,
            primary: deepOrange,
            secondary: amber
        }
    });
}

export const defaultState: ThemeState = {
    name: 'light',
    theme: getTheme('light')
}

export const ThemeReducer: Reducer<ThemeState, ThemeActions> = (state = defaultState, action): ThemeState => {
    switch(action.type) {
        case '@@theme/SET_THEME':
            return {
                ...state,
                name: action.payload.name,
                theme: getTheme(action.payload.name)
            };
        default:
            return state;
    }
}