import type { DecisionTreeData } from "../DecisionTreeTypes";

export const FeinwurzelIntensityTree: DecisionTreeData = {
  id: "start",
  question: "Wieviele Feinwurzeln sind zu sehen?",
  hint: "Feinwurzeln pro dm² abschätzen.",
  options: [
    { text: "0", next: "result_wf0" },
    { text: "1 bis 2", next: "result_wf1" },
    { text: "3 bis 5", next: "result_wf2" },
    { text: "6 bis 10", next: "result_wf3" },
    { text: "11 bis 20", next: "result_wf4" },
    { text: "21 bis 50", next: "result_wf5" },
    { text: "über 50", next: "result_wf6" },
  ],
  nodes: {
    result_wf0: {
      id: "result_wf0",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf0", description: "keine Wurzeln" },
    },
    result_wf1: {
      id: "result_wf1",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf1", description: "sehr schwach" },
    },
    result_wf2: {
      id: "result_wf2",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf2", description: "schwach" },
    },
    result_wf3: {
      id: "result_wf3",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf3", description: "mittel" },
    },
    result_wf4: {
      id: "result_wf4",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf4", description: "stark" },
    },
    result_wf5: {
      id: "result_wf5",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf5", description: "sehr stark" },
    },
    result_wf6: {
      id: "result_wf6",
      question: "Durchwurzelungsintensität Feinwurzeln",
      result: { title: "Wf6", description: "extrem stark bis Wurzelfilz" },
    },
  },
};
