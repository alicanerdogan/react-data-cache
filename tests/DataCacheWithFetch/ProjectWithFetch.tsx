import * as React from "react";

import { useDataCacheWithFetch } from "../../src/DataCache";

export interface IProjectWithFetchProps {
  projectId: string;
  suspend?: boolean;
  fetch: (projectId: string) => Promise<{ id: string }>;
}

export const ProjectWithFetch: React.SFC<IProjectWithFetchProps> = ({
  fetch,
  suspend,
  projectId
}) => {
  const fetchProject = React.useCallback(() => fetch(projectId), [
    projectId,
    fetch
  ]);

  const dataStatus = useDataCacheWithFetch({
    fetch: fetchProject,
    key: `GET Project ${projectId}`,
    suspend: suspend
  });

  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  if (dataStatus.isLoading) {
    return (
      <div>
        <p data-testid={`project-${projectId}-render-count`}>
          {renderCountRef.current}
        </p>
        <p data-testid="loading">{"Loading Placeholder"}</p>
      </div>
    );
  }

  if (
    !dataStatus.isLoading &&
    !(dataStatus.response && dataStatus.response.data)
  ) {
    return (
      <div>
        <p data-testid={`project-${projectId}-render-count`}>
          {renderCountRef.current}
        </p>
        <p data-testid="suspended">{"Suspended"}</p>
        <button
          data-testid={`project-${projectId}-trigger`}
          onClick={dataStatus.trigger}
        >
          {"Trigger"}
        </button>
      </div>
    );
  }

  return (
    <div data-testid={`project-${projectId}`}>
      <p data-testid={`project-${projectId}-render-count`}>
        {renderCountRef.current}
      </p>
      <div>
        <label>{"Status"}</label>
        <p data-testid={`project-${projectId}-status`}>
          {dataStatus.response.status}
        </p>
      </div>
      <div>
        <label>{"Data"}</label>
        <p data-testid={`project-${projectId}-data`}>
          {dataStatus.response.data.id}
        </p>
      </div>
    </div>
  );
};
