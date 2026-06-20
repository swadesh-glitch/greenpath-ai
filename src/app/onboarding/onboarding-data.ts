/**
 * onboarding-data.ts
 *
 * Static data and pure-function helpers for the onboarding questionnaire.
 * Extracted from onboarding/page.tsx to keep the page component focused on
 * state management and rendering logic only.
 *
 * Nothing here has side effects or imports React — safe to import in tests
 * without additional mocking.
 */

// ─────────────────────────────────────────────
// Loading screen phrases (cycling during AI generation)
// ─────────────────────────────────────────────

/** Phrases cycled every second during the AI profile generation loading screen. */
export const LOADING_PHRASES = [
  "Talking to Clover, your green guide...",
  "Looking at energy habits in your city...",
  "Creating your unique green character...",
  "Writing your personal nature story...",
  "Planning 3 fun green challenges for you...",
  "Building your future eco-friendly world...",
] as const

// ─────────────────────────────────────────────
// Conversational question text
// ─────────────────────────────────────────────

/**
 * Returns the question text Clover asks for each questionnaire step.
 *
 * @param index       - Current question index (0–5)
 * @param userNameVal - The name entered in step 0 (used in step 1 greeting)
 * @param cityVal     - Unused currently; reserved for future city-aware questions
 */
export function getQuestionText(
  index: number,
  userNameVal: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cityVal: string
): string {
  switch (index) {
    case 0:
      return "Welcome to GreenPath AI! I'm Clover, your friendly green guide. Let's start our eco-journey together. What is your name?"
    case 1:
      return `Nice to meet you, ${userNameVal}! What city or town do you live in?`
    case 2:
      return `Got it! How do you usually get around town?`
    case 3:
      return "What do you usually like to eat?"
    case 4:
      return "How do you like to shop for clothes, gadgets, or other items?"
    case 5:
      return "Lastly, how is your home powered and heated?"
    default:
      return ""
  }
}

// ─────────────────────────────────────────────
// Clover's reaction variant pools
// ─────────────────────────────────────────────

/**
 * Maps each option ID to a pool of 3 reaction lines Clover might say after
 * the user selects that option. A random line is picked at runtime so the
 * conversation feels slightly different on each playthrough.
 */
