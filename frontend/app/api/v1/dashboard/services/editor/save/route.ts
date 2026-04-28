import { NextRequest } from "next/server";
import { handleServiceEditorSave } from "@/lib/service-editor-save";

export async function POST(request: NextRequest) {
  return handleServiceEditorSave(request);
}

export async function PUT(request: NextRequest) {
  return handleServiceEditorSave(request);
}

export async function PATCH(request: NextRequest) {
  return handleServiceEditorSave(request);
}
