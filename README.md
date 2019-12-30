# suspense-cache

Cache utility to create resources for React suspense. This module is an alternative to `react-cache` which has not been updated.

This module should be used to create a cache that will throw a promise when pending.

## Usage

For example with a cache to fetch an URL:

```ts
import { createCache } from 'suspense-cache';

const cache = createCache(
    async url => {
        const res = await fetch(url);
        return await res.text();
    }
);
```

Then during rendering, the cache can be used:

```ts
const text = cache.read('https://somewebpage.com');
```
