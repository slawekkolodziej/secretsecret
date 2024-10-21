import { nanoid } from "nanoid";
import type { APIRoute } from "astro";
import { isValiError, parse } from "valibot";
import { kv } from "../../lib/kv";
import { validateSecretSchema } from "../../lib/schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawData = await request.json();
    const data = parse(validateSecretSchema, rawData);
    const id = nanoid();

    await kv.set(
      id,
      JSON.stringify({
        destruct: data.destruct,
        secret: data.secret,
      }),
      {
        ex: parseInt(data.expire),
      }
    );

    return Response.json({
      id,
    });
  } catch (err: any) {
    if (isValiError(err)) {
      return Response.json(
        {
          error: err.message,
        },
        {
          status: 400,
        }
      );
    }

    console.error(err);

    return Response.json(
      {
        error: `Something went wrong`,
      },
      {
        status: 500,
      }
    );
  }
};
