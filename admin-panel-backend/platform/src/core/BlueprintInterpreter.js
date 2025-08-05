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
    console.log('--- Blueprint Interpreter: Starting ---');
    const rootDir = process.cwd();

    // --- FIX: Define paths for both platform and implementation blueprints ---
    const platformBlueprintPath = path.join(rootDir, 'platform/src/modules/**/*.blueprint.js').replace(/\\/g, '/');
    const implementationBlueprintPath = path.join(rootDir, 'implementation/src/blueprints/**/*.blueprint.js').replace(/\\/g, '/');

    // --- FIX: Use glob to find all files from both locations and combine them ---
    const platformFiles = await glob(platformBlueprintPath);
    const implementationFiles = await glob(implementationBlueprintPath);
    const blueprintFiles = [...platformFiles, ...implementationFiles];

    if (blueprintFiles.length === 0) {
      console.warn('[WARN] No blueprints found to interpret.');
      this._registerSchemaEndpoint(); // Still register the endpoint even if empty
      return;
    }

    console.log(`Found ${blueprintFiles.length} blueprint(s) to interpret:`, blueprintFiles);

    for (const file of blueprintFiles) {
      // Add a try-catch block here for more robust error handling
      try {
        await this._processBlueprint(file);
      } catch (error) {
        console.error(`[FATAL] Failed to process blueprint: ${file}`, error);
        // Depending on desired behavior, you might want to stop the server
        // process.exit(1); 
      }
    }

    this._registerSchemaEndpoint();
    console.log('--- Blueprint Interpreter: Finished ---');
  }

  async _processBlueprint(filePath) {
    console.log(`\nInterpreting blueprint: ${path.basename(filePath)}`);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: blueprint } = await import(fileUrl);
    this.aggregatedSchemas.push({
      ...blueprint.uiSchema,
      resourcePrefix: blueprint.resource.prefix,
    });
    console.log(`  - Registered UI Schema for resource: ${blueprint.resource.name}`);
    const router = express.Router({ strict: false });

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
    const interceptorConfigs = route.interceptors || [];
    
    const interceptors = interceptorConfigs.map(config => {
      if (typeof config === 'string') {
        return { instance: this.container.resolve(config), options: {} };
      } else if (typeof config === 'object' && config.name) {
        return { instance: this.container.resolve(config.name), options: config.options || {} };
      }
      throw new Error(`Invalid interceptor configuration in route ${route.path}: ${JSON.stringify(config)}`);
    });

    const mainHandler = this._createMainHandler(route);

    return async (req, res, next) => {
      const context = { req, res, user: null, payloads: {}, result: null, error: null };

      onFinished(res, async (err) => {
        context.error = err;
        for (const { instance, options } of interceptors.slice().reverse()) {
          if (instance.postHandle) {
            try {
              await instance.postHandle(context, options);
            } catch (postErr) {
              console.error(`[ERROR] Non-blocking error in postHandle for '${instance.constructor.name}':`, postErr);
            }
          }
        }
      });

      try {
        for (const { instance, options } of interceptors) {
          if (instance.preHandle) {
            await instance.preHandle(context, options);
          }
        }

        const result = await mainHandler(context);
        
        if (route.handler === 'proxy') {
          context.result = result;
        } else {
          if (result && result.payloads) Object.assign(context.payloads, result.payloads);
          context.result = {
            status: result ? (result.status || 200) : 204,
            data: result ? result.response : null,
          };
        }
        
        if (context.result.status === 204) {
            res.status(204).end();
        } else {
            res.status(context.result.status).json(context.result.data);
        }

      } catch (err) {
        context.error = err;
        next(err);
      }
    };
  }

    /**
   * Creates the main business logic handler function.
   * This handler receives the `context` object from the lifecycle manager.
   */
  _createMainHandler(route) {
    const { transform } = route;
    let requestTransformer = null;
    let responseTransformer = null;

    if (transform) {
      if (transform.request) {
        const [name, method] = transform.request.split('.');
        requestTransformer = this.container.resolve(name)[method];
      }
      if (transform.response) {
        const [name, method] = transform.response.split('.');
        responseTransformer = this.container.resolve(name)[method];
      }
    }

    if (route.handler === 'proxy') {
      const proxyService = this.container.resolve('proxyService');
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
        
        req.body = originalBody;

        if (responseTransformer && result.data) {
          result.data = responseTransformer(result.data);
        }
        return result;
      };
    } else {
      const [serviceName, methodName] = route.handler.split('.');
      const service = this.container.resolve(serviceName);
      
      return (context) => {
        const { req } = context;
        let requestData = req.body;
        if (requestTransformer) {
          requestData = requestTransformer(req.body);
        }
        // Pass the full context to the service method, which is what it expects.
        return service[methodName](req, context);
      };
    }
  }

  _registerSchemaEndpoint() {
    this.app.get('/api/v1/schemas/definitions', (req, res) => {
      res.status(200).json(this.aggregatedSchemas);
    });
  }
}