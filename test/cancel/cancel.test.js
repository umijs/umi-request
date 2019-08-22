import Cancel from '../../src/cancel/cancel';

describe('Cancel', () => {
  describe('toString', () => {
    it('returns correct result when message is not specified', () => {
      const cancel = new Cancel();
      expect(cancel.toString()).toBe('Cancel');
    });

    it('returns correct result when message is specified', () => {
      const cancel = new Cancel('Operation has been canceled.');
      expect(cancel.toString()).toBe('Cancel: Operation has been canceled.');
    });
  });
});
