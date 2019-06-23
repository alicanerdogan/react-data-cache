import * as React from "react";

import { useResolver } from "../../src/DataCache";

export interface IListReposWithFetchProps {
  suspend?: boolean;
  fetch: () => Promise<{ status: number; repos: { id: string }[] }>;
}

export const ListReposWithFetch: React.SFC<IListReposWithFetchProps> = ({
  suspend,
  fetch
}: IListReposWithFetchProps) => {
  const dataStatus = useResolver({
    resolver: fetch,
    key: `GET repos`,
    suspend
  });

  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  if (dataStatus.isLoading) {
    return (
      <div>
        <p data-testid="render-count">{renderCountRef.current}</p>
        <p data-testid="loading">{"Loading Placeholder"}</p>
      </div>
    );
  }

  if (!dataStatus.isLoading && !dataStatus.response) {
    return (
      <div>
        <p data-testid="render-count">{renderCountRef.current}</p>
        <p data-testid="suspended">{"Suspended"}</p>
        <button data-testid="trigger" onClick={dataStatus.trigger}>
          {"Trigger"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p data-testid="render-count">{renderCountRef.current}</p>
      <div>
        <label>{"Status"}</label>
        <p data-testid="status">{dataStatus.response.status}</p>
      </div>
      <div>
        <label>{"Data"}</label>
        <p>{JSON.stringify(dataStatus.response.repos)}</p>
      </div>
    </div>
  );
};
