
export function initLogoutView(server) {

  const logout = server.getHiddenUiAppById('inkiru_logout');

  server.route({
    method: 'GET',
    path: '/inkiru_logout',
    handler(request, h) {
      return h.renderAppWithDefaultConfig(logout);
    },
    config: {
      auth: false
    }
  });
}
