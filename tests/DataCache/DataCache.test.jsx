import React from "react";
import {
  render,
  debugDOM,
  waitForElement,
  fireEvent
} from "@testing-library/react";

import { TestApp } from "../TestApp";
import { ListRepos } from "./ListRepos";
import { Project } from "./Project";

describe("DataCache", () => {
  it("provides response", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        text: () => Promise.resolve("Test")
      })
    );

    const { getByTestId } = render(
      <TestApp>
        <ListRepos />
      </TestApp>
    );

    const status = await waitForElement(() => getByTestId("status"));
    expect(status.innerHTML).toEqual("200");

    const renderCount = getByTestId("render-count");
    expect(renderCount.innerHTML).toEqual("2");
  });

  it("does not call fetch when it is suspended", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        text: () => Promise.resolve("Test")
      })
    );

    const { getByTestId } = render(
      <TestApp>
        <ListRepos suspend={true} />
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

  it("does not rerender other components uses hook when it fetches other key results", async () => {
    global.fetch = jest.fn(url =>
      Promise.resolve({
        status: 200,
        text: () =>
          Promise.resolve(
            url.endsWith("1")
              ? JSON.stringify({ id: "1" })
              : JSON.stringify({ id: "2" })
          )
      })
    );

    const { getByTestId, container } = render(
      <TestApp>
        <Project projectId="1" />
        <Project projectId="2" suspend={true} />
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
  });
});
