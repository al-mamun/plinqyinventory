import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'plinqy',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }

  async runMigrations(): Promise<void> {
    this.logger.log('Starting database migrations...');

    try {
      // Create migrations tracking table
      await this.createMigrationsTable();

      // Get all migration files
      const migrationsDir = path.join(__dirname, '../migrations');
      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        await this.runMigration(file, migrationsDir);
      }

      this.logger.log('All migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT now()
      )
    `;
    await this.pool.query(query);
  }

  private async runMigration(
    filename: string,
    migrationsDir: string,
  ): Promise<void> {
    // Check if already executed
    const checkQuery = 'SELECT * FROM migrations WHERE name = $1';
    const result = await this.pool.query(checkQuery, [filename]);

    if (result.rows.length > 0) {
      this.logger.log(`Migration ${filename} already executed, skipping...`);
      return;
    }

    this.logger.log(`Running migration: ${filename}`);

    // Read and execute migration
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [
        filename,
      ]);
      await client.query('COMMIT');
      this.logger.log(`Migration ${filename} completed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Migration ${filename} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async checkExtensions(): Promise<void> {
    this.logger.log('Checking required PostgreSQL extensions...');

    const extensions = ['uuid-ossp', 'citext', 'postgis', 'vector'];
    const client = await this.pool.connect();

    try {
      for (const ext of extensions) {
        const result = await client.query(
          `SELECT * FROM pg_extension WHERE extname = $1`,
          [ext],
        );

        if (result.rows.length === 0) {
          this.logger.warn(
            `Extension '${ext}' not installed. Attempting to create...`,
          );
          try {
            await client.query(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
            this.logger.log(`Extension '${ext}' created successfully`);
          } catch (error) {
            this.logger.error(
              `Failed to create extension '${ext}': ${error.message}`,
            );
            this.logger.warn(
              `You may need to install ${ext} manually. See migrations/README.md`,
            );
          }
        } else {
          this.logger.log(`Extension '${ext}' is installed ✓`);
        }
      }
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
