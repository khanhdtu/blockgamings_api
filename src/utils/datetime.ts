import { CONFIG } from '../constants/configs';

const TOKEN_EXPIRES_IN = CONFIG.TOKEN.EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = CONFIG.REFRESH_TOKEN.EXPIRES_IN;

export const addTokenExpiresIn = (): number => {
    return new Date(new Date().getTime() + TOKEN_EXPIRES_IN).getTime();
}

export const addRefreshTokenExpiresIn = (): number => {
    return new Date(new Date().getTime() + REFRESH_TOKEN_EXPIRES_IN).getTime();
}

export const isExpired = (expiresIn: number): boolean => {
    const intersection = expiresIn - new Date().getTime();
    if (intersection < 0) return true;
    return false;
}
