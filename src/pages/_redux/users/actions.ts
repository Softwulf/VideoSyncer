import { SetUserAction } from './types';

export const setUser: (user?: firebase.User) => SetUserAction = (user) => {
    return {
        type: '@@user/SET_USER',
        payload: {
            user
        }
    }
}