'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- Character type ENUM
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_characters_character_type') THEN
          CREATE TYPE "enum_characters_character_type" AS ENUM ('grog', 'companion', 'magus');
        END IF;
        
        -- House virtue type ENUM
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_character_virtues_flaws_house_virtue_type') THEN
          CREATE TYPE "enum_character_virtues_flaws_house_virtue_type" AS ENUM (
            'automatic',
            'chosen',
            'ex_miscellanea_virtue',
            'ex_miscellanea_flaw'
          );
        END IF;
        
        -- Reference virtue/flaw type ENUM
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reference_virtues_flaws_type') THEN
          CREATE TYPE "enum_reference_virtues_flaws_type" AS ENUM ('Virtue', 'Flaw');
        END IF;
        
        -- Reference virtue/flaw size ENUM
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reference_virtues_flaws_size') THEN
          CREATE TYPE "enum_reference_virtues_flaws_size" AS ENUM ('Minor', 'Major', 'Free');
        END IF;
      END $$;
    `);

    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Unique identifier for the user'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: 'User\'s email address, used for authentication and communication'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Hashed password for user authentication'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when the user account was created'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when the user account was last updated'
      }
    }, {
      timestamps: true,
      underscored: true,
      comment: 'Stores user account information for authentication and authorization'
    });

    // Add index on email for faster lookups during authentication
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    // Create Houses table
    await queryInterface.createTable('houses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Unique identifier for the house'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Name of the Hermetic house (e.g., "Bonisagus", "Tremere")'
      },
      automatic_virtues: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of virtue references that are automatically granted to members of this house'
      },
      virtue_choices: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of virtue choice groups. Each group contains options that a character must choose from when joining the house'
      },
      special_rules: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'Object containing special rules and mechanics specific to this house'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when the house was created'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when the house was last updated'
      }
    }, {
      timestamps: true,
      underscored: true,
      comment: 'Stores information about Hermetic houses, including their special virtues and rules'
    });

    // Add JSONB validation constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE houses 
      ADD CONSTRAINT houses_automatic_virtues_is_array 
      CHECK (jsonb_typeof(automatic_virtues) = 'array');

      ALTER TABLE houses 
      ADD CONSTRAINT houses_virtue_choices_is_array 
      CHECK (jsonb_typeof(virtue_choices) = 'array');

      ALTER TABLE houses 
      ADD CONSTRAINT houses_special_rules_is_object 
      CHECK (jsonb_typeof(special_rules) = 'object');
    `);

    // Add index on house name for faster lookups
    await queryInterface.addIndex('houses', ['name'], {
      unique: true,
      name: 'houses_name_unique'
    });

    // Create ReferenceVirtuesFlaw table
    await queryInterface.createTable('reference_virtues_flaws', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Unique identifier for the reference virtue or flaw'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Name of the virtue or flaw'
      },
      type: {
        type: "enum_reference_virtues_flaws_type",
        allowNull: false,
        comment: 'Whether this is a Virtue or a Flaw'
      },
      size: {
        type: "enum_reference_virtues_flaws_size",
        allowNull: false,
        comment: 'The size/impact of the virtue/flaw (Minor, Major, or Free)'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'The category of the virtue/flaw (e.g., "Supernatural", "Social", "Hermetic")'
      },
      realm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'The supernatural realm associated with this virtue/flaw, if any'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Detailed description of the virtue/flaw and its effects'
      },
      source: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Source book and page reference for this virtue/flaw'
      },
      allowed_sizes: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of allowed sizes for this virtue/flaw (some may be available in multiple sizes)'
      },
      max_selections: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum number of times this virtue/flaw can be taken by a single character'
      },
      prerequisites: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'Object defining requirements that must be met to take this virtue/flaw'
      },
      incompatibilities: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of virtues/flaws that cannot be taken with this one'
      },
      effects: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'Object defining the mechanical effects of this virtue/flaw'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when this reference entry was created'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when this reference entry was last updated'
      }
    }, {
      timestamps: true,
      underscored: true,
      comment: 'Reference table containing all available virtues and flaws that characters can select'
    });

    // Add JSONB validation constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE reference_virtues_flaws 
      ADD CONSTRAINT reference_virtues_flaws_allowed_sizes_is_array 
      CHECK (jsonb_typeof(allowed_sizes) = 'array');

      ALTER TABLE reference_virtues_flaws 
      ADD CONSTRAINT reference_virtues_flaws_prerequisites_is_object 
      CHECK (jsonb_typeof(prerequisites) = 'object');

      ALTER TABLE reference_virtues_flaws 
      ADD CONSTRAINT reference_virtues_flaws_incompatibilities_is_array 
      CHECK (jsonb_typeof(incompatibilities) = 'array');

      ALTER TABLE reference_virtues_flaws 
      ADD CONSTRAINT reference_virtues_flaws_effects_is_object 
      CHECK (jsonb_typeof(effects) = 'object');
    `);

    // Add indexes for common lookups
    await queryInterface.addIndex('reference_virtues_flaws', ['type', 'size'], {
      name: 'reference_virtues_flaws_type_size_idx'
    });
    await queryInterface.addIndex('reference_virtues_flaws', ['category'], {
      name: 'reference_virtues_flaws_category_idx'
    });

    // Create Characters table
    await queryInterface.createTable('characters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Unique identifier for the character'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Name of the character'
      },
      character_type: {
        type: "enum_characters_character_type",
        allowNull: false,
        comment: 'Type of character (Grog, Companion, or Magus)'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Reference to the user who owns this character'
      },
      house_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'houses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Reference to the character\'s Hermetic house (only for Magi)'
      },
      selected_house_virtues: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of house virtues selected by this character'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when the character was created'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when the character was last updated'
      }
    }, {
      timestamps: true,
      underscored: true,
      comment: 'Stores character information including their type, house membership, and selected house virtues'
    });

    // Add JSONB validation constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE characters 
      ADD CONSTRAINT characters_selected_house_virtues_is_array 
      CHECK (jsonb_typeof(selected_house_virtues) = 'array');
    `);

    // Add indexes for common lookups and foreign keys
    await queryInterface.addIndex('characters', ['user_id'], {
      name: 'characters_user_id_idx'
    });
    await queryInterface.addIndex('characters', ['house_id'], {
      name: 'characters_house_id_idx'
    });
    await queryInterface.addIndex('characters', ['character_type'], {
      name: 'characters_character_type_idx'
    });

    // Create CharacterVirtueFlaw table
    await queryInterface.createTable('character_virtues_flaws', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Unique identifier for this character\'s virtue or flaw'
      },
      character_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'characters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to the character who has this virtue/flaw'
      },
      reference_virtue_flaw_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reference_virtues_flaws',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Reference to the virtue/flaw definition'
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'The cost/value of this virtue/flaw for this character (may vary based on circumstances)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Optional notes about how this virtue/flaw applies to this character'
      },
      is_house_virtue_flaw: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indicates if this virtue/flaw was gained through house membership'
      },
      house_virtue_type: {
        type: "enum_character_virtues_flaws_house_virtue_type",
        allowNull: true,
        comment: 'For house virtues/flaws, specifies how it was obtained (automatic, chosen, etc.)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when this virtue/flaw was added to the character'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of when this virtue/flaw was last updated'
      }
    }, {
      timestamps: true,
      underscored: true,
      comment: 'Junction table linking characters to their virtues and flaws, with additional metadata'
    });

    // Add validation constraint for house_virtue_type
    await queryInterface.sequelize.query(`
      ALTER TABLE character_virtues_flaws 
      ADD CONSTRAINT character_virtues_flaws_house_virtue_type_check 
      CHECK (
        (is_house_virtue_flaw = false AND house_virtue_type IS NULL) OR
        (is_house_virtue_flaw = true AND house_virtue_type IS NOT NULL)
      );
    `);

    // Add indexes for common lookups and foreign keys
    await queryInterface.addIndex('character_virtues_flaws', ['character_id'], {
      name: 'character_virtues_flaws_character_id_idx'
    });
    await queryInterface.addIndex('character_virtues_flaws', ['reference_virtue_flaw_id'], {
      name: 'character_virtues_flaws_reference_virtue_flaw_id_idx'
    });
    await queryInterface.addIndex('character_virtues_flaws', ['is_house_virtue_flaw', 'house_virtue_type'], {
      name: 'character_virtues_flaws_house_info_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('reference_virtues_flaws', 'reference_virtues_flaws_type_size_idx');
    await queryInterface.removeIndex('reference_virtues_flaws', 'reference_virtues_flaws_category_idx');
    
    // Drop ReferenceVirtuesFlaw table
    await queryInterface.dropTable('reference_virtues_flaws');

    // Remove indexes
    await queryInterface.removeIndex('houses', 'houses_name_unique');
    
    // Drop Houses table (this will automatically drop the CHECK constraints)
    await queryInterface.dropTable('houses');

    // Remove index on email
    await queryInterface.removeIndex('Users', 'users_email_unique');

    // Drop Users table
    await queryInterface.dropTable('Users');

    // Remove indexes
    await queryInterface.removeIndex('characters', 'characters_user_id_idx');
    await queryInterface.removeIndex('characters', 'characters_house_id_idx');
    await queryInterface.removeIndex('characters', 'characters_character_type_idx');
    
    // Drop Characters table
    await queryInterface.dropTable('characters');

    // Remove indexes
    await queryInterface.removeIndex('character_virtues_flaws', 'character_virtues_flaws_character_id_idx');
    await queryInterface.removeIndex('character_virtues_flaws', 'character_virtues_flaws_reference_virtue_flaw_id_idx');
    await queryInterface.removeIndex('character_virtues_flaws', 'character_virtues_flaws_house_info_idx');
    
    // Drop CharacterVirtueFlaw table
    await queryInterface.dropTable('character_virtues_flaws');

    // Remove ENUM types
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- Character type ENUM
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_characters_character_type') THEN
          DROP TYPE "enum_characters_character_type";
        END IF;
        
        -- House virtue type ENUM
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_character_virtues_flaws_house_virtue_type') THEN
          DROP TYPE "enum_character_virtues_flaws_house_virtue_type";
        END IF;
        
        -- Reference virtue/flaw type ENUM
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reference_virtues_flaws_type') THEN
          DROP TYPE "enum_reference_virtues_flaws_type";
        END IF;
        
        -- Reference virtue/flaw size ENUM
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reference_virtues_flaws_size') THEN
          DROP TYPE "enum_reference_virtues_flaws_size";
        END IF;
      END $$;
    `);
  }
}; 