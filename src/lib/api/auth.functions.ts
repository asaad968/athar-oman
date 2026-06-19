import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyCredentials, verifyToken } from "../auth.server";

/**
 * Login server function
 * Validates credentials and returns a session token
 */
export const loginUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().min(1, "اسم المستخدم مطلوب"),
      password: z.string().min(1, "كلمة المرور مطلوبة"),
    })
  )
  .handler(async ({ data }) => {
    const result = await verifyCredentials(data);

    if (!result.success) {
      return {
        success: false,
        message: result.message || "فشل تسجيل الدخول",
      };
    }

    return {
      success: true,
      token: result.token,
      message: "تم تسجيل الدخول بنجاح",
    };
  });

/**
 * Verify session token
 * Used to check if user is still authenticated
 */
export const verifySession = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const isValid = verifyToken(data.token);

    return {
      valid: isValid,
    };
  });

/**
 * Logout server function
 * Simply returns success (token is invalidated client-side)
 */
export const logoutUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    // Verify token is valid before logout
    const isValid = verifyToken(data.token);

    if (!isValid) {
      return {
        success: false,
        message: "جلسة غير صحيحة",
      };
    }

    return {
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    };
  });