export const REACTION_VARIANTS: Record<string, string[]> = {
  gas_car: [
    "Got it! Driving a gas car is very common, and we can find some fun, simple ways to balance your travels together.",
    "Thanks for sharing! Let's explore how we can easily save fuel and energy on your journeys.",
    "Got it! Optimizing routes or sharing rides is a wonderful opportunity to make your trips feel even greener.",
  ],
  transit: [
    "Awesome! Taking the bus or train is a great way to save energy.",
    "Got it. Sharing rides keeps our city cleaner and less crowded.",
    "Smart. Riding public transit is a huge win for the environment.",
  ],
  walk_bike: [
    "Amazing! Walking or biking is the healthiest choice for you and the planet.",
    "Fantastic! Getting around on foot or wheels is as green as it gets.",
    "Great habit! Walking and cycling keep the air fresh and clean.",
  ],
  electric_car: [
    "Smart. Driving an electric car keeps tailpipe smoke out of our air.",
    "Excellent! Electric cars are clean and quiet.",
    "Got it. Electric driving is a wonderful way to keep city air clean.",
  ],
  meat_heavy: [
    "Thanks for sharing! Even small adjustments, like trying one plant-based meal a week, make a wonderful difference.",
    "Got it! We'll look at some super easy and tasty ways to explore delicious plant-based dishes.",
    "Perfect! Small, tasty steps make a big difference, and we can take them at your own comfortable pace.",
  ],
  balanced: [
    "A great balance! Mixing in more veggies is a wonderful, healthy choice.",
    "Got it. A healthy mix of foods is great for you and nature.",
    "Balanced! Every veggie meal helps save water and land.",
  ],
  vegetarian: [
    "Wonderful! A vegetarian diet is a major help to land and water.",
    "Great habit! Eating vegetarian is a powerful way to help nature.",
    "Awesome! Putting plants first does wonders for the earth.",
  ],
  vegan: [
    "Spectacular! A fully plant-based diet is incredibly kind to the earth.",
    "Amazing! Going vegan is one of the best ways to care for the environment.",
    "Exceptional! You're making a massive positive impact with your food.",
  ],
  minimalist: [
    "Wonderful! Buying only what you need is the best way to reduce waste.",
    "Superb! Buying less is a super simple way to help the planet.",
    "Outstanding! Choosing not to buy extra stuff keeps landfills empty.",
  ],
  conscious: [
    "Fantastic! Choosing eco-friendly items supports greener companies.",
    "Smart! Supporting sustainable brands helps everyone make better products.",
    "Great! Buying from green brands encourages clean production.",
  ],
  frequent: [
    "Got it! Shopping often is a great chance to discover pre-loved treasures or choose green packaging options.",
    "I appreciate you sharing! We'll explore fun, creative ways to reuse, upcycle, and find eco-friendly brands.",
    "Got it! We can find some cool ways to make your regular shopping trips even more earth-friendly.",
  ],
  smart_home: [
    "Excellent! Smart devices are great at saving power automatically.",
    "Very smart! Thermostats and smart meters stop power waste before it starts.",
    "Got it. Letting smart tech handle your power is a major help.",
  ],
  solar: [
    "Superb! You are making your own clean sunshine power.",
    "Incredible! Solar panels are a brilliant way to power your home.",
    "Phenomenal! You're using clean, endless energy from the sun.",
  ],
  standard: [
    "Understood. Most homes use standard power, and we can find simple ways to save.",
    "Got it. We'll look at easy habits to lower your monthly power bills.",
    "Standard power logged. Let's see how simple habits can save electricity.",
  ],
  high_ac: [
    "Thanks for letting me know! Staying comfortable is key, and we can find simple tips to optimize your energy too.",
    "Got it! Let's explore some easy, cozy ways to keep you comfortable while saving power.",
    "Perfect! Let's find small, helpful habits to keep your home feeling great while lowering your energy footprint.",
  ],
}

// ─────────────────────────────────────────────
// Answer option definitions
// ─────────────────────────────────────────────

/** Options for the transport question (step 2). */
export const TRANSPORT_OPTIONS = [
  { id: "gas_car",      label: "Drive gas car alone",      desc: "Private gas vehicle" },
  { id: "transit",      label: "Take public transit",      desc: "Train, bus, or subway" },
  { id: "walk_bike",    label: "Walk or bike often",       desc: "Active transit lifestyle" },
  { id: "electric_car", label: "Drive electric car (EV)",  desc: "Zero exhaust EV" },
] as const

/** Options for the food/diet question (step 3). */
export const FOOD_OPTIONS = [
  { id: "meat_heavy",  label: "Meat-heavy diet",       desc: "Poultry or beef most days" },
  { id: "balanced",    label: "Balanced flexitarian",   desc: "Moderate mix of diet items" },
  { id: "vegetarian",  label: "Vegetarian lifestyle",   desc: "Egg & dairy, no meat" },
  { id: "vegan",       label: "Strict vegan plates",    desc: "100% plant-based inputs" },
] as const

/** Options for the shopping habits question (step 4). */
export const SHOPPING_OPTIONS = [
  { id: "minimalist", label: "Minimalist",      desc: "Rarely buy new items" },
  { id: "conscious",  label: "Eco-Conscious",   desc: "Look for green brands" },
  { id: "frequent",   label: "Frequent buyer",  desc: "Enjoy new items often" },
] as const

/** Options for the home energy question (step 5). */
export const ENERGY_OPTIONS = [
  { id: "smart_home", label: "Smart efficiency setup", desc: "Smart meters and thermostats" },
  { id: "solar",      label: "Solar clean power",      desc: "Roof panel clean offsetting" },
  { id: "standard",   label: "Standard home grid",     desc: "Standard residential bills" },
  { id: "high_ac",    label: "High climate heating",   desc: "Heavier temperature loads" },
] as const
