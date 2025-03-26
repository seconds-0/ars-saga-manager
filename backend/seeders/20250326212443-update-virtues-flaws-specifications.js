'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Define virtues and flaws that require specifications
    const virtuesToUpdate = [
      // Virtues that affect abilities
      {
        name: 'Puissant (Ability)',
        updates: {
          requires_specification: true,
          specification_type: 'Ability',
          specification_options_query: '/api/reference-abilities',
          ability_score_bonus: 2,
          affects_ability_cost: false
        }
      },
      {
        name: 'Affinity with (Ability)',
        updates: {
          requires_specification: true,
          specification_type: 'Ability',
          specification_options_query: '/api/reference-abilities',
          ability_score_bonus: 0,
          affects_ability_cost: true
        }
      },
      {
        name: 'Book Learner',
        updates: {
          affects_ability_cost: true,
          ability_score_bonus: 0
        }
      },
      {
        name: 'Apt Student',
        updates: {
          affects_ability_cost: true,
          ability_score_bonus: 0
        }
      },
      // Virtues that affect experience pools
      {
        name: 'Wealthy',
        updates: {
          general_exp_modifier: 5,
          exp_rate_modifier: 0
        }
      },
      {
        name: 'Privileged Upbringing',
        updates: {
          general_exp_modifier: 0,
          general_exp_modifier_category: 'ACADEMIC',
          exp_rate_modifier: 0
        }
      },
      {
        name: 'Warrior',
        updates: {
          general_exp_modifier: 0,
          general_exp_modifier_category: 'MARTIAL',
          exp_rate_modifier: 0
        }
      },
      {
        name: 'Educated',
        updates: {
          general_exp_modifier: 0,
          general_exp_modifier_category: 'ACADEMIC',
          exp_rate_modifier: 0
        }
      },
      // Arts related virtues
      {
        name: 'Puissant (Art)',
        updates: {
          requires_specification: true,
          specification_type: 'Art',
          specification_options_query: '/api/reference-arts',
          ability_score_bonus: 2,
          affects_ability_cost: false
        }
      },
      {
        name: 'Affinity with (Art)',
        updates: {
          requires_specification: true,
          specification_type: 'Art',
          specification_options_query: '/api/reference-arts',
          ability_score_bonus: 0,
          affects_ability_cost: true
        }
      },
      // Characteristic virtue
      {
        name: 'Improved Characteristic',
        updates: {
          requires_specification: true,
          specification_type: 'Characteristic',
          ability_score_bonus: 0
        }
      }
    ];

    // Define flaws that affect experience pools
    const flawsToUpdate = [
      {
        name: 'Poor',
        updates: {
          general_exp_modifier: -5,
          exp_rate_modifier: 0
        }
      },
      {
        name: 'Sheltered Upbringing',
        updates: {
          general_exp_modifier: -5,
          exp_rate_modifier: 0
        }
      },
      {
        name: 'Deficient Technique',
        updates: {
          requires_specification: true,
          specification_type: 'Art',
          specification_options_query: '/api/reference-arts?type=technique',
          ability_score_bonus: -3,
          affects_ability_cost: false
        }
      },
      {
        name: 'Deficient Form',
        updates: {
          requires_specification: true,
          specification_type: 'Art',
          specification_options_query: '/api/reference-arts?type=form',
          ability_score_bonus: -3,
          affects_ability_cost: false
        }
      },
      {
        name: 'Incomprehensible',
        updates: {
          general_exp_modifier: -2,
          general_exp_modifier_category: 'ACADEMIC',
          exp_rate_modifier: 0
        }
      }
    ];

    // Update virtues
    for (const virtue of virtuesToUpdate) {
      await queryInterface.sequelize.query(
        `UPDATE reference_virtues_flaws 
         SET 
           requires_specification = :requires_specification,
           specification_type = :specification_type,
           specification_options_query = :specification_options_query,
           ability_score_bonus = :ability_score_bonus,
           affects_ability_cost = :affects_ability_cost,
           general_exp_modifier = :general_exp_modifier,
           general_exp_modifier_category = :general_exp_modifier_category,
           exp_rate_modifier = :exp_rate_modifier
         WHERE 
           name = :name AND type = 'Virtue'`,
        {
          replacements: {
            name: virtue.name,
            requires_specification: virtue.updates.requires_specification || false,
            specification_type: virtue.updates.specification_type || null,
            specification_options_query: virtue.updates.specification_options_query || null,
            ability_score_bonus: virtue.updates.ability_score_bonus || 0,
            affects_ability_cost: virtue.updates.affects_ability_cost || false,
            general_exp_modifier: virtue.updates.general_exp_modifier !== undefined ? virtue.updates.general_exp_modifier : 0,
            general_exp_modifier_category: virtue.updates.general_exp_modifier_category || null,
            exp_rate_modifier: virtue.updates.exp_rate_modifier !== undefined ? virtue.updates.exp_rate_modifier : 0
          },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Update flaws
    for (const flaw of flawsToUpdate) {
      await queryInterface.sequelize.query(
        `UPDATE reference_virtues_flaws 
         SET 
           requires_specification = :requires_specification,
           specification_type = :specification_type,
           specification_options_query = :specification_options_query,
           ability_score_bonus = :ability_score_bonus,
           affects_ability_cost = :affects_ability_cost,
           general_exp_modifier = :general_exp_modifier,
           general_exp_modifier_category = :general_exp_modifier_category,
           exp_rate_modifier = :exp_rate_modifier
         WHERE 
           name = :name AND type = 'Flaw'`,
        {
          replacements: {
            name: flaw.name,
            requires_specification: flaw.updates.requires_specification || false,
            specification_type: flaw.updates.specification_type || null,
            specification_options_query: flaw.updates.specification_options_query || null,
            ability_score_bonus: flaw.updates.ability_score_bonus || 0,
            affects_ability_cost: flaw.updates.affects_ability_cost || false,
            general_exp_modifier: flaw.updates.general_exp_modifier !== undefined ? flaw.updates.general_exp_modifier : 0,
            general_exp_modifier_category: flaw.updates.general_exp_modifier_category || null,
            exp_rate_modifier: flaw.updates.exp_rate_modifier !== undefined ? flaw.updates.exp_rate_modifier : 0
          },
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down (queryInterface, Sequelize) {
    // Reset all the new fields to their default values
    await queryInterface.sequelize.query(`
      UPDATE reference_virtues_flaws
      SET
        requires_specification = false,
        specification_type = NULL,
        specification_options_query = NULL,
        ability_score_bonus = 0,
        affects_ability_cost = false
    `);
  }
};
