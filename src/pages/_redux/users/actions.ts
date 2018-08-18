import { SetUserAction } from './types';

export const setUser: (user?: VSync.User) => SetUserAction = (user) => {
    return {
        type: '@@user/SET_USER',
        payload: {
            user
        }
    }
}