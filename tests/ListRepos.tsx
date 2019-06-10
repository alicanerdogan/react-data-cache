import * as React from "react";

import { useDataCache } from "../src/DataCache";

export interface IListReposProps {}

export const ListRepos: React.SFC<IListReposProps> = (
  props: IListReposProps
) => {
  const dataStatus = useDataCache({
    fetchArgs: ["https://api.github.com/users/octocat/orgs", { method: "GET" }]
  });

  if (dataStatus.isLoading) {
    return <p>{"Loading Placeholder"}</p>;
  }

  if (!dataStatus.response) {
    return <p>{"Error Occured"}</p>;
  }

  return (
    <div data-testid="content">
      <div>
        <label>{"Status"}</label>
        <p data-testid="status">{dataStatus.response.status}</p>
      </div>
      <div>
        <label>{"Data"}</label>
        <p>{dataStatus.response.data}</p>
      </div>
    </div>
  );
};
