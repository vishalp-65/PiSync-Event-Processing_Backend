import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1234567890 implements MigrationInterface {
  name = 'CreateInitialTables1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE devices (
        id VARCHAR(255) PRIMARY KEY,
        deviceType VARCHAR(100),
        deviceModel VARCHAR(50),
        osVersion VARCHAR(20),
        totalSyncEvents INT DEFAULT 0,
        totalSuccessfulSyncs INT DEFAULT 0,
        totalFailedSyncs INT DEFAULT 0,
        consecutiveFailures INT DEFAULT 0,
        lastSyncAt TIMESTAMP NULL,
        lastSuccessfulSyncAt TIMESTAMP NULL,
        avgInternetSpeed DECIMAL(10,2),
        totalFilesSynced BIGINT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_devices_last_sync (lastSyncAt),
        INDEX idx_devices_consecutive_failures (consecutiveFailures)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE sync_events (
        id VARCHAR(36) PRIMARY KEY,
        deviceId VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        totalFilesSynced BIGINT DEFAULT 0,
        totalErrors INT DEFAULT 0,
        internetSpeed DECIMAL(10,2),
        status ENUM('success', 'partial', 'failed') DEFAULT 'success',
        syncDurationMs INT,
        metadata JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE,
        INDEX idx_sync_events_device_id (deviceId),
        INDEX idx_sync_events_timestamp (timestamp),
        INDEX idx_sync_events_status (status),
        INDEX idx_sync_events_device_timestamp (deviceId, timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create partitions for better performance with large datasets
    await queryRunner.query(`
      ALTER TABLE sync_events 
      PARTITION BY RANGE (YEAR(timestamp)) (
        PARTITION p2024 VALUES LESS THAN (2025),
        PARTITION p2025 VALUES LESS THAN (2026),
        PARTITION p2026 VALUES LESS THAN (2027),
        PARTITION p_future VALUES LESS THAN MAXVALUE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE sync_events`);
    await queryRunner.query(`DROP TABLE devices`);
  }
}
