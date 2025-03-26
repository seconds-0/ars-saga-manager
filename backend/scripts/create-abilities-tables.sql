-- Create enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reference_abilities_category') THEN
    CREATE TYPE "enum_reference_abilities_category" AS ENUM ('GENERAL', 'ACADEMIC', 'MARTIAL', 'SUPERNATURAL', 'ARCANE');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_character_abilities_category') THEN
    CREATE TYPE "enum_character_abilities_category" AS ENUM ('GENERAL', 'ACADEMIC', 'MARTIAL', 'SUPERNATURAL', 'ARCANE');
  END IF;
END$$;

-- Create reference_abilities table
CREATE TABLE IF NOT EXISTS "reference_abilities" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "category" "enum_reference_abilities_category" NOT NULL,
  "description" TEXT,
  "puissant_allowed" BOOLEAN NOT NULL DEFAULT TRUE,
  "affinity_allowed" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create character_abilities table
CREATE TABLE IF NOT EXISTS "character_abilities" (
  "id" SERIAL PRIMARY KEY,
  "character_id" INTEGER NOT NULL REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "ability_name" VARCHAR(255) NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "specialty" VARCHAR(255),
  "category" "enum_character_abilities_category" NOT NULL,
  "experience_points" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_character_abilities_character_id" ON "character_abilities" ("character_id");
CREATE INDEX IF NOT EXISTS "idx_character_abilities_ability_name" ON "character_abilities" ("ability_name");
CREATE INDEX IF NOT EXISTS "idx_reference_abilities_name" ON "reference_abilities" ("name");
CREATE INDEX IF NOT EXISTS "idx_reference_abilities_category" ON "reference_abilities" ("category");

-- Insert seed data for reference abilities
INSERT INTO "reference_abilities" ("name", "category", "description", "created_at", "updated_at")
VALUES
  -- General Abilities
  ('Animal Handling', 'GENERAL', 'The ability to train, control, and care for animals.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Athletics', 'GENERAL', 'Physical fitness and training for sports, running, jumping, and swimming.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Awareness', 'GENERAL', 'The ability to notice things, be aware of your surroundings, and detect unusual details.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Bargain', 'GENERAL', 'The skill of haggling and negotiating prices and transactions.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Brawl', 'GENERAL', 'Fighting unarmed or with improvised weapons in informal combat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Carouse', 'GENERAL', 'The ability to socialize while drinking heavily without suffering ill effects.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Charm', 'GENERAL', 'The ability to make a good impression and convince others to like you.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Chirurgy', 'GENERAL', 'The practice of medieval medicine and surgery.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Concentration', 'GENERAL', 'The ability to focus on a task despite distractions.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Craft', 'GENERAL', 'The ability to make and repair objects by hand.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Etiquette', 'GENERAL', 'Knowledge of proper behavior in social situations.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Folk Ken', 'GENERAL', 'The ability to understand people and their motivations.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Guile', 'GENERAL', 'The ability to lie convincingly and mislead others.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Hunt', 'GENERAL', 'The ability to track animals, set traps, and obtain food from the wilderness.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Leadership', 'GENERAL', 'The ability to lead and inspire others.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Legerdemain', 'GENERAL', 'Sleight of hand, picking pockets, and fine manual dexterity.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Music', 'GENERAL', 'The ability to play musical instruments and sing.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Profession', 'GENERAL', 'Skill in a professional trade or occupation.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Ride', 'GENERAL', 'The ability to ride and control horses and other mounts.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Stealth', 'GENERAL', 'The ability to move quietly and remain hidden.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Survival', 'GENERAL', 'The ability to find food, water, and shelter in the wilderness.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Swim', 'GENERAL', 'The ability to stay afloat and move through water.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Academic Abilities
  ('Artes Liberales', 'ACADEMIC', 'Grammar, logic, rhetoric, arithmetic, geometry, astronomy, and music.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Civil and Canon Law', 'ACADEMIC', 'Knowledge of secular and Church law.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Common Law', 'ACADEMIC', 'Knowledge of local and customary laws and traditions.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Medicine', 'ACADEMIC', 'Formal academic medical knowledge, based on Galenic theory.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Philosophiae', 'ACADEMIC', 'Natural philosophy, moral philosophy, and metaphysics.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Theology', 'ACADEMIC', 'The formal study of religious doctrine and belief.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Languages (Academic)
  ('Latin', 'ACADEMIC', 'The language of scholars, the Church, and international communication.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Arabic', 'ACADEMIC', 'The language of the Islamic world and much ancient knowledge.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Greek', 'ACADEMIC', 'The language of the Eastern Roman Empire and ancient philosophers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Hebrew', 'ACADEMIC', 'The sacred language of Judaism.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('English', 'ACADEMIC', 'The language of England.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('French', 'ACADEMIC', 'The language of France and the nobility of England.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('German', 'ACADEMIC', 'The language of the Holy Roman Empire.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Italian', 'ACADEMIC', 'The language of Italy.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Spanish', 'ACADEMIC', 'The language of Spain.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Martial Abilities
  ('Bow', 'MARTIAL', 'Proficiency with bows, including shortbows and longbows.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Crossbow', 'MARTIAL', 'Proficiency with crossbows.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Great Weapon', 'MARTIAL', 'Proficiency with large two-handed weapons like greatswords and polearms.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Single Weapon', 'MARTIAL', 'Proficiency with one-handed weapons like swords, axes, and maces.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Thrown Weapon', 'MARTIAL', 'Proficiency with thrown weapons like javelins, knives, and axes.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Supernatural Abilities
  ('Dowsing', 'SUPERNATURAL', 'The ability to locate water, metals, or other hidden things.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Enchanting Music', 'SUPERNATURAL', 'The ability to create music with magical effects.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Magic Sensitivity', 'SUPERNATURAL', 'The ability to sense and identify magic.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Premonitions', 'SUPERNATURAL', 'The ability to receive visions or feelings about the future.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Second Sight', 'SUPERNATURAL', 'The ability to see through illusions and perceive the supernatural.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Sense Holiness and Unholiness', 'SUPERNATURAL', 'The ability to detect divine and infernal powers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Arcane Abilities
  ('Code of Hermes', 'ARCANE', 'Knowledge of the laws that govern the Order of Hermes.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Dominion Lore', 'ARCANE', 'Knowledge of the Divine realm and its denizens.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Faerie Lore', 'ARCANE', 'Knowledge of faeries and the Faerie realm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Finesse', 'ARCANE', 'The ability to control magic with precision.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Infernal Lore', 'ARCANE', 'Knowledge of demons and the Infernal realm.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Magic Lore', 'ARCANE', 'Knowledge of magical traditions outside the Order of Hermes.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Magic Theory', 'ARCANE', 'The theoretical understanding of Hermetic magic.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Parma Magica', 'ARCANE', 'The ability to resist magic, taught only to magi of the Order of Hermes.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Penetration', 'ARCANE', 'The ability to overcome magical resistance.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);