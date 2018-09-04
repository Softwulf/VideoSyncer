import { Reducer } from 'redux';
import { ThemeState, ThemeActions, ThemeName } from './types';
import { Theme, createMuiTheme, colors } from '@material-ui/core';

import { deepOrange, amber } from '@material-ui/core/colors';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import { debug } from 'vlogger';

const getTheme = (theme: ThemeName, containerId?: string): Theme => {
    if (theme !== 'dark' && theme !== 'light') theme = defaultState.name;

    const obj: ThemeOptions = {
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
    }

    if(containerId) {
        try {
            const styleHolder = document.getElementById('vsync-shadow-container').shadowRoot.getElementById(containerId);
            debug('StyleHolder found ['+containerId+']: ', styleHolder);

            obj.props = {
                ...obj.props,
                MuiPopover: {
                    ...obj.props.MuiPopover,
                    container: styleHolder
                },
                MuiModal: {
                    ...obj.props.MuiModal,
                    container: styleHolder
                },
                MuiDialog: {
                    ...obj.props.MuiDialog,
                    container: styleHolder
                }
            }
        } catch(err) {
            console.error('Failed to inject container at custom location')
        }
    }

    return createMuiTheme(obj);
}

export const defaultState: ThemeState = {
    name: 'light',
    theme: getTheme('light')
}

export const ThemeReducer: Reducer<ThemeState, ThemeActions> = (state = defaultState, action): ThemeState => {
    switch(action.type) {
        case '@@theme/SET_THEME':
            document.body.classList.remove('theme-light');
            document.body.classList.remove('theme-dark');
            document.body.classList.add(`theme-${action.payload.name}`)
            return {
                ...state,
                name: action.payload.name,
                theme: getTheme(action.payload.name, action.payload.containerId)
            };
        default:
            return state;
    }
}