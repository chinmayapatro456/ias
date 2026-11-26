/* Geography Optional PYQ dataset.
 * Schema is consumed by assets/js/optional.js as window.PYQ_DATA.
 * Questions array is intentionally empty until verified PYQs are entered;
 * this avoids presenting invented questions as actual UPSC past questions.
 */
window.PYQ_DATA = {
  metadata: {
    title: "UPSC Geography Optional — Paper I & Paper II",
    years: { start: 1986, end: 2026 },
    paper1Topics: [
      "Geomorphology",
      "Climatology",
      "Oceanography",
      "Biogeography",
      "Environmental Geography",
      "Perspectives in Human Geography",
      "Economic Geography",
      "Population and Settlement Geography",
      "Regional Planning",
      "Models, Theories and Laws"
    ],
    paper2Topics: [
      "Physical Setting",
      "Resources",
      "Agriculture",
      "Industry",
      "Transport, Communication and Trade",
      "Cultural Setting",
      "Settlements",
      "Regional Development and Planning",
      "Political Aspects",
      "Contemporary Issues"
    ],
    paper1: [
      "Geomorphology","Climatology","Oceanography","Biogeography","Environmental Geography",
      "Perspectives in Human Geography","Economic Geography","Population and Settlement Geography",
      "Regional Planning","Models, Theories and Laws"
    ],
    paper2: [
      "Physical Setting","Resources","Agriculture","Industry","Transport, Communication and Trade",
      "Cultural Setting","Settlements","Regional Development and Planning","Political Aspects","Contemporary Issues"
    ],
    mappingTopics: ["Mapping"]
  },
  questions: []
};