import Router from "next/router";

export const routerPushMock = jest.spyOn(Router, "push").mockImplementation(async () => true);
