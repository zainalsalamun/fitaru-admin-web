import { apiError } from "@/lib/api/response";
import { canAccess } from "@/lib/auth/permissions";
import { getAdminSession } from "@/lib/auth/session";

export async function requireAdminApi(area: string) {
  const session = await getAdminSession();

  if (!session) {
    return {
      error: apiError({
        code: "UNAUTHORIZED",
        message: "Admin session is required.",
        status: 401,
      }),
      session: null,
    };
  }

  if (!canAccess(session.role, area)) {
    return {
      error: apiError({
        code: "FORBIDDEN",
        message: "Admin role is not allowed to access this resource.",
        status: 403,
      }),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}
