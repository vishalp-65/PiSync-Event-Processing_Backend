import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SyncEvent } from 'src/modules/devices/entities/sync-event.entity';
import { Device } from 'src/modules/sync-events/entities/device.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pisync',
  entities: [SyncEvent, Device],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    connectionLimit: 50,
    acquireTimeout: 60000,
    timeout: 60000,
  },
};

const dataSourceOptions: DataSourceOptions = {
  ...databaseConfig,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
} as DataSourceOptions;

export const AppDataSource = new DataSource(dataSourceOptions);
