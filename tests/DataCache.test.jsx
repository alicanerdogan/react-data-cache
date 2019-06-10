import React from "react";
import {
  render,
  debugDOM,
  waitForElement,
  fireEvent
} from "@testing-library/react";

import { TestApp } from "./TestApp";
import { ListRepos } from "./ListRepos";

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
});
