export default class HandlerFactory {
  constructor({ proxyHandlerStrategy, serviceMethodHandlerStrategy }) {
    this.strategies = {
      proxy: proxyHandlerStrategy,
      service: serviceMethodHandlerStrategy,
    };
  }

  createHandler(route, container) {
    // Determine which strategy to use based on the blueprint's route definition
    const strategyType = route.handler === 'proxy' ? 'proxy' : 'service';
    const strategy = this.strategies[strategyType];

    if (!strategy) {
      throw new Error(`No handler strategy found for route handler type: ${route.handler}`);
    }

    return strategy.create(route, container);
  }
}