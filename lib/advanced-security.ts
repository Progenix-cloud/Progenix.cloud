// Advanced security features: Rate limiting and 2FA
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
  message?: string;
}

export interface TwoFactorAuth {
  userId: string;
  secret: string;
  enabled: boolean;
  backupCodes: string[];
  createdAt: Date;
}

// In-memory stores
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const twoFactorStore = new Map<string, TwoFactorAuth>();
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

export const securityService = {
  // Rate limiting
  checkRateLimit: async (
    identifier: string,
    config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const now = Date.now();
    let record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new window
      record = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    record.count++;
    rateLimitStore.set(identifier, record);

    return {
      allowed: record.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - record.count),
      resetTime: record.resetTime,
    };
  },

  // Check if IP is rate limited
  isRateLimited: async (ip: string): Promise<boolean> => {
    const limit = await securityService.checkRateLimit(ip, {
      maxRequests: 1000,
      windowMs: 60000, // 1 minute
    });
    return !limit.allowed;
  },

  // Check if endpoint is rate limited
  isEndpointRateLimited: async (userId: string, endpoint: string): Promise<boolean> => {
    const identifier = `${userId}:${endpoint}`;
    const limit = await securityService.checkRateLimit(identifier, {
      maxRequests: 50,
      windowMs: 60000,
    });
    return !limit.allowed;
  },

  // Login attempt tracking
  recordLoginAttempt: async (email: string, success: boolean): Promise<void> => {
    const now = Date.now();
    let record = loginAttempts.get(email);

    if (!record || now > record.lockUntil) {
      record = { count: 0, lockUntil: 0 };
    }

    if (success) {
      loginAttempts.delete(email);
      return;
    }

    record.count++;

    // Lock account after 5 failed attempts for 30 minutes
    if (record.count >= 5) {
      record.lockUntil = now + 30 * 60 * 1000;
    }

    loginAttempts.set(email, record);
  },

  // Check if account is locked
  isAccountLocked: async (email: string): Promise<boolean> => {
    const record = loginAttempts.get(email);
    if (!record) return false;

    const now = Date.now();
    if (now > record.lockUntil) {
      loginAttempts.delete(email);
      return false;
    }

    return record.count >= 5;
  },

  // Two-factor authentication setup
  setupTwoFactor: async (userId: string): Promise<TwoFactorAuth> => {
    // Generate secret (in production, use speakeasy or similar)
    const secret = `${Math.random().toString(36).substring(7)}${Math.random().toString(36).substring(7)}`;
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      `${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase()
    );

    const twoFactor: TwoFactorAuth = {
      userId,
      secret,
      enabled: false, // Must verify first
      backupCodes,
      createdAt: new Date(),
    };

    twoFactorStore.set(userId, twoFactor);
    console.log('[v0] 2FA setup initiated for user:', userId);

    return twoFactor;
  },

  // Verify 2FA setup
  verifyTwoFactorSetup: async (userId: string, code: string): Promise<boolean> => {
    const twoFactor = twoFactorStore.get(userId);
    if (!twoFactor) return false;

    // In production, use speakeasy.totp.verify()
    // For demo, accept any code
    if (code.length === 6 || code.includes('-')) {
      twoFactor.enabled = true;
      return true;
    }

    return false;
  },

  // Verify 2FA code
  verifyTwoFactorCode: async (userId: string, code: string): Promise<boolean> => {
    const twoFactor = twoFactorStore.get(userId);
    if (!twoFactor || !twoFactor.enabled) return false;

    // Check backup codes
    const backupIndex = twoFactor.backupCodes.findIndex(c => c === code);
    if (backupIndex !== -1) {
      // Remove used backup code
      twoFactor.backupCodes.splice(backupIndex, 1);
      return true;
    }

    // In production, use speakeasy.totp.verify()
    // For demo, accept 6-digit codes
    if (code.length === 6) {
      return true;
    }

    return false;
  },

  // Disable 2FA
  disableTwoFactor: async (userId: string): Promise<boolean> => {
    const twoFactor = twoFactorStore.get(userId);
    if (!twoFactor) return false;

    twoFactor.enabled = false;
    return true;
  },

  // Get 2FA status
  getTwoFactorStatus: async (userId: string): Promise<TwoFactorAuth | null> => {
    return twoFactorStore.get(userId) || null;
  },

  // Get remaining backup codes
  getBackupCodes: async (userId: string): Promise<string[]> => {
    const twoFactor = twoFactorStore.get(userId);
    return twoFactor?.backupCodes || [];
  },

  // Regenerate backup codes
  regenerateBackupCodes: async (userId: string): Promise<string[]> => {
    const twoFactor = twoFactorStore.get(userId);
    if (!twoFactor) return [];

    const backupCodes = Array.from({ length: 10 }, () =>
      `${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase()
    );

    twoFactor.backupCodes = backupCodes;
    return backupCodes;
  },

  // Clear rate limit for identifier
  clearRateLimit: async (identifier: string): Promise<void> => {
    rateLimitStore.delete(identifier);
  },

  // Clear all rate limits
  clearAllRateLimits: async (): Promise<void> => {
    rateLimitStore.clear();
  },

  // Security audit log
  logSecurityEvent: async (event: {
    type: 'login' | 'logout' | 'failed_login' | '2fa_setup' | 'rate_limit' | 'unauthorized_access';
    userId: string;
    ip: string;
    userAgent?: string;
    details?: Record<string, any>;
  }): Promise<void> => {
    console.log('[v0] Security event:', {
      ...event,
      timestamp: new Date().toISOString(),
    });
  },
};

export type SecurityService = typeof securityService;
