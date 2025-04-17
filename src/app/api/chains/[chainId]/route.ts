import { CHAINSSCOUT_URL } from "@/lib/constants";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { chainId } }: { params: { chainId: string } }
) {
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
