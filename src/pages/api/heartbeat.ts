import type { APIRoute } from 'astro';
import { kv } from '../../lib/kv';

export const prerender = false;

const ONE_DAY_IN_MS = 24 * 3600 * 1000;

export const GET: APIRoute = async () => {
  try {
    const heartbeat = (await kv.get<number>('heartbeat')) ?? 0;
    const now = Date.now();

    if (heartbeat + ONE_DAY_IN_MS < now) {
      console.log(`Updating heartbeat entry.`);
      await kv.set('heartbeat', now);
    }

    return Response.json({
      heartbeat
    });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      {
        error: `Something went wrong`
      },
      {
        status: 500
      }
    );
  }
};
