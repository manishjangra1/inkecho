export const COMMON_COPY = {
  APP_NAME: 'InkEcho',
  TAGLINE: 'Draw. Describe. Watch it echo.',
  HERO: {
    TITLE: 'Draw. Describe.',
    TITLE_HIGHLIGHT: 'Watch it echo.',
    SUBTITLE:
      'The hilarious multiplayer party game of visual telephone. Start with a prompt, doodle what you see, describe what others drew, and discover the crazy transformations at the end!',
    CREATE_ROOM: 'Create Room',
    JOIN_ROOM: 'Join Room',
    QUICK_JOIN: 'Quick Join',
    ENTER_CODE: 'Enter 6-character code',
    JOIN_BUTTON: 'Join →',
  },
  HOW_IT_WORKS: {
    SECTION_TITLE: 'How It Works',
    SECTION_SUBTITLE: 'Four simple steps to absolute chaotic fun with your friends.',
    STEPS: [
      {
        number: '1',
        title: 'Write a Prompt',
        description: 'Start the chain with any quirky, weird, or funny sentence you can imagine.',
      },
      {
        number: '2',
        title: 'Doodle It',
        description: 'Draw the prompt on a digital canvas before the timer runs out.',
      },
      {
        number: '3',
        title: 'Describe It',
        description: 'Look at the previous drawing and guess what on earth it was supposed to be.',
      },
      {
        number: '4',
        title: 'The Reveal 🎉',
        description: 'Watch the entire chain unfold step-by-step and vote on the funniest turns!',
      },
    ],
  },
  FEATURES: {
    SECTION_TITLE: 'Everything You Need for Game Night',
    SECTION_SUBTITLE: 'Built for instant fun with friends on any screen, anywhere.',
    ITEMS: [
      {
        title: 'Instant Play',
        description: 'No account needed. Jump straight into private or public rooms as a guest in seconds.',
        icon: 'Zap',
      },
      {
        title: 'Real-time Sync',
        description: 'Lightning-fast synchronous gameplay powered by low-latency edge realtime infrastructure.',
        icon: 'Activity',
      },
      {
        title: 'Responsive & Mobile Friendly',
        description: 'Smooth touch drawing on phones, tablets, or full desktop canvas experience.',
        icon: 'Smartphone',
      },
      {
        title: 'Hilarious Reveal Mode',
        description: 'Cinematic step-by-step chain viewer with auto-advance and party voting.',
        icon: 'Sparkles',
      },
      {
        title: 'Spectator Mode',
        description: 'Late to the game? Hop in as a spectator and enjoy the chaotic art live.',
        icon: 'Eye',
      },
      {
        title: 'Private & Safe',
        description: 'Customizable room timers, optional profanity filters, and room host moderation tools.',
        icon: 'Shield',
      },
    ],
  },
  NAV: {
    BROWSE: 'Browse Rooms',
    CREATE: 'Create Room',
    JOIN: 'Join',
    LOGIN: 'Sign In',
    LOGOUT: 'Sign Out',
  },
  FOOTER: {
    COPYRIGHT: `© ${new Date().getFullYear()} InkEcho. All rights reserved.`,
    PRIVACY: 'Privacy Policy',
    TERMS: 'Terms of Service',
    GITHUB: 'GitHub',
  },
} as const;
