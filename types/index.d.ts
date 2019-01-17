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

export interface IDataCache {
  [key: string]: IResponseState;
}

export interface IDataCacheContext {
  cache: IDataCache;
  updateCache: (key: string, value: IResponse) => void;
  setAsLoading: (key: string) => void;
}

export type FetchArgs = [RequestInfo, RequestInit | undefined];
export type GetKey = (input: RequestInfo, init?: RequestInit) => string;
export type Invalidate = (input: RequestInfo, init?: RequestInit) => boolean;
export type DataCacheHookOutput = [IResponse | undefined, boolean, () => void];
export type DataCacheHookParsedOutput = [
  IParsedResponse | undefined,
  boolean,
  () => void
];
export type DataCacheHookParsedState = [IParsedResponse | undefined, boolean];
