import * as React from "react";

import { DataCache } from "../src/DataCache";

export interface ITestAppProps {
  children: JSX.Element | JSX.Element[];
}

export const TestApp: React.SFC<ITestAppProps> = ({
  children
}: ITestAppProps) => {
  return <DataCache>{children}</DataCache>;
};
