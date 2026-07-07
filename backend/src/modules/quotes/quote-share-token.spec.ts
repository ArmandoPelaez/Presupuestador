import {
  generateShareToken,
  hashShareToken,
  verifyShareToken,
} from './quote-share-token';

describe('quote share token', () => {
  it('genera tokens impredecibles y persiste solo un hash verificable', () => {
    const first = generateShareToken();
    const second = generateShareToken();
    const hash = hashShareToken(first);

    expect(first).toHaveLength(43);
    expect(second).not.toBe(first);
    expect(hash).not.toContain(first);
    expect(verifyShareToken(first, hash)).toBe(true);
    expect(verifyShareToken(second, hash)).toBe(false);
  });
});
