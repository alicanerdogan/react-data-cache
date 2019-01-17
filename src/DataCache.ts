import React from "react";
import { IDataCacheContext, IResponse, IDataCache, FetchArgs, GetKey, Invalidate, DataCacheHookOutput, IParsedResponse } from "../types";

const devTools =
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
    name: `${document.title} - Data Cache`
  });


const DataCacheContext = React.createContext<IDataCacheContext>({
  cache: {},
  updateCache: (key: string, value: IResponse) => ({
    [key]: { isLoading: false, response: value }
  }),
  setAsLoading: key => ({ [key]: { isLoading: true } })
});

const DataCacheContextProvider = DataCacheContext.Provider;

export function DataCache(props: { children: React.ReactNode }) {
  const [cache, setCache] = React.useState<IDataCache>({});

  const updateCache = React.useCallback(
    (key, value) => {
      const newCache = {
        ...cache,
        [key]: { isLoading: false, response: value }
      };
      setCache(newCache);
      devTools && devTools.send("UPDATE " + key, newCache);
    },
    [cache, setCache]
  );

  const setAsLoading = React.useCallback(
    key => {
      const newCache = {
        ...cache,
        [key]: { isLoading: true }
      };
      setCache(newCache);
      devTools && devTools.send("LOADING " + key, newCache);
    },
    [cache, setCache]
  );

  React.useEffect(() => {
    devTools && devTools.init(cache);
  }, []);

  return (
    React.createElement(DataCacheContextProvider, { value: { cache, updateCache, setAsLoading } }, props.children)
  );
}

function getDefaultKey(input: RequestInfo, init: RequestInit | undefined = {}) {
  const method = init.method || "GET";
  return `${method} ${input}`;
}

function invalidateDefault() {
  return false;
}

export function useDataCache(
  fetchArgs: FetchArgs,
  getKey: GetKey = getDefaultKey,
  invalidate: Invalidate = invalidateDefault
): DataCacheHookOutput {
  const { cache, updateCache, setAsLoading } = React.useContext(
    DataCacheContext
  );

  const key = getKey(...fetchArgs);

  const fetcher = React.useCallback(
    async () => {
      setAsLoading(key);
      const resp = await fetch(...fetchArgs);
      const data = await resp.text();
      updateCache(key, { data, status: resp.status });
    },
    [key]
  );

  const cacheEntry = (invalidate(key) ? undefined : cache[key]) || {
    isLoading: false
  };

  return [cacheEntry.response, cacheEntry.isLoading, fetcher];
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
