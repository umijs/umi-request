import { MapCache } from '../src/utils';

// 测试工具函数
describe('test utils:', () => {
  describe('test cache', () => {
    it('test timeout', async done => {
      const mapCache = new MapCache({ maxCache: 3 });

      // 设置读取
      const key = { some: 'one' };
      mapCache.set(key, { hello: 'world1' }, 1000);
      expect(mapCache.get(key).hello).toBe('world1');
      setTimeout(() => {
        expect(mapCache.get(key)).toBe(undefined);
        done();
      }, 1001);
    });

    it('test delete', () => {
      const mapCache = new MapCache({ maxCache: 3 });
      // 删除
      const key2 = { other: 'two' };
      mapCache.set(key2, { hello: 'world1' }, 10000);
      mapCache.delete(key2);
      expect(mapCache.get(key2)).toBe(undefined);
    });

    it('test clear', () => {
      const mapCache = new MapCache({ maxCache: 3 });
      // 清除
      const key3 = { other: 'three' };
      mapCache.set(key3, { hello: 'world1' }, 10000);
      mapCache.clear();
      expect(mapCache.get(key3)).toBe(undefined);
    });

    it('test max cache', () => {
      const mapCache = new MapCache({ maxCache: 3 });

      // 测试超过最大数
      mapCache.set('max1', { what: 'ok' }, 10000);
      mapCache.set('max1', { what: 'ok1' }, 10000);
      mapCache.set('max2', { what: 'ok2' }, 10000);
      mapCache.set('max3', { what: 'ok3' }, 10000);
      expect(mapCache.get('max1').what).toBe('ok1');
      mapCache.set('max4', { what: 'ok4' }, 10000);
      expect(mapCache.get('max1')).toBe(undefined);
      mapCache.set('max5', { what: 'ok5' });
      mapCache.set('max6', { what: 'ok6' }, 0);
    });
  });
});
