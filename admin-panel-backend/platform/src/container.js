import { createContainer, asClass, asValue, Lifetime } from 'awilix';
import { glob } from 'glob';
import path from 'path';
import { pathToFileURL } from 'url';
import { logger } from './core/logger.js';

function getRegistrationName(filePath) {
  const baseName = path.basename(filePath, '.js');
  const cleanName = baseName.split('.')[0];
  return cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
}

export async function configureContainer(testOverrides) {
  const container = createContainer();
  
  container.register({
    logger: asValue(logger),
  });

  if (testOverrides) {
    container.register(testOverrides);
    console.log('[DEBUG] Applied test overrides to container.');
  }
  
  const rootDir = process.cwd();
  const modulePathPatterns = [
    path.join(rootDir, 'platform/src/services/**/*.js'),
    path.join(rootDir, 'platform/src/interceptors/**/*.js'),
    path.join(rootDir, 'implementation/src/services/**/*.js'),
    path.join(rootDir, 'implementation/src/interceptors/**/*.js'),
    path.join(rootDir, 'implementation/src/transformers/**/*.js'),
    path.join(rootDir, 'platform/src/modules/**/*.js'),
    path.join(rootDir, 'platform/src/modules/auth/**/*.js'),
    // --- REFACTORED ---
    // Add the path to our new handler strategy modules.
    path.join(rootDir, 'platform/src/core/handler-strategies/**/*.js'),
  ];
  
  const posixModulePaths = modulePathPatterns.map(p => p.replace(/\\/g, '/'));
  const files = (await Promise.all(posixModulePaths.map(p => glob(p)))).flat();
  
  for (const filePath of files) {
    if (filePath.endsWith('.test.js')) continue;
    const registrationName = getRegistrationName(filePath);
    if (container.registrations[registrationName]) continue;
    const fileUrl = pathToFileURL(filePath).href;
    try {
      const module = await import(fileUrl);
      const toRegister = module.default;
      const regConfig = module.registration;
      if (!toRegister) continue;
      const registrationType = regConfig?.type || (typeof toRegister === 'function' && /^\s*class\s+/.test(toRegister.toString()) ? 'class' : 'value');
      if (registrationType === 'class') {
        container.register({ [registrationName]: asClass(toRegister, { lifetime: Lifetime.SINGLETON }) });
      } else {
        container.register({ [registrationName]: asValue(toRegister) });
      }
    } catch (error) {
      console.error(`[ERROR] Failed to load or register module at ${filePath}`, error);
    }
  }

  // --- REFACTORED ---
  // After all other modules are registered, register the factory that depends on them.
  const HandlerFactory = (await import('./core/HandlerFactory.js')).default;
  container.register({
    handlerFactory: asClass(HandlerFactory, { lifetime: Lifetime.SINGLETON }),
  });

  console.log('--- Container Setup Complete ---');
  return container;
}