import { CHAINSSCOUT_URL } from "@/utils/constants";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ chainId: string }> }) {
  const { chainId } = await params;
  const res = await fetch(`${CHAINSSCOUT_URL}/${chainId}`);
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch network info" }), { status: 500 });
  }

  const data = await res.json();

  return Response.json({
    name: data.name,
    logoUrl: data.logo,
    blockExplorer: data?.explorers?.[0]?.url,
  });
}
