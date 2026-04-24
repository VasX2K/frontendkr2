import { app } from './app.js';
import { env } from './config/env.js';
import { seedAdmin } from './services/userStore.js';

await seedAdmin();
app.listen(env.port, () => {
  console.log(`API: http://localhost:${env.port}`);
  console.log(`Swagger: http://localhost:${env.port}/api-docs`);
  console.log('Demo admin: admin@example.com / admin123');
});
