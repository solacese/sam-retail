import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { createStore } from "../src/simulation/store";
import { SecurityInspector } from "../src/shop/ShopLifeControls";

it("keeps the last payment result visible when a new security case is waiting", () => {
  const state = createStore();
  state.securityCases = [
    {
      id: 1,
      kind: "receipt",
      origin: "exit-attempt",
      shopperId: 8,
      transactionId: 0,
      checkout: 0,
      paymentTransactionId: 1,
      stage: "resolved",
      at: 12,
      timer: 0,
      outcome: "Inès paid at checkout 1. All sorted!",
    },
    {
      id: 2,
      kind: "bag",
      shopperId: 2,
      transactionId: 3,
      stage: "waiting",
      at: 47,
      timer: 0,
    },
  ];
  const render = () =>
    renderToStaticMarkup(
      createElement(SecurityInspector, {
        state,
        command: () => {},
        onClose: () => {},
      }),
    );
  expect(render()).toContain("A forgotten bag");
  expect(render()).toContain("Inès paid at checkout 1. All sorted!");
  state.securityCases[1].stage = "resolved";
  state.securityCases[1].outcome =
    "Forgotten paid bag returned. A happy goodbye!";
  expect(render()).toContain("Forgotten paid bag returned. A happy goodbye!");
  expect(render()).not.toContain("Inès paid at checkout 1. All sorted!");
});
