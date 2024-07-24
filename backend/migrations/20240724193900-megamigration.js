'use strict';

const config = require('../config/database.js');
const Sequelize = require('sequelize');

console.log('Current environment:', process.env.NODE_ENV);
console.log('Using config:', JSON.stringify(config[process.env.NODE_ENV || 'development'], null, 2));

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const superuserConfig = config.superuser;

    const sequelize = new Sequelize(superuserConfig.database, superuserConfig.username, superuserConfig.password, {
      host: superuserConfig.host,
      port: superuserConfig.port,
      dialect: superuserConfig.dialect
    });

    try {
      await sequelize.authenticate();
      console.log('Superuser connection has been established successfully.');

      // Create roles
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ars_developer') THEN
            CREATE ROLE ars_developer WITH LOGIN PASSWORD 'password' CREATEDB CREATEROLE;
          END IF;
          GRANT ALL PRIVILEGES ON DATABASE ${superuserConfig.database} TO ars_developer;
          GRANT ALL PRIVILEGES ON SCHEMA public TO ars_developer;
          ALTER ROLE ars_developer SET search_path TO public;

          IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ars_app_user') THEN
            CREATE ROLE ars_app_user WITH LOGIN PASSWORD 'app_password';
          END IF;
          GRANT CONNECT ON DATABASE ${superuserConfig.database} TO ars_app_user;
          GRANT USAGE ON SCHEMA public TO ars_app_user;
          GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ars_app_user;
          ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ars_app_user;
        END $$;
      `);

      // Create Users table
      if (!(await queryInterface.tableExists('Users'))) {
        await queryInterface.createTable('Users', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          password: {
            type: Sequelize.STRING,
            allowNull: false
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });
        console.log('Users table created.');
      } else {
        console.log('Users table already exists, skipping creation.');
      }

      // Create reference_virtues_flaws table
      if (!(await queryInterface.tableExists('reference_virtues_flaws'))) {
        await queryInterface.createTable('reference_virtues_flaws', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          type: {
            type: Sequelize.ENUM('Virtue', 'Flaw'),
            allowNull: false
          },
          size: {
            type: Sequelize.ENUM('Major', 'Minor'),
            allowNull: false
          },
          category: {
            type: Sequelize.ENUM('General', 'Social', 'Hermetic', 'Supernatural', 'Tainted', 'Mystery', 'Heroic', 'Child', 'Personality', 'Story', 'Mundane Beast'),
            allowNull: false
          },
          realm: {
            type: Sequelize.ENUM('None', 'Faerie', 'Magic', 'Infernal', 'Divine'),
            allowNull: false
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false
          }
        });
        console.log('reference_virtues_flaws table created.');
      } else {
        console.log('reference_virtues_flaws table already exists, skipping creation.');
      }

      // Create Characters table
      if (!(await queryInterface.tableExists('Characters'))) {
        await queryInterface.createTable('Characters', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          entityId: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
          },
          entityType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'character'
          },
          characterType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'Grog'
          },
          virtues: {
            type: Sequelize.JSON,
            allowNull: true
          },
          flaws: {
            type: Sequelize.JSON,
            allowNull: true
          },
          characteristics: {
            type: Sequelize.JSON,
            allowNull: true
          },
          abilities: {
            type: Sequelize.JSON,
            allowNull: true
          },
          arts: {
            type: Sequelize.JSON,
            allowNull: true
          },
          spells: {
            type: Sequelize.JSON,
            allowNull: true
          },
          equipment: {
            type: Sequelize.JSON,
            allowNull: true
          },
          characteristicsAndAbilities: {
            type: Sequelize.JSON,
            allowNull: true
          },
          equipmentAndCombat: {
            type: Sequelize.JSON,
            allowNull: true
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });
        console.log('Characters table created.');
      } else {
        console.log('Characters table already exists, skipping creation.');
      }

      // Add constraint to Characters table
      const constraintExists = await queryInterface.sequelize.query(
        "SELECT 1 FROM pg_constraint WHERE conname = 'Characters_characterType_ck'",
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (constraintExists.length === 0) {
        await queryInterface.addConstraint('Characters', {
          fields: ['characterType'],
          type: 'check',
          name: 'Characters_characterType_ck',
          where: {
            characterType: ['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie']
          }
        });
        console.log('Constraint added to Characters table.');
      } else {
        console.log('Constraint already exists on Characters table, skipping creation.');
      }

      // Create character_virtues_flaws table
      if (!(await queryInterface.tableExists('character_virtues_flaws'))) {
        await queryInterface.createTable('character_virtues_flaws', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          characterId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Characters',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          referenceVirtueFlawId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'reference_virtues_flaws',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          notes: {
            type: Sequelize.TEXT
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });
        console.log('character_virtues_flaws table created.');
      } else {
        console.log('character_virtues_flaws table already exists, skipping creation.');
      }

      console.log('Migration completed successfully.');
    } catch (error) {
      console.error('Unable to perform migration:', error);
      throw error;
    } finally {
      await sequelize.close();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const superuserConfig = config.superuser;

    const sequelize = new Sequelize(superuserConfig.database, superuserConfig.username, superuserConfig.password, {
      host: superuserConfig.host,
      port: superuserConfig.port,
      dialect: superuserConfig.dialect
    });

    try {
      await sequelize.authenticate();
      console.log('Superuser connection has been established successfully for rollback.');

      // Drop tables
      await queryInterface.removeConstraint('Characters', 'Characters_characterType_ck');
      await queryInterface.dropTable('character_virtues_flaws');
      await queryInterface.dropTable('Characters');
      await queryInterface.dropTable('reference_virtues_flaws');
      await queryInterface.dropTable('Users');

      // Revoke privileges and drop roles
      await sequelize.query(`
        DO $$
        BEGIN
          REVOKE ALL PRIVILEGES ON DATABASE ${superuserConfig.database} FROM ars_developer;
          REVOKE ALL PRIVILEGES ON SCHEMA public FROM ars_developer;
          REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ars_app_user;
          REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ars_app_user;
          REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM ars_app_user;
          
          DROP ROLE IF EXISTS ars_developer;
          DROP ROLE IF EXISTS ars_app_user;
        END $$;
      `);

      console.log('Rollback completed successfully.');
    } catch (error) {
      console.error('Unable to perform rollback:', error);
      throw error;
    } finally {
      await sequelize.close();
    }
  }
};