import React from "react";
import { loadMockTournamentCalendarData } from "@/components/screens/tournament-calendar.component.jsx";
import {
  docModuleLoaders as generatedDocModuleLoaders,
  generatedComponentLabEntries
} from "./generated-entry-registry";
import { componentModuleLoaders as generatedComponentModuleLoaders } from "./generated-component-loaders";

const noop = () => {};

const previewNone = {
  strategy: "none",
  exportName: "default",
  fixedProps: {},
  initialProps: {},
  controls: [],
  presets: []
};

const sampleCardState = {
  uid: "component-lab-card",
  id: 46986414,
  name: "Dark Magician",
  position: "FaceUpAttack",
  location: "MZONE",
  index: 0,
  controller: 0
};

const sampleCardInfo = {
  id: 46986414,
  name: "Dark Magician",
  desc: "The ultimate wizard in terms of attack and defense.",
  type: 33,
  race: 2,
  attribute: 32,
  level: 7,
  atk: 2500,
  def: 2100
};

const manualComponentLabEntries = [
  {
    id: "foundations/typography",
    group: "foundations",
    fileName: "typography-preview.jsx",
    fileBaseName: "typography",
    sourcePath: "server/ui/component-lab/foundations/typography-preview.jsx",
    importPath: "@/component-lab/foundations/typography-preview.jsx"
  },
  {
    id: "foundations/grid-mechanics",
    group: "foundations",
    fileName: "grid-mechanics-preview.jsx",
    fileBaseName: "grid-mechanics",
    sourcePath: "server/ui/component-lab/foundations/grid-mechanics-preview.jsx",
    importPath: "@/component-lab/foundations/grid-mechanics-preview.jsx"
  }
];

const manualDocModuleLoaders = {
  "foundations/typography": () => import("@/component-lab/docs/foundations/typography.mdx"),
  "foundations/grid-mechanics": () => import("@/component-lab/docs/foundations/grid-mechanics.mdx")
};

const manualComponentModuleLoaders = {
  "foundations/typography": () => import("@/component-lab/foundations/typography-preview.jsx"),
  "foundations/grid-mechanics": () => import("@/component-lab/foundations/grid-mechanics-preview.jsx")
};

