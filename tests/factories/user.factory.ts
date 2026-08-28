export function createMockUser(overrides = {}) {
  return {
    id: `user_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Test Artist',
    email: `artist_${Math.random().toString(36).substring(2, 7)}@test.com`,
    role: 'USER' as const,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
