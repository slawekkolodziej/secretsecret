import { nanoid } from "nanoid";
import type { APIRoute } from "astro";
import { kv } from "../../lib/kv";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const id = nanoid();

  await kv.set(id, data.secret, {
    // delete in 1 hour
    ex: 3600,
  });

  return Response.json({
    id,
  });
};
