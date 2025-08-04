import { glob } from 'glob';
import path from 'path';
import { pathToFileURL } from 'url';
import express from 'express';

export class BlueprintInterpreter {
  constructor({ app, container }) {
    this.app = app;
    this.container = container;
    this.aggregatedSchemas = [];
  }

  async interpretAndBuild() {
    const rootDir = process.cwd();
    const blueprintPathPattern = path.join(rootDir, 'implementation/src/blueprints/**/*.blueprint.js').replace(/\\/g, '/');
    const blueprintFiles = await glob(blueprintPathPattern);

    for (const file of blueprintFiles) {
      await this._processBlueprint(file);
    }

    this._registerSchemaEndpoint();
  }

  async _processBlueprint(filePath) {
    const { default: blueprint } = await import(pathToFileURL(filePath).href);
    this.aggregatedSchemas.push({ ...blueprint.uiSchema, resourcePrefix: blueprint.resource.prefix });
    const router = express.Router();

    for (const route of blueprint.routes) {
      const middleware = this._createMiddleware(route);
      router[route.method.toLowerCase()](route.path, ...middleware);
    }
    this.app.use(blueprint.resource.prefix, router);
  }

  _createMiddleware(route) {
    const interceptors = (route.interceptors || []).map(name => {
      const interceptor = this.container.resolve(name);
      return async (req, res, next) => {
        if (!interceptor.preHandle) return next();
        try {
          // A simplified context for pre-handlers
          const context = { req, res, user: req.user };
          await interceptor.preHandle(context);
          req.user = context.user; // Persist user attached by auth
          next();
        } catch (err) {
          next(err);
        }
      };
    });

    const handler = this._createHandler(route);
    return [...interceptors, handler];
  }

  _createHandler(route) {
    if (route.handler === 'proxy') {
      const proxyService = this.container.resolve('proxyService');
      return async (req, res, next) => {
        try {
          const finalDownstreamPath = route.downstreamPath.replace(/:(\w+)/g, (match, paramName) => req.params[paramName] || match);
          const { status, data } = await proxyService.forwardRequest({
            req,
            targetServiceUrl: route.targetServiceUrl,
            downstreamPath: finalDownstreamPath,
          });
          res.status(status).json(data);
        } catch (err) {
          next(err);
        }
      };
    } else {
    const [serviceName, methodName] = route.handler.split('.');
    const service = this.container.resolve(serviceName);
    return async (req, res, next) => {
        try {
            // The service now directly handles req, res, next again.
            await service[methodName](req, res, next);
        } catch (err) {
            next(err);
        }
    };
  }
  }

  _registerSchemaEndpoint() {
    this.app.get('/api/v1/schemas/definitions', (req, res) => {
      res.status(200).json(this.aggregatedSchemas);
    });
  }
}