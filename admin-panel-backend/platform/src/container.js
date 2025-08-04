import { createContainer, asClass, Lifetime } from 'awilix';
import { glob } from 'glob';
import path from 'path';
import { pathToFileURL } from 'url';

// Helper function to convert a file path to a camelCase name
// e.g., 'ProxyService.js' -> 'proxyService'
function getRegistrationName(filePath) {
  const baseName = path.basename(filePath, '.js');
  // Handle cases like 'Auditing.interceptor.js'
  const cleanName = baseName.split('.')[0];
  return cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
}

export async function configureContainer(testOverrides) {
  const container = createContainer();
  const rootDir = process.cwd();

  const modulePathPatterns = [
    path.join(rootDir, 'platform/src/services/**/*.js'),
    path.join(rootDir, 'platform/src/interceptors/**/*.js'),
    path.join(rootDir, 'implementation/src/services/**/*.js'),
    path.join(rootDir, 'implementation/src/interceptors/**/*.js'),
  ];
  
  const posixModulePaths = modulePathPatterns.map(p => p.replace(/\\/g, '/'));

  const files = (await Promise.all(posixModulePaths.map(p => glob(p)))).flat();
  
  console.log(`[DEBUG] Found ${files.length} files to register.`);

  // **** MANUAL REGISTRATION BLOCK ****
  for (const filePath of files) {
    // Exclude test files
    if (filePath.endsWith('.test.js')) {
      continue;
    }

    const fileUrl = pathToFileURL(filePath).href;
    const registrationName = getRegistrationName(filePath);
    
    try {
      // Dynamically import the module
      const module = await import(fileUrl);
      const classToRegister = module.default;

      if (classToRegister && typeof classToRegister === 'function') {
        container.register({
          [registrationName]: asClass(classToRegister, { lifetime: Lifetime.SINGLETON }),
        });
        console.log(`[DEBUG] Registered '${registrationName}' from ${filePath}`);
      } else {
        console.warn(`[WARN] File at ${filePath} does not have a default export that is a class. Skipping registration.`);
      }

    } catch (error) {
      console.error(`[ERROR] Failed to load or register module at ${filePath}`, error);
    }
  }
  // **** END OF MANUAL BLOCK ****

  // --- Final Step: Apply Overrides ---
  // If testOverrides are provided, register them. This will REPLACE any
  // existing registrations with the same name.
  if (testOverrides) {
    container.register(testOverrides);
    console.log('[DEBUG] Applied test overrides to container.');
  }

  console.log('--- Container Setup Complete ---');
  return container;
}