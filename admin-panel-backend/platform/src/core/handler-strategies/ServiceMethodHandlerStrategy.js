// This class encapsulates all logic for creating a service method handler.
export default class ServiceMethodHandlerStrategy {
  create(route, container) {
    const [serviceName, methodName] = route.handler.split('.');
    const service = container.resolve(serviceName);

    // Note: The transformer logic is no longer needed here, as the service
    // method itself is responsible for handling the request context. This simplifies the strategy.
    
    return (context) => {
      // The adapter method will receive the full context and is responsible for parsing it.
      return service[methodName](context);
    };
  }
}