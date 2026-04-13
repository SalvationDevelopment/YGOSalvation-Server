import { League } from "@/models/League";

const defaultLeagues = [
  {
    slug: "tcg-modern-ranked",
    name: "TCG Modern",
    description: "Modern TCG tournament league with ranked support.",
    ranked: true,
    supportedFormats: ["Swiss", "Single Elimination"],
    roomConfiguration: {
      ruleset: "TCG Modern",
      duelMode: "Match",
      banlist: "Modern",
      automation: "Automatic"
    }
  },
  {
    slug: "ocg-modern-ranked",
    name: "OCG Modern",
    description: "Modern OCG tournament league with ranked support.",
    ranked: true,
    supportedFormats: ["Swiss", "Single Elimination"],
    roomConfiguration: {
      ruleset: "OCG Modern",
      duelMode: "Match",
      banlist: "Modern",
      automation: "Automatic"
    }
  },
  {
    slug: "goat-locked",
    name: "Goat Locked",
    description: "Historical locked-format league.",
    ranked: false,
    supportedFormats: ["Swiss", "Single Elimination"],
    roomConfiguration: {
      ruleset: "Goat Locked",
      duelMode: "Match",
      banlist: "April 2005",
      automation: "Automatic"
    }
  }
];

let leaguesBootstrapped = false;

/**
 * Executes the ensure default leagues helper used by the tournament bootstrap module.
 * @returns {Promise<void>} Resolves when the tournament bootstrap operation completes.
 */
export async function ensureDefaultLeagues() {
  if (leaguesBootstrapped) {
    return;
  }

  for (const league of defaultLeagues) {
    await League.updateOne(
      { slug: league.slug },
      { $setOnInsert: league },
      { upsert: true }
    );
  }

  leaguesBootstrapped = true;
}

