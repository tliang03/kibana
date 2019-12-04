
import { get } from 'lodash';

import { parseNext } from '../lib/parse_next';

export function initLoginView(server) {
  const config = server.config();
  const cookieName = config.get('inkiru_login.cookieName');

  server.route({
    method: 'GET',
    path: '/inkiru_login',
    handler(request, h) {
      const isUserAlreadyLoggedIn = !!request.state[cookieName];

      const basePath = config.get('server.basePath');
      const url = get(request, 'raw.req.url');

      if (isUserAlreadyLoggedIn) {

        return h.redirect(parseNext(url, basePath));

      } else {

        const nextURL = `${request.server.info.uri}${parseNext(url, basePath)}`;

        return h.redirect(`https://inkiru-dashboard.prod.walmart.com/portal/login?redirect_uri=${nextURL}`);
      }

    },
    config: {
      auth: false
    }
  });
}
