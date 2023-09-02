import { nanoid } from "nanoid";
import type { APIRoute } from "astro";
import { kv } from "../../lib/kv";
import { validateSecretSchema } from "../../lib/schema";
import { ZodError } from "zod";

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawData = await request.json();
    const data = validateSecretSchema.parse(rawData);
    const id = nanoid();

    await kv.set(id, JSON.stringify({
      destruct: data.destruct,
      secret: data.secret
    }), {
      ex: parseInt(data.expire),
    });

    return Response.json({
      id,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return Response.json(
        {
          error: err.errors[0].message,
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
