'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const flaws = [
      {
        type: "Flaw",
        size: "Minor",
        category: "General",
        realm: "None",
        name: "Ability Block",
        description: "You are completely unable to learn a certain class of Abilities, for some reason. This may be Martial Abilities, or a more limited set of the others. A profound inability to master logic would rule out Artes Liberales, Philosophiae, any Law, Medicine, and Theology. Alternatively, you might be unable to learn any languages other than your native tongue. It must be possible for your character to learn the abilities in question, but she need have no intention of doing so. You may only take this Flaw once.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        max_selections: 1,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Minor",
        category: "General",
        realm: "None",
        name: "Afflicted Tongue",
        description: "You have a speech impediment, such as a lisp, stutter, or missing teeth. You suffer a –2 to all rolls involving the voice. If you are a magus, you must also roll an extra botch die when casting a spell using words.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Major",
        category: "Supernatural",
        realm: "None",
        name: "Age Quickly",
        description: "Probably due to a curse or a magical disaster, you age twice as fast as normal people. Your effective age (which applies as if it were your actual age when creating a Longevity Ritual, and when making rolls on the Aging table) increases two years for every year that passes, and you make two aging rolls each year. There is no way to halt or slow this other than Longevity Rituals.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Major"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Minor",
        category: "Personality",
        realm: "None",
        name: "Ambitious",
        description: "You want to be the most successful or powerful person in the world in some respect. You will not be distracted into doing things that do not contribute to your ambition, and are very eager to do things that advance it.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor", "Major"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Minor",
        category: "Story",
        realm: "None",
        name: "Animal Companion",
        description: "You are accompanied by a loyal, intelligent (but mundane) animal that can obey simple commands. Your relationship with it is very close. If it should die, you would be profoundly upset.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Minor",
        category: "General",
        realm: "None",
        name: "Arthritis",
        description: "Your joints are stiff and often painful, making almost any prolonged movement difficult. You are at –3 to rolls involving repetitive movement, sustained over time. Occasionally, the pain is so great that you are seriously disabled. On any movement or combat botch, one of your joints may \"lock up,\" making the limb effectively useless (–6 to all rolls involving it) until you have a chance to rest it for a day or two.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Minor",
        category: "Personality",
        realm: "None",
        name: "Avaricious",
        description: "You want money, lots of money. When you have it, you do not spend it, but hoard it so that you can count it. You can be avaricious about physical things other than money, such as books or raw vis. In this case, you do not use the things you hoard, nor do you allow others to use them.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor", "Major"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Major",
        category: "Story",
        realm: "None",
        name: "Black Sheep",
        description: "You come from a prestigious family, but you have somehow estranged yourself from your relatives. They have nothing to do with you, unless they wish to punish you somehow or make use of you. Those who resent your family's power can take safe revenge by assaulting you. You begin the game with a bad Reputation of your choice at level 2, among those who respect your family.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Major"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Minor",
        category: "Story",
        realm: "None",
        name: "Blackmail",
        description: "You have information that some powerful person would prefer kept hidden. You receive payments or services in return for your silence, and you may occasionally demand special favors. Don't push your luck — your victim may decide it isn't worth the cost, or silence you permanently. This benefit has a yearly value of about 50 silver pennies, possibly more if you keep the pressure on. You should detail and record the specifics of this arrangement.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Minor"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type: "Flaw",
        size: "Major",
        category: "Hermetic",
        realm: "None",
        name: "Blatant Gift",
        description: "People immediately realize that there is something strange about you, even if they do not know you are a magus. Animals are extremely disturbed, frightened, and possibly enraged by your presence. You suffer a –6 penalty on all interaction rolls with normal people and animals, and should see page 75 for further discussion of this Flaw's effects.",
        source: "Core Rulebook",
        allowed_sizes: JSON.stringify(["Major"]),
        max_selections: null,
        prerequisites: JSON.stringify({}),
        incompatibilities: JSON.stringify([]),
        effects: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('reference_virtues_flaws', flaws, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reference_virtues_flaws', null, {});
  }
};