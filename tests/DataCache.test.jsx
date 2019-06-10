import React from "react";
import { render, debugDOM, waitForElement } from "@testing-library/react";

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
  });
});
