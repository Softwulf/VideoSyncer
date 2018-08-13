import { SetThemeAction, ThemeName } from './types';

export const setTheme: (name?: ThemeName) => SetThemeAction = (name) => {
    return {
        type: '@@theme/SET_THEME',
        payload: {
            name
        }
    }
}