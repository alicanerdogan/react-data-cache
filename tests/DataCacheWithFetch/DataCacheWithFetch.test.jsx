import React from "react";
import {
  render,
  debugDOM,
  waitForElement,
  fireEvent
} from "@testing-library/react";

import { TestApp } from "./../TestApp";
import { ListReposWithFetch } from "./ListReposWithFetch";
import { ProjectWithFetch } from "./ProjectWithFetch";

describe("DataCache", () => {
  it("provides response", async () => {
    const fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: "Test"
      })
    );

    const { getByTestId } = render(
      <TestApp>
        <ListReposWithFetch fetch={fetch} />
      </TestApp>
    );

    const status = await waitForElement(() => getByTestId("status"));
    expect(status.innerHTML).toEqual("200");

    const renderCount = getByTestId("render-count");
    expect(renderCount.innerHTML).toEqual("2");
  });

  it("does not call fetch when it is suspended", async () => {
    const fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: "Test"
      })
    );

    const { getByTestId } = render(
      <TestApp>
        <ListReposWithFetch fetch={fetch} suspend={true} />
      </TestApp>
    );

    const suspended = await waitForElement(() => getByTestId("suspended"));
    expect(suspended).toBeTruthy();

    const triggerButton = getByTestId("trigger");
    fireEvent.click(triggerButton);

    const status = await waitForElement(() => getByTestId("status"));
    expect(status.innerHTML).toEqual("200");

    const renderCount = getByTestId("render-count");
    expect(renderCount.innerHTML).toEqual("3");
  });

  it("refetches when the key changes", async () => {
    const fetch = jest.fn(url =>
      Promise.resolve({
        status: 200,
        data: url.endsWith("1") ? { id: "1" } : { id: "2" }
      })
    );

    const { getByTestId, rerender } = render(
      <TestApp>
        <ProjectWithFetch fetch={fetch} projectId="1" />
      </TestApp>
    );

    const project1Status = await waitForElement(() =>
      getByTestId("project-1-status")
    );
    expect(project1Status.innerHTML).toEqual("200");

    const project1RenderCount = getByTestId("project-1-render-count");
    expect(project1RenderCount.innerHTML).toEqual("2");

    const project1Data = getByTestId("project-1-data");
    expect(project1Data.innerHTML).toEqual("1");

    rerender(
      <TestApp>
        <ProjectWithFetch fetch={fetch} projectId="2" />
      </TestApp>
    );

    const project2Status = await waitForElement(() =>
      getByTestId("project-2-status")
    );
    expect(project2Status.innerHTML).toEqual("200");

    const project2RenderCount = getByTestId("project-2-render-count");
    expect(project2RenderCount.innerHTML).toEqual("4");

    const project2Data = getByTestId("project-2-data");
    expect(project2Data.innerHTML).toEqual("2");
  });

  it("does not rerender other components uses hook when it fetches other key results", async () => {
    const fetch = jest.fn(url =>
      Promise.resolve({
        status: 200,
        data: url.endsWith("1")
          ? { id: "1" }
          : url.endsWith("3")
          ? { id: "3" }
          : { id: "2" }
      })
    );

    const { getByTestId, rerender } = render(
      <TestApp>
        <ProjectWithFetch fetch={fetch} projectId="1" />
        <ProjectWithFetch fetch={fetch} projectId="2" suspend={true} />
      </TestApp>
    );

    const project1Status = await waitForElement(() =>
      getByTestId("project-1-status")
    );
    expect(project1Status.innerHTML).toEqual("200");

    const project1RenderCount = getByTestId("project-1-render-count");
    expect(project1RenderCount.innerHTML).toEqual("2");

    const project1Data = getByTestId("project-1-data");
    expect(project1Data.innerHTML).toEqual("1");

    const project2RenderCount = getByTestId("project-2-render-count");
    expect(project2RenderCount.innerHTML).toEqual("1");

    const project2TriggerButton = getByTestId("project-2-trigger");
    fireEvent.click(project2TriggerButton);

    const status = await waitForElement(() => getByTestId("project-2-status"));
    expect(status.innerHTML).toEqual("200");

    expect(project2RenderCount.innerHTML).toEqual("3");
    expect(project1RenderCount.innerHTML).toEqual("2");

    expect(project1Data.innerHTML).toEqual("1");

    const project2Data = getByTestId("project-2-data");
    expect(project2Data.innerHTML).toEqual("2");

    rerender(
      <TestApp>
        <ProjectWithFetch fetch={fetch} projectId="3" />
        <ProjectWithFetch fetch={fetch} projectId="2" suspend={true} />
      </TestApp>
    );

    const project3Status = await waitForElement(() =>
      getByTestId("project-3-status")
    );
    expect(project3Status.innerHTML).toEqual("200");

    expect(project2RenderCount.innerHTML).toEqual("3");

    const project3RenderCount = getByTestId("project-3-render-count");
    expect(project3RenderCount.innerHTML).toEqual("4");

    const project3Data = getByTestId("project-3-data");
    expect(project3Data.innerHTML).toEqual("3");
  });
});
