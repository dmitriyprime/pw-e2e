import globalSetup from './global-setup';

globalSetup().catch((err) => {
  console.error(err);
  process.exit(1);
});
