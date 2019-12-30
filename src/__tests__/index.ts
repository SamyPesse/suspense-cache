import { createCache } from '..';

const cache = createCache<number, number>(async timeout => {
    if (timeout < 0) {
        throw new Error('Error');
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(timeout);
        }, timeout);
    });
});

beforeEach(() => {
    cache.clearAll();
});

it('should throw a promise if pending', () => {
    try {
        cache.read(1);
        throw new Error('should not come here')
    } catch(p) {
        expect(p instanceof Promise).toBe(true);
    }
});

it('should no throw a promise if already in cache', async () => {
    try {
        cache.read(1);
        throw new Error('should not come here');
    } catch(p) {
        await p;
    }

    expect(cache.read(1)).toEqual(1)
});
