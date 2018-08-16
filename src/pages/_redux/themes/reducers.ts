import { Reducer } from 'redux';
import { ThemeState, ThemeActions, ThemeName } from './types';
import { Theme, createMuiTheme, colors } from '@material-ui/core';

import { deepOrange, amber } from '@material-ui/core/colors';

const getTheme = (theme: ThemeName): Theme => {
    if (theme !== 'dark' && theme !== 'light') defaultState.name;
    return createMuiTheme({
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none'
                }
            },
            MuiInput: {
                underline: {
                    '&:after': {
                        borderBottom: `2px solid ${colors.indigo['A200']}`
                    }
                }
            },
            MuiFormLabel: {
                focused: {
                    color: `${colors.indigo['A200']} !important`
                }
            }
        },
        palette: {
            type: theme,
            contrastThreshold: 3,
            primary: colors.deepOrange,
            secondary: colors.indigo
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