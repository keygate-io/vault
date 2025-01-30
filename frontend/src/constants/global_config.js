const GlobalSettings = {
  transactions: {
    source: "mock",
    enabled: true,
  },
  signers: {
    source: "mock",
    enabled: true,
  },
  vaults: {
    source: "mock",
    enabled: true,
    mock_vaults: 10,
  },
  header: {
    enabled: true,
  },
  dev_mode: {
    enabled: true,
  },
  session: {
    source: "mock",
    mock: {
      initialize_at_startup: false,
    },
    enabled: true,
  },
  users: {
    source: "mock",
    enabled: true,
  },
  decisions: {
    source: "mock",
    enabled: true,
  },
  demo: {
    enabled: false,
  },
  pilot_program_invitation: {
    enabled: true,
  },
};

export { GlobalSettings };
