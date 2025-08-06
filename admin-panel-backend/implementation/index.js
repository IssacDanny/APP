// 2. Immediately import our new config module to parse and validate them.
// If validation fails, the process will exit here and the server will not start.
import '#platform/core/config/index.js';

// 3. Proceed with starting the server.
import { startServer } from '#platform/core/Server.js';

startServer();