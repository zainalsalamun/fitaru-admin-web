import { NextResponse } from "next/server";

interface ApiErrorOptions {
  code?: string;
  details?: unknown;
  message: string;
  status?: number;
}

export function apiSuccess<TData>(data: TData, meta: Record<string, unknown> = {}) {
  return NextResponse.json({ data, meta });
}

export function apiError({
  code = "INTERNAL_ERROR",
  details = {},
  message,
  status = 500,
}: ApiErrorOptions) {
  return NextResponse.json(
    {
      error: {
        code,
        details,
        message,
      },
    },
    { status },
  );
}
