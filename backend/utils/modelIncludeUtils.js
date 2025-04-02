'use strict';

/**
 * Utility functions for handling model includes in Sequelize queries
 */

/**
 * Creates a safe ReferenceVirtueFlaw include object that excludes timestamp attributes
 * to prevent database errors due to naming inconsistencies
 * 
 * @param {Object} options - Additional include options to merge
 * @returns {Object} - Properly configured include object for ReferenceVirtueFlaw
 */
const safeReferenceVirtueFlawInclude = (options = {}) => {
  // Lazy-load models to avoid circular dependencies
  const { ReferenceVirtueFlaw } = require('../models');
  
  return {
    model: ReferenceVirtueFlaw,
    as: 'referenceVirtueFlaw',
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'created_at', 'updated_at']
    },
    ...options
  };
};

/**
 * Creates a safe CharacterVirtueFlaw include object that properly handles
 * its relationship with ReferenceVirtueFlaw
 * 
 * @param {Object} options - Additional include options to merge
 * @returns {Object} - Properly configured include object for CharacterVirtueFlaw with nested ReferenceVirtueFlaw
 */
const safeCharacterVirtueFlawsInclude = (options = {}) => {
  const { include: includeOptions, ...otherOptions } = options;
  
  // Lazy-load models to avoid circular dependencies
  const { CharacterVirtueFlaw } = require('../models');
  
  return {
    model: CharacterVirtueFlaw,
    as: 'CharacterVirtueFlaws',
    include: [
      safeReferenceVirtueFlawInclude(),
      ...(includeOptions || [])
    ],
    ...otherOptions
  };
};

module.exports = {
  safeReferenceVirtueFlawInclude,
  safeCharacterVirtueFlawsInclude
};