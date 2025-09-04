import type { APIRoute } from 'astro';
import { kv } from '../../../lib/kv';

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
  await kv.del(params.id!);

  return Response.json({
    ok: true
  });
};
