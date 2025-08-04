import { glob } from 'glob';
import path from 'path';
import { pathToFileURL } from 'url';
import express from 'express';
import onFinished from 'on-finished';

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
      const requestLifecycleHandler = this._createRequestLifecycleHandler(route);
      router[route.method.toLowerCase()](route.path, requestLifecycleHandler);
    }
    this.app.use(blueprint.resource.prefix, router);
  }

  /**
   * Creates a single Express handler that manages the entire request lifecycle.
   */
  _createRequestLifecycleHandler(route) {
    const interceptors = (route.interceptors || []).map(name => this.container.resolve(name));
    const mainHandler = this._createMainHandler(route);

    return async (req, res, next) => {
      // 1. Create the single context object for the entire request lifecycle.
      const context = { req, res, user: null, payloads: {}, result: null, error: null };

      // 2. Attach the post-handle logic immediately.
      // This listener will wait patiently until the response is finished or errors out.
      onFinished(res, async (err) => {
        context.error = err; // Capture stream errors if any
        for (const interceptor of interceptors.slice().reverse()) {
          if (interceptor.postHandle) {
            try {
              await interceptor.postHandle(context);
            } catch (postErr) {
              console.error(`[ERROR] Non-blocking error in postHandle for '${interceptor.constructor.name}':`, postErr);
            }
          }
        }
      });

      // 3. Proceed with the main request logic inside a try...catch block.
      try {
        // --- PRE-HANDLE ---
        for (const interceptor of interceptors) {
          if (interceptor.preHandle) {
            await interceptor.preHandle(context);
            req.user = context.user; // Persist user from auth interceptor
          }
        }

        // --- MAIN LOGIC ---
        const result = await mainHandler(req, res);
        
        // --- POPULATE CONTEXT ---
        if (route.handler === 'proxy') {
            context.result = result;
        } else {
            // This is a custom service result
            if (result.payloads) Object.assign(context.payloads, result.payloads);
            context.result = {
                status: result.status || 200,
                data: result.response,
            };
        }
        
        // --- SEND RESPONSE ---
        // This is the action that will eventually trigger the on-finished listener.
        res.status(context.result.status).json(context.result.data);

      } catch (err) {
        // If anything in pre-handle or main logic fails, pass to global handler.
        context.error = err;
        next(err);
      }
    };
  }

  /**
   * Creates the main business logic handler function.
   */
  _createMainHandler(route) {
    if (route.handler === 'proxy') {
      const proxyService = this.container.resolve('proxyService');
      return (req, res) => {
        const finalDownstreamPath = route.downstreamPath.replace(/:(\w+)/g, (match, paramName) => req.params[paramName] || match);
        return proxyService.forwardRequest({
          req,
          targetServiceUrl: route.targetServiceUrl,
          downstreamPath: finalDownstreamPath,
        });
      };
    } else {
      const [serviceName, methodName] = route.handler.split('.');
      const service = this.container.resolve(serviceName);
      return (req, res) => service[methodName](req, res);
    }
  }

  _registerSchemaEndpoint() {
    this.app.get('/api/v1/schemas/definitions', (req, res) => {
      res.status(200).json(this.aggregatedSchemas);
    });
  }
}