const previewOverrides = {
  "common/card.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {
      state: sampleCardState
    },
    presets: [
      {
        label: "Monster zone",
        props: {
          state: sampleCardState
        }
      },
      {
        label: "Facedown hand",
        props: {
          state: {
            ...sampleCardState,
            uid: "component-lab-card-facedown",
            id: "unknown",
            position: "FaceDownDefence",
            location: "HAND"
          }
        }
      }
    ]
  },
  "common/faq.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {
      list: [
        {
          group: "Component Lab Basics",
          questions: [
            {
              question: "What does this preview show?",
              answer: "A standalone FAQ group rendered with live props from the control panel."
            },
            {
              question: "Why use MDX docs?",
              answer: "So the page can mix narrative guidance, code snippets, and implementation notes."
            }
          ]
        }
      ]
    },
    presets: [
      {
        label: "Single group",
        props: {
          list: [
            {
              group: "Component Lab Basics",
              questions: [
                {
                  question: "What does this preview show?",
                  answer: "A standalone FAQ group rendered with live props from the control panel."
                }
              ]
            }
          ]
        }
      },
      {
        label: "Two groups",
        props: {
          list: [
            {
              group: "Usage",
              questions: [
                {
                  question: "Where is this used?",
                  answer: "The FAQs and downloads screens reuse this shared renderer."
                }
              ]
            },
            {
              group: "Authoring",
              questions: [
                {
                  question: "What changes most often?",
                  answer: "The shape and ordering of the incoming content list."
                }
              ]
            }
          ]
        }
      }
    ]
  },
  "common/loading.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {
      title: "Loading Duel Data",
      message: "Please wait while the room reconnects.",
      fullscreen: false
    },
    presets: [
      {
        label: "Inline",
        props: {
          title: "Loading Duel Data",
          message: "Please wait while the room reconnects.",
          fullscreen: false
        }
      },
      {
        label: "Fullscreen",
        props: {
          title: "Preparing Component Lab",
          message: "This is the full-screen variant used for blocking states.",
          fullscreen: true
        }
      }
    ]
  },
  "screens/contact.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "Default form",
        props: {}
      }
    ]
  },
  "screens/credits.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "Default credits",
        props: {}
      }
    ]
  },
  "screens/downloads.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "Default downloads",
        props: {}
      }
    ]
  },
  "screens/faqs.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "Default FAQs",
        props: {}
      }
    ]
  },
  "screens/login.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "Default login",
        props: {}
      }
    ]
  },
  "screens/superheader.component": {
    strategy: "default",
    exportName: "default",
    initialProps: {
      loggedInOverride: false
    },
    controls: [
      {
        type: "boolean",
        prop: "loggedInOverride",
        label: "Logged in"
      }
    ],
    presets: [
      {
        label: "Logged out",
        props: {
          loggedInOverride: false
        }
      },
      {
        label: "Logged in",
        props: {
          loggedInOverride: true
        }
      }
    ]
  },
  "screens/tournament-calendar.component": {
    strategy: "default",
    exportName: "default",
    fixedProps: {
      loadTournaments: loadMockTournamentCalendarData
    },
    initialProps: {
      initialCalendarDate: {
        year: 2026,
        month: 3,
        day: 4
      }
    },
    presets: [
      {
        label: "April 2026",
        props: {
          initialCalendarDate: {
            year: 2026,
            month: 3,
            day: 4
          }
        }
      },
      {
        label: "Tournament weekend",
        props: {
          initialCalendarDate: {
            year: 2026,
            month: 6,
            day: 18
          }
        }
      }
    ]
  },
  "screens/screen": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    fixedProps: {
      children: (
        <section className="component-lab-screen-child">
          <h3>Injected Child Content</h3>
          <p>The screen wrapper simply returns its children unchanged.</p>
        </section>
      )
    },
    presets: [
      {
        label: "Wrapped child",
        props: {}
      }
    ]
  },
  "foundations/typography": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "Audit view",
        props: {}
      }
    ]
  },
  "foundations/grid-mechanics": {
    strategy: "default",
    exportName: "default",
    initialProps: {},
    presets: [
      {
        label: "System view",
        props: {}
      }
    ]
  },
  "duel/announce.card.component": {
    strategy: "named",
    exportName: "AnnounceCardDialogView",
    initialProps: {
      state: {
        active: true,
        query: "Dark",
        selectedCode: 46986414
      },
      options: [
        {
          code: 46986414,
          label: "Dark Magician [46986414]"
        },
        {
          code: 38033121,
          label: "Dark Magician Girl [38033121]"
        }
      ]
    },
    fixedProps: {
      onQueryChange: noop,
      onSelectOption: noop,
      onSubmit: noop
    },
    presets: [
      {
        label: "Populated",
        props: {
          state: {
            active: true,
            query: "Dark",
            selectedCode: 46986414
          },
          options: [
            {
              code: 46986414,
              label: "Dark Magician [46986414]"
            },
            {
              code: 38033121,
              label: "Dark Magician Girl [38033121]"
            }
          ]
        }
      },
      {
        label: "Empty state",
        props: {
          state: {
            active: true,
            query: "No match",
            selectedCode: undefined
          },
          options: []
        }
      }
    ]
  },
  "duel/anouncement.component": {
    strategy: "named",
    exportName: "FlasherView",
    initialProps: {
      state: {
        active: true,
        id: 46986414,
        mode: "legacy_preview"
      }
    },
    presets: [
      {
        label: "Default flash",
        props: {
          state: {
            active: true,
            id: 46986414,
            mode: "legacy_preview"
          }
        }
      },
      {
        label: "Anchored flash",
        props: {
          state: {
            active: true,
            id: 46986414,
            mode: "chain",
            sourceAnchor: {
              x: 180,
              y: 120
            }
          }
        }
      }
    ]
  },
  "duel/attack.animation.component": {
    strategy: "named",
    exportName: "AttackAnimationLayerView",
    initialProps: {
      state: {
        active: true,
        stage: "travel",
        from: {
          x: 120,
          y: 220
        },
        to: {
          x: 420,
          y: 140
        }
      }
    },
    presets: [
      {
        label: "Travel",
        props: {
          state: {
            active: true,
            stage: "travel",
            from: {
              x: 120,
              y: 220
            },
            to: {
              x: 420,
              y: 140
            }
          }
        }
      }
    ]
  },
  "duel/attribute.component": {
    strategy: "named",
    exportName: "SelectAttributesView",
    initialProps: {
      state: {
        active: true,
        required: 1,
        available: ["LIGHT", "DARK", "FIRE"],
        selected: ["DARK"]
      }
    },
    fixedProps: {
      onChange: noop,
      onSubmit: noop
    },
    presets: [
      {
        label: "Single select",
        props: {
          state: {
            active: true,
            required: 1,
            available: ["LIGHT", "DARK", "FIRE"],
            selected: ["DARK"]
          }
        }
      },
      {
        label: "Multiple select",
        props: {
          state: {
            active: true,
            required: 2,
            available: ["EARTH", "WATER", "FIRE", "WIND"],
            selected: ["WATER", "FIRE"]
          }
        }
      }
    ]
  },
  "duel/cardinfo.component": {
    strategy: "named",
    exportName: "CardInfoView",
    initialProps: {
      id: 46986414,
      info: sampleCardInfo
    },
    presets: [
      {
        label: "Monster card",
        props: {
          id: 46986414,
          info: sampleCardInfo
        }
      }
    ]
  },
  "duel/choice.component": {
    strategy: "named",
    exportName: "ChoiceRpsLoopPreview",
    initialProps: {
      promptDurationMs: 1400,
      resultDurationMs: 1800
    },
    presets: [
      {
        label: "Looping RPS",
        props: {
          promptDurationMs: 1400,
          resultDurationMs: 1800
        }
      },
      {
        label: "Faster loop",
        props: {
          promptDurationMs: 900,
          resultDurationMs: 1200
        }
      }
    ]
  },
  "duel/field.reveal.component": {
    strategy: "named",
    exportName: "FieldRevealOverlayView",
    initialProps: {
      state: {
        active: true,
        mode: "panel",
        stage: "open",
        cards: [
          {
            id: 46986414,
            name: "Dark Magician",
            uid: "field-reveal-1"
          },
          {
            id: 38033121,
            name: "Dark Magician Girl",
            uid: "field-reveal-2"
          }
        ],
        placements: [
          {
            x: 220,
            y: 180,
            offsetX: -50,
            offsetY: 0,
            rotation: -6
          },
          {
            x: 220,
            y: 180,
            offsetX: 50,
            offsetY: 0,
            rotation: 6
          }
        ]
      }
    },
    presets: [
      {
        label: "Two-card reveal",
        props: {
          state: {
            active: true,
            mode: "panel",
            stage: "open",
            cards: [
              {
                id: 46986414,
                name: "Dark Magician",
                uid: "field-reveal-1"
              },
              {
                id: 38033121,
                name: "Dark Magician Girl",
                uid: "field-reveal-2"
              }
            ],
            placements: [
              {
                x: 220,
                y: 180,
                offsetX: -50,
                offsetY: 0,
                rotation: -6
              },
              {
                x: 220,
                y: 180,
                offsetX: 50,
                offsetY: 0,
                rotation: 6
              }
            ]
          }
        }
      }
    ]
  },
  "duel/lifepoint.component": {
    strategy: "named",
    exportName: "LifepointDisplayView",
    initialProps: {
      state: {
        lifepoints: [8000, 4200],
        turn: 3,
        names: ["Alice", "Bob"],
        lpDeltas: {
          0: undefined,
          1: {
            value: -3800,
            tone: "damage",
            token: 1
          }
        },
        playerHints: {
          0: ["Main Phase 1"],
          1: ["Chain available"]
        },
        maxLifepoints: 8000
      }
    },
    presets: [
      {
        label: "Damage window",
        props: {
          state: {
            lifepoints: [8000, 4200],
            turn: 3,
            names: ["Alice", "Bob"],
            lpDeltas: {
              0: undefined,
              1: {
                value: -3800,
                tone: "damage",
                token: 1
              }
            },
            playerHints: {
              0: ["Main Phase 1"],
              1: ["Chain available"]
            },
            maxLifepoints: 8000
          }
        }
      }
    ]
  },
  "duel/phase.banner.component": {
    strategy: "named",
    exportName: "PhaseBannerView",
    initialProps: {
      active: true,
      text: "Draw Phase",
      token: 1
    },
    presets: [
      {
        label: "Draw phase",
        props: {
          active: true,
          text: "Draw Phase",
          token: 1
        }
      },
      {
        label: "Battle phase",
        props: {
          active: true,
          text: "Battle Phase",
          token: 2
        }
      }
    ]
  },
  "duel/position.component": {
    strategy: "named",
    exportName: "SelectPositionView",
    initialProps: {
      state: {
        active: true,
        cards: [
          {
            id: 46986414,
            position: "FaceUpAttack"
          },
          {
            id: 46986414,
            position: "FaceDownDefence"
          }
        ]
      }
    },
    fixedProps: {
      onSelect: noop
    },
    presets: [
      {
        label: "Two positions",
        props: {
          state: {
            active: true,
            cards: [
              {
                id: 46986414,
                position: "FaceUpAttack"
              },
              {
                id: 46986414,
                position: "FaceDownDefence"
              }
            ]
          }
        }
      }
    ]
  },
  "duel/select.option.component": {
    strategy: "named",
    exportName: "SelectOptionDialogView",
    initialProps: {
      state: {
        active: true,
        selectedIndex: 1,
        options: [
          {
            i: 0,
            label: "Destroy all monsters"
          },
          {
            i: 1,
            label: "Destroy all spells and traps"
          }
        ]
      }
    },
    fixedProps: {
      onChange: noop,
      onSubmit: noop
    },
    presets: [
      {
        label: "Two options",
        props: {
          state: {
            active: true,
            selectedIndex: 1,
            options: [
              {
                i: 0,
                label: "Destroy all monsters"
              },
              {
                i: 1,
                label: "Destroy all spells and traps"
              }
            ]
          }
        }
      }
    ]
  },
  "duel/view_decks.component": {
    strategy: "named",
    exportName: "DeckDialogView",
    initialProps: {
      state: {
        active: true,
        deck: [
          {
            id: 46986414,
            uid: "view-deck-1",
            selected: true
          },
          {
            id: 38033121,
            uid: "view-deck-2",
            actionable: true
          }
        ]
      }
    },
    fixedProps: {
      onCardClick: noop
    },
    presets: [
      {
        label: "Two cards",
        props: {
          state: {
            active: true,
            deck: [
              {
                id: 46986414,
                uid: "view-deck-1",
                selected: true
              },
              {
                id: 38033121,
                uid: "view-deck-2",
                actionable: true
              }
            ]
          }
        }
      }
    ]
  },
  "duel/yesno.component": {
    strategy: "named",
    exportName: "YesNoDialogView",
    initialProps: {
      state: {
        active: true,
        promptText: "Activate Dark Magical Circle?",
        yesLabel: "Chain",
        noLabel: "Pass"
      }
    },
    fixedProps: {
      onSelect: noop
    },
    presets: [
      {
        label: "Prompt",
        props: {
          state: {
            active: true,
            promptText: "Activate Dark Magical Circle?",
            yesLabel: "Chain",
            noLabel: "Pass"
          }
        }
      }
    ]
  }
};

