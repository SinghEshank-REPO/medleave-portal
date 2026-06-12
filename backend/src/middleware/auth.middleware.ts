import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing or invalid format.' });
    }

    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token is invalid or expired.' });
      }

      req.user = decoded as AuthenticatedRequest['user'];
      next();
    });
  } else {
    // Check if token is available in cookies (optional fallback)
    const cookies = req.headers.cookie;
    let tokenFromCookie = '';
    if (cookies) {
      const parsedCookies = cookies.split(';').reduce((acc: any, val) => {
        const [k, v] = val.trim().split('=');
        acc[k] = v;
        return acc;
      }, {});
      tokenFromCookie = parsedCookies['token'];
    }

    if (tokenFromCookie) {
      jwt.verify(tokenFromCookie, env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Token in cookie is invalid.' });
        }
        req.user = decoded as AuthenticatedRequest['user'];
        next();
      });
    } else {
      res.status(401).json({ message: 'Authorization header or cookie is missing.' });
    }
  }
};

export const requireRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Access restricted to roles: [${allowedRoles.join(', ')}]. Your role: '${req.user.role}'.`
      });
    }

    next();
  };
};
