import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '6h';

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '6h'});
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}