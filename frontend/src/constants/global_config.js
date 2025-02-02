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
    mock_vaults: 0,
  },
  header: {
    enabled: true,
  },
  dev_mode: {
    enabled: false,
  },
  session: {
    source: "icp",
    mock: {
      initialize_at_startup: false,
    },
    icp: {
      host: "http://localhost:5173",
      manager_canister_id: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
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