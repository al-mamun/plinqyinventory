#!/usr/bin/env node
import { config } from 'dotenv';
import { MigrationService } from '../database/migration.service';

// Load environment variables
config();

async function runMigrations() {
  console.log('🚀 Plinqy Database Migration Tool\n');

  const migrationService = new MigrationService();

  try {
    // Check extensions first
    await migrationService.checkExtensions();
    console.log('');

    // Run migrations
    await migrationService.runMigrations();

    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationService.onModuleDestroy();
  }
}

runMigrations();