const documentationImportOverrides = {
  "duel/choice.component": "import { ChoiceScreen } from '@/components/duel/choice.component.jsx';",
  "duel/controls.component": "import { ControlButtons } from '@/components/duel/controls.component.jsx';",
  "duel/duel.component": "import { DuelScreen } from '@/components/duel/duel.component.jsx';",
  "duel/lobby.component": "import { LobbyScreen } from '@/components/duel/lobby.component.jsx';",
  "duel/sidedeck.component": "import { SideDeckEditScreen } from '@/components/duel/sidedeck.component.jsx';",
  "foundations/typography": "import TypographyPreview from '@/component-lab/foundations/typography-preview.jsx';",
  "foundations/grid-mechanics": "import GridMechanicsPreview from '@/component-lab/foundations/grid-mechanics-preview.jsx';"
};

const titleOverrides = {
  "duel/choice.component": "RPS"
};

const summaryOverrides = {
  "duel/choice.component": "Interactive notes and preview harness for the rock-paper-scissors opening flow.",
  "foundations/typography": "Audit the active font stacks, heading treatments, metadata labels, and legacy exceptions used across the UI.",
  "foundations/grid-mechanics": "Inspect the recurring grid templates, auto-fit collections, and responsive collapse rules used by the application."
};

const previewableGroups = new Set(["common", "screens"]);
const docsOnlyIds = new Set([
  "screens/deckedit.component",
  "screens/news-article.component",
  "screens/profile.component",
  "screens/tournament-detail.component",
  "duel/randomization_test"
]);

