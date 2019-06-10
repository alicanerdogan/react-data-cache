import React from "react";

export type Key = string | number;
export type FetchArgs = [RequestInfo, RequestInit | undefined];
export type GetKey = (input: RequestInfo, init?: RequestInit) => Key;
export type Invalidate = (input: RequestInfo, init?: RequestInit) => boolean;
export interface IResponseState {
  isLoading: boolean;
  response?: IResponse;
}
export interface IResponse {
  status: number;
  data: string;
}
export interface IParsedResponse {
  status: number;
  data?: { [key: string]: unknown };
}

type Listener = (state: IResponseState) => void;

const devTools =
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
    name: `${document.title} - Data Cache`
  });

class Store {
  subscribers: Record<Key, Listener[]> = {};
  state: Record<Key, IResponseState>;

  constructor(initialState?: Record<string | number, IResponseState>) {
    this.state = initialState || {};
  }

  dispatch = (fetchArgs: FetchArgs, key: Key) => {
    this.state = { ...this.state, [key]: { isLoading: true } };
    const keySubscribers = this.subscribers[key] || [];
    keySubscribers.forEach(listener => listener(this.state[key]));

    fetch(...fetchArgs).then(resp =>
      resp.text().then(data => {
        this.state = {
          ...this.state,
          [key]: {
            isLoading: false,
            response: { data, status: resp.status }
          }
        };
        devTools && devTools.send("UPDATE " + key, this.state);
        const keySubscribers = this.subscribers[key] || [];
        keySubscribers.forEach(listener => listener(this.state[key]));
      })
    );
  };

  getState() {
    return this.state;
  }

  subscribe(key: Key, listener: Listener) {
    const keySubscribers = this.subscribers[key] || [];
    keySubscribers.push(listener);
    this.subscribers[key] = keySubscribers;
  }
}

const CacheContext = React.createContext<Store>(new Store());

export const DataCache = ({
  children
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const storeRef = React.useRef<Store>(new Store());
  const store = storeRef.current;

  return React.createElement(CacheContext.Provider, { value: store }, children);
};

function getDefaultKey(input: RequestInfo, init?: RequestInit) {
  const method = (init || {}).method || "GET";
  return `${method} ${input}`;
}

function invalidateDefault() {
  return false;
}

export function useDataCache({
  fetchArgs,
  getKey,
  invalidate,
  suspend
}: {
  fetchArgs: FetchArgs;
  getKey?: GetKey;
  invalidate?: Invalidate;
  suspend?: boolean;
}) {
  const cacheStore = React.useContext(CacheContext);

  const getKeyFn = getKey || getDefaultKey;
  const key = getKeyFn(...fetchArgs);

  const invalidateFn = invalidate || invalidateDefault;
  const invalidated = invalidateFn(...fetchArgs);

  const [entryCache, setEntryCache] = React.useState(
    cacheStore.getState()[key]
  );

  const listener = React.useCallback(
    keyEntry => {
      setEntryCache(keyEntry);
    },
    [setEntryCache]
  );

  React.useEffect(() => {
    cacheStore.subscribe(key, listener);
  }, [cacheStore, key, listener]);

  React.useEffect(() => {
    if ((!invalidated && entryCache) || suspend) {
      return;
    }
    console.log("Dispatch", key, suspend);
    cacheStore.dispatch(fetchArgs, key);
  }, [cacheStore, entryCache, fetchArgs, key, invalidated, suspend]);

  return invalidated || !entryCache
    ? suspend
      ? { isLoading: false }
      : { isLoading: true }
    : entryCache;
}

export function parseResponse(
  response?: IResponse
): IParsedResponse | undefined {
  if (!response) {
    return undefined;
  }
  if (!response.data) {
    return { status: response.status };
  }
  return { ...response, data: JSON.parse(response.data) };
}
