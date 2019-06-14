import * as React from "react";

import { useDataCache, parseResponse } from "../../src/DataCache";

export interface IProjectProps {
  projectId: string;
  suspend?: boolean;
}

export const Project: React.SFC<IProjectProps> = React.memo(
  ({ suspend, projectId }: IProjectProps) => {
    const dataStatus = useDataCache({
      fetchArgs: [`https://api.github.com/projects/${projectId}`],
      suspend: suspend
    });

    const parsedData = parseResponse<{ id: string }>(dataStatus.response);

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

    if (!dataStatus.isLoading && !(parsedData && parsedData.data)) {
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
          <p data-testid={`project-${projectId}-data`}>{parsedData.data.id}</p>
        </div>
      </div>
    );
  }
);
