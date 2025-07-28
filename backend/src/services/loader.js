import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Dynamically finds and imports all valid adapter modules from the adapters directory.
 * @returns {Promise<Array<import('../core/Adapter').Adapter>>} A promise that resolves to an array of adapter instances.
 */
export async function loadAdapters() {
  console.log('🔄 Loading service adapters...');
  const adaptersDir = path.join(__dirname, '..', 'adapters');
  const adapterFolders = await readdir(adaptersDir, { withFileTypes: true });

  const allAdapters = await Promise.all(
    adapterFolders
      .filter(dirent => dirent.isDirectory())
      .map(async (dir) => {
        try {
          const adapterPath = path.join(adaptersDir, dir.name, 'adapter.js');
          const adapterUrl = pathToFileURL(adapterPath).href;
          const { default: adapter } = await import(adapterUrl);
          console.log(`  ✅ Successfully loaded adapter: ${dir.name}`);
          return adapter;
        } catch (e) {
          console.error(`  🚨 FAILED to load adapter from '${dir.name}':`, e);
          return null;
        }
      })
  );

  const validAdapters = allAdapters.filter(Boolean);
  console.log(`👍 Found ${validAdapters.length} valid adapters.\n`);
  return validAdapters;
}