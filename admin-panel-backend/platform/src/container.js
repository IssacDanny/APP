import { createContainer, asClass, asValue, Lifetime } from 'awilix';
import { glob } from 'glob';
import path from 'path';
import { pathToFileURL } from 'url';

function getRegistrationName(filePath) {
  const baseName = path.basename(filePath, '.js');
  const cleanName = baseName.split('.')[0];
  return cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
}

export async function configureContainer(testOverrides) {
  const container = createContainer();
  
  // --- STEP 1: APPLY OVERRIDES FIRST ---
  // This is the most critical part of the fix. We register the mock
  // before any other class can resolve the real dependency.
  if (testOverrides) {
    container.register(testOverrides);
    console.log('[DEBUG] Applied test overrides to container.');
  }
  
  // --- STEP 2: LOAD ALL OTHER MODULES ---
  const rootDir = process.cwd();
   const modulePathPatterns = [
    path.join(rootDir, 'platform/src/services/**/*.js'),
    path.join(rootDir, 'platform/src/interceptors/**/*.js'),
    path.join(rootDir, 'implementation/src/services/**/*.js'),
    path.join(rootDir, 'implementation/src/interceptors/**/*.js'),
    path.join(rootDir, 'implementation/src/transformers/**/*.js'),
  ];
  
  const posixModulePaths = modulePathPatterns.map(p => p.replace(/\\/g, '/'));
  const files = (await Promise.all(posixModulePaths.map(p => glob(p)))).flat();
  
  for (const filePath of files) {
    if (filePath.endsWith('.test.js')) continue;

    const registrationName = getRegistrationName(filePath);
    
    // IMPORTANT: Skip re-registering something that was already provided as an override.
    if (container.registrations[registrationName]) {
        console.log(`[DEBUG] Skipping registration for '${registrationName}' as it was provided by an override.`);
        continue;
    }

    const fileUrl = pathToFileURL(filePath).href;
    try {
      const module = await import(fileUrl);
      const toRegister = module.default;

      // If the export is missing or not a class/object, skip it.
      if (!toRegister) {
          continue;
      }
      
      // --- THE FIX ---
      // Check if the default export is a class (constructor) or a plain value (object).
      const isClass = typeof toRegister === 'function' && /^\s*class\s+/.test(toRegister.toString());

      if (isClass) {
        // It's a class, use asClass
        container.register({
          [registrationName]: asClass(toRegister, { lifetime: Lifetime.SINGLETON }),
        });
      } else {
        // It's a plain object (like our transformer), use asValue
        container.register({
          [registrationName]: asValue(toRegister),
        });
      }
      console.log(`[DEBUG] Registered '${registrationName}' from ${path.basename(filePath)}`);

    } catch (error) {
      console.error(`[ERROR] Failed to load or register module at ${filePath}`, error);
    }
  }

  console.log('--- Container Setup Complete ---');
  return container;
}