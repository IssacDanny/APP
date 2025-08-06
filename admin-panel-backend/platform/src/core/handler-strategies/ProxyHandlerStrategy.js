// This class encapsulates all logic for creating a proxy handler.
export default class ProxyHandlerStrategy {
  create(route, container) {
    const { transform } = route;
    const proxyService = container.resolve('proxyService');
    const requestTransformer = this._resolveTransformer(transform?.request, container);
    const responseTransformer = this._resolveTransformer(transform?.response, container);

    return async (context) => {
      const { req } = context;
      const finalDownstreamPath = route.downstreamPath.replace(/:(\w+)/g, (match, paramName) => req.params[paramName] || match);
      
      const originalBody = req.body;
      if (requestTransformer) {
        req.body = requestTransformer(originalBody);
      }

      const result = await proxyService.forwardRequest({
        req,
        targetServiceUrl: route.targetServiceUrl,
        downstreamPath: finalDownstreamPath,
      });
      
      req.body = originalBody; // Restore body

      if (responseTransformer && result.data) {
        result.data = responseTransformer(result.data);
      }
      return result;
    };
  }

  _resolveTransformer(transformString, container) {
    if (!transformString) return null;
    const [name, method] = transformString.split('.');
    return container.resolve(name)[method];
  }
}