import { invariantResponse } from '~/utils/misc';
import type { Route } from './+types/images';

export async function loader({ params, context }: Route.LoaderArgs) {
  const file = await context.cloudflare.env.R2.get(params.imageId);

  invariantResponse(file, 'File not found', { status: 404 });
  const contentType = file.httpMetadata?.contentType || 'image/jpeg';

  return new Response(file.body, {
    headers: {
      'content-type': contentType,
      'content-length': file.size.toString(),
      'content-disposition': 'inline; filename="image"',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
