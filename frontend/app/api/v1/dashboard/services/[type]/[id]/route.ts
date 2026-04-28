import { NextRequest } from "next/server";
import { handleServiceEditorSave } from "@/lib/service-editor-save";

type RouteContext = {
  params: Promise<{
    type: string;
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { type, id } = await context.params;
  return handleServiceEditorSave(request, { type, id });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { type, id } = await context.params;
  return handleServiceEditorSave(request, { type, id });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { type, id } = await context.params;
  return handleServiceEditorSave(request, { type, id });
}
