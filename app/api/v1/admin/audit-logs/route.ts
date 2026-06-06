import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/api/admin-auth";
import { getAdminAuditLogs } from "@/lib/admin-repository";
import { hasSupabaseAdminEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const mockAuditLogs = [
  {
    action: "Update",
    actionValue: "update",
    admin: "Super Admin",
    createdAt: "-",
    id: "mock-audit-log",
    metadata: { note: "Audit log akan tampil setelah Supabase siap." },
    resourceId: "-",
    resourceType: "Settings",
    resourceTypeValue: "settings",
  },
];

export async function GET() {
  const auth = await requireAdminApi("Audit Logs");

  if (auth.error) {
    return auth.error;
  }

  if (!hasSupabaseAdminEnv()) {
    return apiSuccess({
      items: mockAuditLogs,
      source: "mock",
    });
  }

  try {
    return apiSuccess({
      items: await getAdminAuditLogs(),
      source: "supabase",
    });
  } catch (error) {
    return apiError({
      code: "ADMIN_AUDIT_LOGS_QUERY_FAILED",
      details: error,
      message: "Failed to load admin audit logs.",
    });
  }
}
