import { SetThemeAction, ThemeName } from './types';

export const setTheme: (name: ThemeName, containerId?: string) => SetThemeAction = (name, containerId?: string) => {
    return {
        type: '@@theme/SET_THEME',
        payload: {
            name,
            containerId
        }
    }
}