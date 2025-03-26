'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const virtuesAndFlaws = [
      {
        type: "Virtue",
        size: "Major",
        category: "Hermetic",
        realm: "None",
        name: "Flexible Formulaic Magic",
        description: "You can vary the effects of formulaic spells to a slight degree, while still getting the benefits of casting known magic. You may raise or lower the casting level of the spell by five to raise or lower one (only) of Range, Duration, and Target by one step, as long as this does not violate any of the normal limits on formulaic magic. Casting success, fatigue loss, and Penetration are all calculated based on the casting level of the spell. You cannot manipulate Ritual magic in this way.",
        max_selections: null,
        prerequisites: null,
        incompatibilities: null,
        effects: null,
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Major"]),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: "Virtue",
        size: "Minor",
        category: "General",
        realm: "None",
        name: "Free Expression",
        description: "You have the imagination and creativity needed to compose a new ballad or to paint an original picture, and have the potential to be a great artist. You get a +3 bonus on all rolls to create a new work of art.",
        max_selections: null,
        prerequisites: null,
        incompatibilities: null,
        effects: null,
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: "Virtue",
        size: "Minor",
        category: "Hermetic",
        realm: "None",
        name: "Free Study",
        description: "You are better at figuring things out for yourself than you are at poring over books. Add +3 to rolls when studying from raw vis.",
        max_selections: null,
        prerequisites: null,
        incompatibilities: null,
        effects: null,
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: "Virtue",
        size: "Major",
        category: "Hermetic",
        realm: "None",
        name: "Gentle Gift",
        description: "Unlike other magi, whose Magical nature disturbs normal people and animals, your Gift is subtle and quiet. You don't suffer the usual penalties when interacting with people and animals.",
        max_selections: null,
        prerequisites: null,
        incompatibilities: null,
        effects: null,
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Major"]),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: "Virtue",
        size: "Minor",
        category: "Social",
        realm: "None",
        name: "Gentleman/woman",
        description: "You are a minor member (possibly illegitimate) of a noble family. You do not stand to inherit from your relatives, but are still treated as one of their own and may be addressed as Lord or Lady. You probably reside near the covenant with your relatives. Although you do not want for anything, you have no vast wealth of your own. You may occasionally ask your family to buy expensive equipment for you, but you will need a convincing rationale. You are expected to wait on your relations much of the time or you will lose the benefits of family (though you will keep your social standing if you can otherwise maintain your normal lifestyle). The Wealthy Virtue and Poor Flaw affect you normally. This Virtue is available to male and female characters.",
        max_selections: null,
        prerequisites: null,
        incompatibilities: null,
        effects: null,
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('reference_virtues_flaws', virtuesAndFlaws, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reference_virtues_flaws', null, {});
  }
};