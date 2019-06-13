import * as React from "react";

import { useDataCache } from "../../src/DataCache";

export interface IListReposProps {
  suspend?: boolean;
}

export const ListRepos: React.SFC<IListReposProps> = ({
  suspend
}: IListReposProps) => {
  const dataStatus = useDataCache({
    fetchArgs: ["https://api.github.com/users/octocat/orgs", { method: "GET" }],
    suspend: suspend
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

  const contentType = dataStatus.response.headers.find(([header, value]) => {
    return header === "Content-Type";
  })[1];

  return (
    <div>
      <p data-testid="render-count">{renderCountRef.current}</p>
      <div>
        <label>{"Status"}</label>
        <p data-testid="status">{dataStatus.response.status}</p>
      </div>
      <div>
        <label>{"Data"}</label>
        <p>{dataStatus.response.data}</p>
      </div>
      <div>
        <label>{"Content Type"}</label>
        <p data-testid="content-type">{contentType}</p>
      </div>
    </div>
  );
};
