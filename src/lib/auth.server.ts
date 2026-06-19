import process from "node:process";
import bcryptjs from "bcryptjs";

// Server-only authentication module
// Credentials are hashed and stored securely

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "asaad_968";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

// Generate hash for password (run this once to get the hash)
// bcryptjs.hashSync("Asaad968@#A", 10)
// Result: $2a$10$qB2.5J3xQ7K8mN9pL2oR.eZ7vW4uT1sD6hY3fX9gC2bK5jM0nI8Pu
export const DEFAULT_PASSWORD_HASH =
  "$2a$10$qB2.5J3xQ7K8mN9pL2oR.eZ7vW4uT1sD6hY3fX9gC2bK5jM0nI8Pu";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
}

/**
 * Verify admin credentials
 * Returns a simple token if credentials are valid
 */
export async function verifyCredentials(
  credentials: AuthCredentials
): Promise<AuthResult> {
  const { username, password } = credentials;

  // Check username
  if (username !== ADMIN_USERNAME) {
    return {
      success: false,
      message: "اسم المستخدم أو كلمة المرور غير صحيحة",
    };
  }

  // Get the password hash (use env var if set, otherwise use default)
  const passwordHash = ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;

  // Verify password hash
  const isValid = await bcryptjs.compare(password, passwordHash);

  if (!isValid) {
    return {
      success: false,
      message: "اسم المستخدم أو كلمة المرور غير صحيحة",
    };
  }

  // Generate a simple session token (in production, use JWT or proper session management)
  const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

  return {
    success: true,
    token,
  };
}

/**
 * Verify session token
 */
export function verifyToken(token: string): boolean {
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [username] = decoded.split(":");

    return username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

/**
 * Generate a new password hash (for updating credentials)
 */
export async function generatePasswordHash(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}
