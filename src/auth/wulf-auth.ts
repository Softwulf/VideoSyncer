import { AuthCore } from './auth-core';
import { vyrebase } from '../vyrebase';

export const WulfAuth = new AuthCore({
    domain: 'auth.softwulf.com',
    clientID: 'N05T621mqmuVSXzYWq2uptIdJEkKcG4J',
    loginUrl: 'https://vsync.ch/_oauth/login',
    logoutUrl: 'https://vsync.ch/_oauth/logout',
    audience: 'https://auth.softwulf.com/userinfo'
}, vyrebase.auth());
