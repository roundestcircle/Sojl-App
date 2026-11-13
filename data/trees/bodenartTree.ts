import { leaf, type DecisionTreeData } from "@/data/trees/types";

const Q = "Die Bodenart ist";

// NOTE (review item B1.1): the "Nein" answers of tex1a, tex1c and tex3a lead
// back to an earlier question, and the Ts3-4 / Tu3-4 leaves are not single
// KA5 codes. The key needs a redesign; see data/trees/__tests__/trees.test.ts.
export const BodenartTree: DecisionTreeData = {
  root: "start",
  nodes: {
    start: {
      question: "Wie gut lässt sich der Boden ausrollen?",
      options: [
        {
          text: "Nicht zwischen den Handtellern zu einer bleistiftdicken Wurst ausrollbar",
          next: "tex1",
        },
        {
          text: "Gerade zu einer bleistiftdicken Wurst ausrollbar, aber nicht auf halbe Bleistiftstärke",
          next: "tex2",
        },
        {
          text: "Auf halbe Bleistiftstärke ausrollbar",
          next: "tex3",
        },
      ],
    },
    tex1: {
      question:
        "Wie fühlt sich der Boden zwischen den Fingern an? Wie sieht er aus?",
      options: [
        {
          text: "Kaum schmutzend, kaum Feinsubstanz in Fingerrillen, nicht bindig",
          next: "tex1a",
        },
        {
          text: "Schmutzend, Feinsubstanz in den Fingerrillen, kaum bindig",
          next: "tex1b",
        },
        {
          text: "Schmutzend, Feinsubstanz in den Fingerrillen, etwas bindig",
          next: "tex1c",
        },
      ],
    },
    tex2: {
      question: "Wie verhält sich eine Kugel mit 1 cm Durchmesser?",
      options: [
        { text: "Haftet gut am Finger", next: "tex2a" },
        { text: "Haftet kaum am Finger", next: "tex2b" },
      ],
    },
    tex3: {
      question: "Wie gut lässt sich die Wurst weiterformen?",
      options: [
        { text: "Ein Ring mit 3 cm Durchmesser ist möglich", next: "tex3b" },
        {
          text: "Ein Ring mit 3 cm Durchmesser ist nicht möglich, ohne dass die Wurst bricht",
          next: "tex3a",
        },
      ],
    },
    tex3b: {
      question:
        "Wie verhält sich der Boden nach Quetschen zwischen Daumen und Zeigefinger?",
      options: [
        { text: "Er ist rau und schwach glänzend", next: "tex3ba" },
        { text: "Er ist rau und deutlich glänzend", next: "tex3bb" },
        { text: "Er ist glatt und stark glänzend", next: "tex3bc" },
      ],
    },
    tex1a: {
      question: "Der Boden enthält über 85% Sand",
      options: [
        { text: "Ja", next: "Ss" },
        { text: "Nein", next: "tex1" },
      ],
    },
    tex1b: {
      question: "Wie verhält sich der Boden weiter?",
      options: [
        {
          text: "sehr sandig (>52%), kaum bindig, schwach formbar, Kugel von 1 cm haftet kaum am Finger",
          next: "Su",
        },
        {
          text: "Sandkörner noch sicht- und fühlbar (12-50%), stumpf-mehlig",
          next: "Us",
        },
        { text: "Kaum Sandkörner, stumpf-mehlig", next: "Uu" },
      ],
    },
    tex1c: {
      question:
        "Sind die Sandkörner noch sicht- und fühlbar (8-25%), ist der Boden stumpf-mehlig, etwas bindig, schwach formbar, und eine Kugel mit 1 cm Durchmesser haftet leicht am Finger?",
      options: [
        { text: "Ja", next: "Ut" },
        { text: "Nein", next: "tex1" },
      ],
    },
    tex2a: {
      question: "Wie verhält sich der Boden weiter?",
      options: [
        {
          text: "sehr sandig (>60%), bindig, formbar, haftet deutlich am Finger",
          next: "St",
        },
        {
          text: "sandig (25-68%), bindig, formbar, haftet deutlich am Finger",
          next: "Ls",
        },
      ],
    },
    tex2b: {
      question: "Wie verhält sich der Boden weiter?",
      options: [
        {
          text: "sehr sandig (>45%), etwas bindig, schwach formbar, haftet etwas am Finger",
          next: "Sl",
        },
        {
          text: "sandig (33-50%), etwas bindig, schwach formbar, haftet etwas am Finger",
          next: "Slu",
        },
        {
          text: "wenig sandig (18-35%), mehlig, etwas bindig, schwach formbar, haftet etwas am Finger",
          next: "Uls",
        },
      ],
    },
    tex3a: {
      question: "Der Boden ist mehlig und enthält wenig Sandkörner (<33%)",
      options: [
        { text: "Ja", next: "Lu" },
        { text: "Nein", next: "tex3" },
      ],
    },
    tex3ba: {
      question: "Wie verhält sich der Boden weiter?",
      options: [
        {
          text: "schwach zähplastisch, deutlich Sandkörner (40-75%)",
          next: "Ts3-4",
        },
        {
          text: "schwach zähplastisch, Sandkörner kaum sichtbar (<45%)",
          next: "Lt",
        },
        { text: "stark zähplastisch, kaum Sandkörner (<20%)", next: "Tu3-4" },
      ],
    },
    tex3bb: {
      question: "Wie verhält sich der Boden weiter?",
      options: [
        {
          text: "Sandkörner deutlich sicht- und fühlbar (25-60%)",
          next: "Lts",
        },
        {
          text: "zähplastisch, Sandkörner sicht- und fühlbar (20-55%)",
          next: "Ts2",
        },
        { text: "zähplastisch, kaum Sandkörner (<20%)", next: "Tu2" },
      ],
    },
    tex3bc: {
      question: "Wie verhält sich der Boden weiter?",
      options: [
        {
          text: "zähplastisch, kaum Sandkörner sicht- und fühlbar (5-40%), knirscht zwischen den Zähnen",
          next: "Tl",
        },
        {
          text: "zähplastisch, kaum Sandkörner sicht- und fühlbar (<35%), butterartige Konsistenz, mm-dünn ausrollbar",
          next: "Tt",
        },
      ],
    },
    Ss: leaf("Ss", "Reinsand", Q),
    Su: leaf("Su", "Schluffiger Sand", Q),
    Us: leaf("Us", "Sandiger Schluff", Q),
    Uu: leaf("Uu", "Reinschluff", Q),
    Ut: leaf("Ut", "Toniger Schluff", Q),
    St: leaf("St", "Toniger Sand", Q),
    Ls: leaf("Ls", "Sandiger Lehm", Q),
    Sl: leaf("Sl", "Lehmiger Sand", Q),
    Slu: leaf("Slu", "Schluffig-lehmiger Sand", Q),
    Uls: leaf("Uls", "Sandig-lehmiger Schluff", Q),
    Lu: leaf("Lu", "Schluffiger Lehm", Q),
    "Ts3-4": leaf("Ts3-4", "Sehr sandiger Ton", Q),
    Lt: leaf("Lt", "Toniger Lehm", Q),
    "Tu3-4": leaf("Tu3-4", "Sehr schluffiger Ton", Q),
    Lts: leaf("Lts", "Sandig-toniger Lehm", Q),
    Ts2: leaf("Ts2", "Sandiger Ton", Q),
    Tu2: leaf("Tu2", "Schluffiger Ton", Q),
    Tl: leaf("Tl", "Lehmiger Ton", Q),
    Tt: leaf("Tt", "Reinton", Q),
  },
};
