'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // General Abilities
    const generalAbilities = [
      { name: 'Animal Handling', category: 'GENERAL', description: 'The ability to train, control, and care for animals.', created_at: now, updated_at: now },
      { name: 'Area Lore', category: 'GENERAL', description: 'Knowledge of a specific geographical region, its history, customs, and notable features.', created_at: now, updated_at: now },
      { name: 'Athletics', category: 'GENERAL', description: 'Physical fitness and training for sports, running, jumping, and swimming.', created_at: now, updated_at: now },
      { name: 'Awareness', category: 'GENERAL', description: 'The ability to notice things, be aware of your surroundings, and detect unusual details.', created_at: now, updated_at: now },
      { name: 'Bargain', category: 'GENERAL', description: 'The skill of haggling and negotiating prices and transactions.', created_at: now, updated_at: now },
      { name: 'Brawl', category: 'GENERAL', description: 'Fighting unarmed or with improvised weapons in informal combat.', created_at: now, updated_at: now },
      { name: 'Carouse', category: 'GENERAL', description: 'The ability to socialize while drinking heavily without suffering ill effects.', created_at: now, updated_at: now },
      { name: 'Charm', category: 'GENERAL', description: 'The ability to make a good impression and convince others to like you.', created_at: now, updated_at: now },
      { name: 'Chirurgy', category: 'GENERAL', description: 'The practice of medieval medicine and surgery.', created_at: now, updated_at: now },
      { name: 'Concentration', category: 'GENERAL', description: 'The ability to focus on a task despite distractions.', created_at: now, updated_at: now },
      { name: 'Craft', category: 'GENERAL', description: 'The ability to make and repair objects by hand.', created_at: now, updated_at: now },
      { name: 'Etiquette', category: 'GENERAL', description: 'Knowledge of proper behavior in social situations.', created_at: now, updated_at: now },
      { name: 'Folk Ken', category: 'GENERAL', description: 'The ability to understand people and their motivations.', created_at: now, updated_at: now },
      { name: 'Guile', category: 'GENERAL', description: 'The ability to lie convincingly and mislead others.', created_at: now, updated_at: now },
      { name: 'Hunt', category: 'GENERAL', description: 'The ability to track animals, set traps, and obtain food from the wilderness.', created_at: now, updated_at: now },
      { name: 'Leadership', category: 'GENERAL', description: 'The ability to lead and inspire others.', created_at: now, updated_at: now },
      { name: 'Legerdemain', category: 'GENERAL', description: 'Sleight of hand, picking pockets, and fine manual dexterity.', created_at: now, updated_at: now },
      { name: 'Music', category: 'GENERAL', description: 'The ability to play musical instruments and sing.', created_at: now, updated_at: now },
      { name: 'Profession', category: 'GENERAL', description: 'Skill in a professional trade or occupation.', created_at: now, updated_at: now },
      { name: 'Ride', category: 'GENERAL', description: 'The ability to ride and control horses and other mounts.', created_at: now, updated_at: now },
      { name: 'Stealth', category: 'GENERAL', description: 'The ability to move quietly and remain hidden.', created_at: now, updated_at: now },
      { name: 'Survival', category: 'GENERAL', description: 'The ability to find food, water, and shelter in the wilderness.', created_at: now, updated_at: now },
      { name: 'Swim', category: 'GENERAL', description: 'The ability to stay afloat and move through water.', created_at: now, updated_at: now },
      { name: 'Teaching', category: 'GENERAL', description: 'The ability to effectively instruct others and help them learn.', created_at: now, updated_at: now }
    ];

    // Academic Abilities
    const academicAbilities = [
      { name: 'Artes Liberales', category: 'ACADEMIC', description: 'Grammar, logic, rhetoric, arithmetic, geometry, astronomy, and music.', created_at: now, updated_at: now },
      { name: 'Civil and Canon Law', category: 'ACADEMIC', description: 'Knowledge of secular and Church law.', created_at: now, updated_at: now },
      { name: 'Common Law', category: 'ACADEMIC', description: 'Knowledge of local and customary laws and traditions.', created_at: now, updated_at: now },
      { name: 'Dead Language', category: 'ACADEMIC', description: 'Knowledge of ancient languages like Etruscan, Ancient Egyptian, or Pictish.', created_at: now, updated_at: now },
      { name: 'Medicine', category: 'ACADEMIC', description: 'Formal academic medical knowledge, based on Galenic theory.', created_at: now, updated_at: now },
      { name: 'Philosophiae', category: 'ACADEMIC', description: 'Natural philosophy, moral philosophy, and metaphysics.', created_at: now, updated_at: now },
      { name: 'Theology', category: 'ACADEMIC', description: 'The formal study of religious doctrine and belief.', created_at: now, updated_at: now }
    ];

    // Languages as a subset of Academic
    const languageAbilities = [
      { name: 'Latin', category: 'ACADEMIC', description: 'The language of scholars, the Church, and international communication.', created_at: now, updated_at: now },
      { name: 'Arabic', category: 'ACADEMIC', description: 'The language of the Islamic world and much ancient knowledge.', created_at: now, updated_at: now },
      { name: 'Greek', category: 'ACADEMIC', description: 'The language of the Eastern Roman Empire and ancient philosophers.', created_at: now, updated_at: now },
      { name: 'Hebrew', category: 'ACADEMIC', description: 'The sacred language of Judaism.', created_at: now, updated_at: now },
      { name: 'English', category: 'ACADEMIC', description: 'The language of England.', created_at: now, updated_at: now },
      { name: 'French', category: 'ACADEMIC', description: 'The language of France and the nobility of England.', created_at: now, updated_at: now },
      { name: 'German', category: 'ACADEMIC', description: 'The language of the Holy Roman Empire.', created_at: now, updated_at: now },
      { name: 'Italian', category: 'ACADEMIC', description: 'The language of Italy.', created_at: now, updated_at: now },
      { name: 'Spanish', category: 'ACADEMIC', description: 'The language of Spain.', created_at: now, updated_at: now }
    ];

    // Martial Abilities
    const martialAbilities = [
      { name: 'Bow', category: 'MARTIAL', description: 'Proficiency with bows, including shortbows and longbows.', created_at: now, updated_at: now },
      { name: 'Brawl', category: 'MARTIAL', description: 'Fighting unarmed or with improvised weapons in formal combat.', created_at: now, updated_at: now },
      { name: 'Crossbow', category: 'MARTIAL', description: 'Proficiency with crossbows.', created_at: now, updated_at: now },
      { name: 'Great Weapon', category: 'MARTIAL', description: 'Proficiency with large two-handed weapons like greatswords and polearms.', created_at: now, updated_at: now },
      { name: 'Shield', category: 'MARTIAL', description: 'Proficiency with shields for defense in combat.', created_at: now, updated_at: now },
      { name: 'Single Weapon', category: 'MARTIAL', description: 'Proficiency with one-handed weapons like swords, axes, and maces.', created_at: now, updated_at: now },
      { name: 'Thrown Weapon', category: 'MARTIAL', description: 'Proficiency with thrown weapons like javelins, knives, and axes.', created_at: now, updated_at: now }
    ];

    // Supernatural Abilities
    const supernaturalAbilities = [
      { name: 'Animal Ken', category: 'SUPERNATURAL', description: 'The supernatural ability to communicate with and understand animals.', created_at: now, updated_at: now },
      { name: 'Dowsing', category: 'SUPERNATURAL', description: 'The ability to locate water, metals, or other hidden things.', created_at: now, updated_at: now },
      { name: 'Enchanting Music', category: 'SUPERNATURAL', description: 'The ability to create music with magical effects.', created_at: now, updated_at: now },
      { name: 'Entrancement', category: 'SUPERNATURAL', description: 'The ability to hypnotize or entrance others through eye contact.', created_at: now, updated_at: now },
      { name: 'Magic Sensitivity', category: 'SUPERNATURAL', description: 'The ability to sense and identify magic.', created_at: now, updated_at: now },
      { name: 'Premonitions', category: 'SUPERNATURAL', description: 'The ability to receive visions or feelings about the future.', created_at: now, updated_at: now },
      { name: 'Second Sight', category: 'SUPERNATURAL', description: 'The ability to see through illusions and perceive the supernatural.', created_at: now, updated_at: now },
      { name: 'Sense Holiness and Unholiness', category: 'SUPERNATURAL', description: 'The ability to detect divine and infernal powers.', created_at: now, updated_at: now },
      { name: 'Shapeshifter', category: 'SUPERNATURAL', description: 'The ability to change one\'s physical form into that of an animal.', created_at: now, updated_at: now },
      { name: 'Wilderness Sense', category: 'SUPERNATURAL', description: 'Supernatural awareness and intuition when in natural environments.', created_at: now, updated_at: now }
    ];

    // Arcane Abilities
    const arcaneAbilities = [
      { name: 'Code of Hermes', category: 'ARCANE', description: 'Knowledge of the laws that govern the Order of Hermes.', created_at: now, updated_at: now },
      { name: 'Dominion Lore', category: 'ARCANE', description: 'Knowledge of the Divine realm and its denizens.', created_at: now, updated_at: now },
      { name: 'Faerie Lore', category: 'ARCANE', description: 'Knowledge of faeries and the Faerie realm.', created_at: now, updated_at: now },
      { name: 'Finesse', category: 'ARCANE', description: 'The ability to control magic with precision.', created_at: now, updated_at: now },
      { name: 'Infernal Lore', category: 'ARCANE', description: 'Knowledge of demons and the Infernal realm.', created_at: now, updated_at: now },
      { name: 'Magic Lore', category: 'ARCANE', description: 'Knowledge of magical traditions outside the Order of Hermes.', created_at: now, updated_at: now },
      { name: 'Magic Realm Lore', category: 'ARCANE', description: 'Knowledge of the Magic realm and its inhabitants.', created_at: now, updated_at: now },
      { name: 'Magic Theory', category: 'ARCANE', description: 'The theoretical understanding of Hermetic magic.', created_at: now, updated_at: now },
      { name: 'Organization Lore', category: 'ARCANE', description: 'Knowledge of specific magical or mystical organizations.', created_at: now, updated_at: now },
      { name: 'Parma Magica', category: 'ARCANE', description: 'The ability to resist magic, taught only to magi of the Order of Hermes.', created_at: now, updated_at: now },
      { name: 'Penetration', category: 'ARCANE', description: 'The ability to overcome magical resistance.', created_at: now, updated_at: now }
    ];

    // Combine all abilities
    const allAbilities = [
      ...generalAbilities,
      ...academicAbilities,
      ...languageAbilities,
      ...martialAbilities,
      ...supernaturalAbilities,
      ...arcaneAbilities
    ];

    // Insert all abilities into the database
    await queryInterface.bulkInsert('reference_abilities', allAbilities, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reference_abilities', null, {});
  }
};