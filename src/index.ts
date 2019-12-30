export interface SuspenseCache<Input, Result> {
    clear: (input: Input) => void;
    clearAll: () => void;
    write: (input: Input, r: Result) => void;
    readMultiple: (inputs: Input[]) => Result[];
    read: (input: Input) => Result;
    refetch: (input: Input) => Promise<void>;
}

/*
 * Alternative to react-cache while it's still broken.
 */
export function createCache<Input, Result>(
    lookup: (input: Input) => Promise<Result>,
    getCacheKey: (input: Input) => string = input =>
        typeof input !== 'undefined' ? input.toString() : ''
): SuspenseCache<Input, Result> {
    let cache = {};

    function write(input: Input, result: Result) {
        cache[getCacheKey(input)] = {
            result
        };
    }

    function clearAll() {
        cache = {};
    }

    function clear(input: Input) {
        delete cache[getCacheKey(input)];
    }

    function fetch(
        input: Input,
        cacheKey: string = getCacheKey(input)
    ): Promise<void> {
        return lookup(input).then(
            result => {
                cache[cacheKey] = {
                    result
                };
            },
            error => {
                cache[cacheKey] = {
                    error
                };
            }
        );
    }

    function readMultiple(inputs: Input[]): Result[] {
        const states = inputs.map(input => {
            const cacheKey = getCacheKey(input);

            if (!cache[cacheKey]) {
                const pending = fetch(input);

                cache[cacheKey] = {
                    pending
                };
            }

            return cache[cacheKey];
        });

        const pendings = states.map(state => state.pending).filter(Boolean);
        const errors = states.map(state => state.error).filter(Boolean);

        if (pendings.length > 0) {
            throw Promise.all(pendings);
        }

        if (errors.length > 0) {
            throw errors[0];
        }

        return states.map(state => state.result);
    }

    function read(key: Input): Result {
        return readMultiple([key])[0];
    }

    function refetch(key: Input): Promise<void> {
        clear(key);
        return fetch(key);
    }

    return {
        write,
        clear,
        clearAll,
        readMultiple,
        read,
        refetch
    };
}
