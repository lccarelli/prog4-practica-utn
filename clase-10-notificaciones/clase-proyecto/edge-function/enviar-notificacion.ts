import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'jsr:@supabase/server@^1';
import * as webpush from 'https://esm.sh/web-push';

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC');
const VAPID_SECRET = Deno.env.get('VAPID_SECRET');
const VAPID_MAIL = 'mailto:' + Deno.env.get('VAPID_MAIL');

webpush.setVapidDetails(VAPID_MAIL, VAPID_PUBLIC, VAPID_SECRET);

export default {
  fetch: withSupabase({ auth: ['publishable', 'secret'] }, async (req, ctx) => {
    const { data, error } = await ctx.supabase.from('suscripciones_notificaciones').select('*');

    if (error) {
      throw error;
    }

    for (const sus of data) {
      const { endpoint, auth, p256dh } = sus;

      await webpush.sendNotification(
        { endpoint: endpoint, keys: { p256dh: p256dh, auth: auth } },
        JSON.stringify({
          notification: {
            title: 'Clase 10',
            body: 'Esta notificación la mandó una Edge Function de Supabase',
            data: { url: '/' },
          },
        }),
      );
    }

    return new Response(`Enviadas: ${data.length}`, { status: 200 });
  }),
};
