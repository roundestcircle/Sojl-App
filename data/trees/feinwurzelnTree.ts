import { leaf, type DecisionTreeData } from "@/data/trees/types";

const Q = "Durchwurzelungsintensität Feinwurzeln";

export const FeinwurzelnTree: DecisionTreeData = {
  root: "start",
  nodes: {
    start: {
      question: "Wie viele Feinwurzeln sind zu sehen?",
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
    },
    result_wf0: leaf("Wf0", "keine Wurzeln", Q),
    result_wf1: leaf("Wf1", "sehr schwach", Q),
    result_wf2: leaf("Wf2", "schwach", Q),
    result_wf3: leaf("Wf3", "mittel", Q),
    result_wf4: leaf("Wf4", "stark", Q),
    result_wf5: leaf("Wf5", "sehr stark", Q),
    result_wf6: leaf("Wf6", "extrem stark bis Wurzelfilz", Q),
  },
};
