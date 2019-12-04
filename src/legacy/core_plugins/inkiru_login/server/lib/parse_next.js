
import { parse } from 'url';

export function parseNext(href, basePath = '') {
  const { query, hash } = parse(href, true);
  if (!query.next) {
    return `${basePath}/`;
  }

  const { protocol, hostname, port, pathname } = parse(
    query.next,
    false,
    true
  );

  if (protocol !== null || hostname !== null || port !== null) {
    return `${basePath}/`;
  }

  if (!String(pathname).startsWith(basePath)) {
    return `${basePath}/`;
  }

  return query.next + (hash || '');
}
