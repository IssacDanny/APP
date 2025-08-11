import { glob } from 'glob';
import path from 'path';
import { pathToFileURL } from 'url';
import express from 'express';
import onFinished from 'on-finished';

export class BlueprintInterpreter {
  // --- REFACTORED ---
  // The interpreter now depends on the factory to create handlers.
  constructor({ app, container, handlerFactory }) {
    this.app = app;
    this.container = container;
    this.handlerFactory = handlerFactory;
    this.aggregatedSchemas = [];
  }

  async interpretAndBuild(testBlueprintPath) {
    // This method remains unchanged from your version.
    console.log('--- Blueprint Interpreter: Starting ---');
    let blueprintFiles;
    if (testBlueprintPath) {
      console.log(`[DEBUG] Using test-specific blueprint path: ${testBlueprintPath}`);
      blueprintFiles = await glob(testBlueprintPath.replace(/\\/g, '/'));
    } else {
      const rootDir = process.cwd();
      const platformBlueprintPath = path.join(rootDir, 'platform/src/modules/**/*.blueprint.js').replace(/\\/g, '/');
      const implementationBlueprintPath = path.join(rootDir, 'implementation/src/blueprints/**/*.blueprint.js').replace(/\\/g, '/');
      const platformFiles = await glob(platformBlueprintPath);
      const implementationFiles = await glob(implementationBlueprintPath);
      blueprintFiles = [...platformFiles, ...implementationFiles];
    }
    if (blueprintFiles.length === 0) {
      console.warn('[WARN] No blueprints found to interpret.');
      this._registerSchemaEndpoint();
      return;
    }
    console.log(`Found ${blueprintFiles.length} blueprint(s) to interpret:`, blueprintFiles);
    for (const file of blueprintFiles) {
      try {
        await this._processBlueprint(file);
      } catch (error) {
        console.error(`[FATAL] Failed to process blueprint: ${file}`, error);
      }
    }
    this._registerSchemaEndpoint();
    console.log('--- Blueprint Interpreter: Finished ---');
  }

  async _processBlueprint(filePath) {
    console.log(`\nInterpreting blueprint: ${path.basename(filePath)}`);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: blueprint } = await import(fileUrl);

    // --- THE FIX IS HERE ---
    // Check if the blueprint is intended to be visible in the UI.
    // Headless blueprints (like Auth) might not have a title or icon.
    if (blueprint.uiSchema && blueprint.uiSchema.title) {
      const topLevelResourceGroup = {
        type: 'resourceGroup',
        id: blueprint.resource.name,
        title: blueprint.uiSchema.title,
        icon: blueprint.uiSchema.icon,
        display: 'section',
        items: blueprint.uiSchema.items,
      };

      this.aggregatedSchemas.push(topLevelResourceGroup);
      console.log(`  - Registered UI Schema for resource group: ${blueprint.resource.name}`);
    } else {
      console.log(`  - Skipping UI Schema for headless blueprint: ${blueprint.resource.name}`);
    }

    // Always process the routes, regardless of whether it has a UI.
    const router = express.Router({ strict: false });
    for (const route of blueprint.routes) {
      const requestLifecycleHandler = this._createRequestLifecycleHandler(route);
      router[route.method.toLowerCase()](route.path, requestLifecycleHandler);
    }
    this.app.use(blueprint.resource.prefix, router);
  }

  _createRequestLifecycleHandler(route) {
    const interceptors = this._resolveInterceptors(route);
    const mainHandler = this.handlerFactory.createHandler(route, this.container);

    return async (req, res, next) => {
      // --- REFINEMENT ---
      // Initialize context with user from req, if any previous middleware set it.
      const context = { req, res, user: req.user || null, payloads: {}, result: null, error: null };

      this._registerPostHandlers(res, interceptors, context);
      
      try {
        await this._runPreHandlers(interceptors, context);
        const result = await mainHandler(context);
        this._populateContextFromResult(context, result, route);
        this._sendResponse(res, context.result);
      } catch (err) {
        context.error = err;
        next(err);
      }
    };
  }
  
  // --- THE _createMainHandler METHOD IS NOW COMPLETELY REMOVED ---
  // All of its logic has been moved to the new strategy classes.

  // All other helper methods (_resolveInterceptors, _registerPostHandlers, etc.)
  // remain exactly the same as in your provided file.
  _resolveInterceptors(route) {
    return (route.interceptors || []).map(config => {
      if (typeof config === 'string') return { instance: this.container.resolve(config), options: {} };
      if (typeof config === 'object' && config.name) return { instance: this.container.resolve(config.name), options: config.options || {} };
      throw new Error(`Invalid interceptor configuration in route ${route.path}: ${JSON.stringify(config)}`);
    });
  }

  _registerPostHandlers(res, interceptors, context) {
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
  }
  
  /**
   * Executes the preHandle hook for all relevant interceptors.
   * @private
   */
  async _runPreHandlers(interceptors, context) {
    for (const { instance, options } of interceptors) {
      if (instance.preHandle) {
        await instance.preHandle(context, options);
        
        // --- THE FIX IS HERE ---
        // After an interceptor runs its preHandle, we check if it has modified
        // the 'user' property on the context. If it has, we persist this
        // change back to the main Express 'req' object. This makes the
        // updated state available to all subsequent parts of the request lifecycle.
        if (context.user) {
          context.req.user = context.user;
        }
      }
    }
  }

  _populateContextFromResult(context, result, route) {
    if (route.handler === 'proxy') {
      context.result = result;
    } else {
      if (result && result.payloads) Object.assign(context.payloads, result.payloads);
      context.result = {
        status: result ? (result.status || 200) : 204,
        data: result ? result.response : null,
      };
    }
  }

  _sendResponse(res, result) {
    if (result.status === 204) res.status(204).end();
    else res.status(result.status).json(result.data);
  }

  _registerSchemaEndpoint() {
    this.app.get('/api/v1/schemas/definitions', (req, res) => {
      res.status(200).json(this.aggregatedSchemas);
    });
  }
}