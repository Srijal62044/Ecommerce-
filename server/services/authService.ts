/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db/adapter.js';
import { UserProfile, UserRole } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export class AuthService {
  /**
   * Resolve user from header, cookie, or authorization token.
   * In local/development mode, supports switching between demo personas or bearer auth.
   */
  public static async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const personaHeader = req.headers['x-demo-user-id'] as string;

    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // In JWT mode or bearer user id
      userId = token;
    } else if (personaHeader) {
      userId = personaHeader;
    }

    // Default to demo customer if none provided for seamless browsing
    if (!userId) {
      userId = 'user_customer_01';
    }

    const profile = await db.getProfileById(userId);
    if (profile) {
      req.user = profile;
    }

    next();
  }

  /**
   * Guard for checking if user has required roles
   */
  public static requireRole(requiredRole: UserRole) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const hasRole = req.user.roles.includes(requiredRole) || req.user.roles.includes('super_admin');
      if (!hasRole) {
        db.logAudit({
          actorId: req.user.id,
          actorEmail: req.user.email,
          action: 'ACCESS_DENIED_ROLE_DEFICIENCY',
          entityType: 'AUTH',
          entityId: req.user.id,
          details: { requiredRole, actualRoles: req.user.roles, path: req.originalUrl }
        });

        res.status(403).json({
          success: false,
          error: `Forbidden: This resource requires '${requiredRole}' privileges.`
        });
        return;
      }

      next();
    };
  }

  /**
   * Guard for checking seller store ownership (ensuring Cross-Seller Isolation)
   */
  public static async verifySellerStoreAccess(userId: string, storeId: string): Promise<boolean> {
    const store = await db.getStoreById(storeId);
    if (!store) return false;
    const user = await db.getProfileById(userId);
    if (!user) return false;
    if (user.roles.includes('admin') || user.roles.includes('super_admin')) return true;
    return store.ownerId === userId;
  }
}
