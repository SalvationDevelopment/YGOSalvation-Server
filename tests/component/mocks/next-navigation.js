const state = {
  pushCalls: [],
  refreshCount: 0
};

export function useRouter() {
  return {
    push(value) {
      state.pushCalls.push(value);
    },
    refresh() {
      state.refreshCount += 1;
    }
  };
}

export function __resetRouterMock() {
  state.pushCalls = [];
  state.refreshCount = 0;
}

export function __getRouterMockState() {
  return {
    pushCalls: [...state.pushCalls],
    refreshCount: state.refreshCount
  };
}
// Run with: npm run test:component
