import type { APIRoute } from "astro";
import { kv } from "../../../lib/kv";

export const prerender = false;

const DELETE: APIRoute = async ({ params }) => {
  await kv.del(params.id!);

  return Response.json({
    ok: true,
  });
};

// Route handlers in Astro <3.0 uses lower-case names
export { DELETE as delete };
