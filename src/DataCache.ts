import React from "react";

export type Key = string | number;
export type FetchArgs = [RequestInfo] | [RequestInfo, RequestInit];
export type GetKey = (input: RequestInfo, init?: RequestInit) => Key;

export interface IResponse {
  status: number;
  data: string;
  headers: [string, string][];
}

export interface ITypedResponseState<T> {
  isLoading: boolean;
  response?: T;
}

export interface IResponseState extends ITypedResponseState<IResponse> {}

export interface IResponseStateProps extends IResponseState {
  trigger: () => void;
}

export interface ITypedResponseStateProps<T> extends ITypedResponseState<T> {
  trigger: () => void;
}

export interface IParsedResponse<T> {
  status: number;
  data?: T;
  headers: [string, string][];
}

function getHeaders(headers: Headers): [string, string][] {
  const headerList: [string, string][] = [];

  headers.forEach((value, key) => {
    headerList.push([key, value]);
  });

  return headerList;
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

    const input = fetchArgs[0];
    const init = fetchArgs[1];

    fetch(input, init).then(resp =>
      resp.text().then(data => {
        this.state = {
          ...this.state,
          [key]: {
            isLoading: false,
            response: {
              data,
              status: resp.status,
              headers: getHeaders(resp.headers)
            }
          }
        };
        devTools && devTools.send(key, this.state);
        const keySubscribers = this.subscribers[key] || [];
        keySubscribers.forEach(listener => listener(this.state[key]));
      })
    );
  };

  dispatchWithFn = (fetch: () => Promise<any>, key: Key) => {
    this.state = { ...this.state, [key]: { isLoading: true } };
    const keySubscribers = this.subscribers[key] || [];
    keySubscribers.forEach(listener => listener(this.state[key]));

    fetch().then(data => {
      this.state = {
        ...this.state,
        [key]: {
          isLoading: false,
          response: data
        }
      };
      devTools && devTools.send("UPDATE " + key, this.state);
      const keySubscribers = this.subscribers[key] || [];
      keySubscribers.forEach(listener => listener(this.state[key]));
    });
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

export function useFetch({
  fetchArgs,
  getKey,
  suspend
}: {
  fetchArgs: FetchArgs;
  getKey?: GetKey;
  suspend?: boolean;
}): IResponseStateProps {
  const cacheStore = React.useContext(CacheContext);

  const getKeyFn = getKey || getDefaultKey;
  const key = getKeyFn(fetchArgs[0], fetchArgs[1]);

  const entryCache = cacheStore.getState()[key] || { isLoading: !suspend };

  const [, setForceRender] = React.useState({});

  const listener = React.useCallback(
    (keyEntry: IResponseState) => {
      if (keyEntry.isLoading && (entryCache || {}).isLoading) {
        return;
      }
      setForceRender({});
    },
    [setForceRender]
  );

  React.useEffect(() => {
    cacheStore.subscribe(key, listener);
  }, [cacheStore, key, listener]);

  const trigger = React.useCallback(() => {
    cacheStore.dispatch(fetchArgs, key);
  }, [cacheStore, fetchArgs, key]);

  React.useEffect(() => {
    if (entryCache.response || suspend) {
      return;
    }
    trigger();
  }, [entryCache, suspend, trigger]);

  return { ...entryCache, trigger };
}

export function useResolver<T>({
  resolver,
  key,
  suspend
}: {
  resolver: () => Promise<T>;
  key: Key;
  suspend?: boolean;
}): ITypedResponseStateProps<T> {
  const cacheStore = React.useContext(CacheContext);

  const entryCache: ITypedResponseState<T> = (cacheStore.getState()[
    key
  ] as ITypedResponseState<T>) || { isLoading: !suspend };

  const [, setForceRender] = React.useState({});

  const listener = React.useCallback(
    (keyEntry: IResponseState) => {
      if (keyEntry.isLoading && (entryCache || {}).isLoading) {
        return;
      }
      setForceRender({});
    },
    [setForceRender]
  );

  React.useEffect(() => {
    cacheStore.subscribe(key, listener);
  }, [cacheStore, key, listener]);

  const trigger = React.useCallback(() => {
    cacheStore.dispatchWithFn(resolver, key);
  }, [cacheStore, resolver, key]);

  React.useEffect(() => {
    if (entryCache.response || suspend) {
      return;
    }
    trigger();
  }, [entryCache, suspend, trigger]);

  return { ...entryCache, trigger };
}

export function parseResponse<T>(
  response?: IResponse
): IParsedResponse<T> | undefined {
  if (!response) {
    return undefined;
  }
  if (!response.data) {
    return { status: response.status, headers: response.headers };
  }
  try {
    return { ...response, data: JSON.parse(response.data) as T };
  } catch (error) {
    return { status: response.status, headers: response.headers };
  }
}