function toSentenceCase(value) {
  return value
    .replace(/\.component$/, "")
    .split(/[.-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getDefaultPreview(entry) {
  if (docsOnlyIds.has(entry.id)) {
    return previewNone;
  }

  if (previewableGroups.has(entry.group)) {
    return {
      strategy: "default",
      exportName: "default",
      fixedProps: {},
      initialProps: {},
      controls: [],
      presets: [
        {
          label: "Default",
          props: {}
        }
      ]
    };
  }

  return previewNone;
}

function mergePreview(basePreview, overridePreview = {}) {
  return {
    ...basePreview,
    ...overridePreview,
    fixedProps: {
      ...(basePreview.fixedProps || {}),
      ...(overridePreview.fixedProps || {})
    },
    initialProps: overridePreview.initialProps || basePreview.initialProps || {},
    controls: overridePreview.controls || basePreview.controls || [],
    presets: overridePreview.presets || basePreview.presets || []
  };
}

const docModuleLoaders = {
  ...generatedDocModuleLoaders,
  ...manualDocModuleLoaders
};

export const componentModuleLoaders = {
  ...generatedComponentModuleLoaders,
  ...manualComponentModuleLoaders
};

const sourceComponentLabEntries = [
  ...generatedComponentLabEntries,
  ...manualComponentLabEntries
];

export const componentLabEntries = sourceComponentLabEntries.map((entry) => {
  const preview = mergePreview(getDefaultPreview(entry), previewOverrides[entry.id]);
  const documentationImportStatement = documentationImportOverrides[entry.id]
    || `import Component from '${entry.importPath}';`;

  return {
    ...entry,
    title: titleOverrides[entry.id] || toSentenceCase(entry.fileBaseName),
    summary: summaryOverrides[entry.id] || `Interactive notes and preview harness for ${toSentenceCase(entry.fileBaseName)}.`,
    routePath: `/playwright/components/${entry.group}/${entry.fileBaseName}`,
    preview,
    documentationImportStatement
  };
});

export const componentLabEntriesById = Object.fromEntries(componentLabEntries.map((entry) => [entry.id, entry]));

export function getComponentLabEntryById(id) {
  return componentLabEntriesById[id];
}

export function getComponentLabEntryFromSlug(slug = []) {
  if (!Array.isArray(slug) || slug.length !== 2) {
    return undefined;
  }

  return getComponentLabEntryById(`${slug[0]}/${slug[1]}`);
}

export function loadComponentLabDocModule(id) {
  return docModuleLoaders[id]?.();
}

export function getComponentLabGroupEntries(group) {
  return componentLabEntries.filter((entry) => entry.group === group);
}

export const componentLabPreviewReadyCount = componentLabEntries.filter((entry) => entry.preview.strategy !== "none").length;
