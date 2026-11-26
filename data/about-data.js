/* ==========================================================================
   About — UPSC Civil Services Examination reference data
   Every figure below is taken from UPSC's own documents (cut-off notices,
   final-result press notes, annual calendar) and PIB releases. Update the
   `updated` string whenever a number changes.
   ========================================================================== */

window.ABOUT_DATA = {
  updated: "27 November 2026",

  /* One complete cycle, stage by stage. CSE 2025 — the last cycle whose
     final list is out. Sources: PIB prelims release (24 May 2025 data),
     UPSC Mains-qualified press note, interview shortlist, final result. */
  funnel: {
    year: 2025,
    stages: [
      { label: "Applied", value: 950000, display: "≈ 9.5 lakh", note: "applications received" },
      { label: "Appeared", value: 580000, display: "≈ 5.8 lakh", note: "≈ 61% actually sat the paper" },
      { label: "Cleared Prelims", value: 14161, display: "14,161", note: "qualified for Mains" },
      { label: "Called for interview", value: 2736, display: "2,736", note: "≈ 2.5× the vacancies" },
      { label: "Recommended", value: 958, display: "958", note: "final list, against 1,087 vacancies" }
    ]
  },

  /* General-category cut-off at all three stages, 2015–2025.
     Prelims is out of 200 (GS Paper-I only). Mains is out of 1750.
     Final is out of 2025. */
  trend: {
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    stages: {
      prelims: {
        label: "Prelims",
        max: 200,
        unit: "marks out of 200",
        values: [107.34, 116, 105.34, 98, 98, 92.51, 87.54, 88.22, 75.41, 87.98, 92.66]
      },
      mains: {
        label: "Mains",
        max: 1750,
        unit: "marks out of 1750",
        values: [676, 787, 809, 774, 751, 736, 745, 748, 741, 729, 739]
      },
      final: {
        label: "Final",
        max: 2025,
        unit: "marks out of 2025",
        values: [877, 988, 1006, 982, 961, 944, 953, 960, 953, 947, 963]
      }
    }
  },

  /* Category-wise cut-offs, the last two cycles. Order: General, EWS, OBC,
     SC, ST — the five categories UPSC reports in every notice. */
  categories: {
    names: ["General", "EWS", "OBC", "SC", "ST"],
    years: ["2025", "2024"],
    stages: {
      prelims: { label: "Prelims", max: 200, unit: "out of 200" },
      mains: { label: "Mains", max: 1750, unit: "out of 1750" },
      final: { label: "Final", max: 2025, unit: "out of 2025" }
    },
    values: {
      "2025": {
        prelims: [92.66, 89.34, 92, 84, 82.66],
        mains: [739, 706, 717, 700, 694],
        final: [963, 926, 931, 905, 902]
      },
      "2024": {
        prelims: [87.98, 85.92, 87.28, 79.03, 74.23],
        mains: [729, 696, 702, 685, 684],
        final: [947, 917, 910, 880, 884]
      }
    }
  },

  /* Vacancies reported at the final result, and the number of candidates
     UPSC actually recommended. 2026 shows the notice's estimate only. */
  vacancies: [
    { year: 2015, final: 1164, recommended: 1078 },
    { year: 2016, final: 1209, recommended: 1099 },
    { year: 2017, final: 1058, recommended: 990 },
    { year: 2018, final: 812, recommended: 759 },
    { year: 2019, final: 927, recommended: 829 },
    { year: 2020, final: 836, recommended: 761 },
    { year: 2021, final: 749, recommended: 685 },
    { year: 2022, final: 1022, recommended: 933 },
    { year: 2023, final: 1143, recommended: 1016 },
    { year: 2024, final: 1129, recommended: 1009 },
    { year: 2025, final: 1087, recommended: 958 },
    { year: 2026, final: null, recommended: null, notified: 1016 }
  ],

  /* CSE 2025 vacancies by service group, as reported in UPSC's final note. */
  services: {
    year: 2025,
    total: 1087,
    groups: [
      { name: "IAS", value: 180 },
      { name: "IFS", value: 55 },
      { name: "IPS", value: 150 },
      { name: "Central Group A", value: 507 },
      { name: "Group B", value: 195 }
    ]
  },

  /* The paper-by-paper architecture. `merit: false` papers are qualifying. */
  papers: [
    { stage: "Prelims", name: "GS Paper I", marks: 200, merit: true, note: "100 questions · 2 hours · decides the cut-off" },
    { stage: "Prelims", name: "CSAT (GS Paper II)", marks: 200, merit: false, note: "80 questions · 2 hours · qualifying at 33%" },
    { stage: "Mains", name: "Essay", marks: 250, merit: true, note: "2 essays" },
    { stage: "Mains", name: "GS I", marks: 250, merit: true, note: "History, culture, geography, society" },
    { stage: "Mains", name: "GS II", marks: 250, merit: true, note: "Polity, governance, IR" },
    { stage: "Mains", name: "GS III", marks: 250, merit: true, note: "Economy, science, environment, security" },
    { stage: "Mains", name: "GS IV", marks: 250, merit: true, note: "Ethics, integrity, aptitude" },
    { stage: "Mains", name: "Optional I", marks: 250, merit: true, note: "Your optional subject" },
    { stage: "Mains", name: "Optional II", marks: 250, merit: true, note: "Your optional subject" },
    { stage: "Mains", name: "Indian language", marks: 300, merit: false, note: "Qualifying at 25% · 22 scheduled languages" },
    { stage: "Mains", name: "English", marks: 300, merit: false, note: "Qualifying at 25%" },
    { stage: "Interview", name: "Personality Test", marks: 275, merit: true, note: "Board of 2–3 members, ~30 minutes" }
  ],

  /* Optional subjects offered (each with Paper I and Paper II of 250 marks). */
  optionalSubjects: [
    "Agriculture", "Animal Husbandry & Veterinary Science", "Anthropology", "Botany",
    "Chemistry", "Civil Engineering", "Commerce & Accountancy", "Economics",
    "Electrical Engineering", "Geography", "Geology", "History", "Law", "Management",
    "Mathematics", "Mechanical Engineering", "Medical Science", "Philosophy", "Physics",
    "Political Science & International Relations", "Psychology", "Public Administration",
    "Sociology", "Statistics", "Zoology"
  ],

  /* The CSE 2027 cycle, from UPSC's annual calendar (published 20 May 2026). */
  calendar: {
    year: 2027,
    steps: [
      { date: "13 Jan 2027", title: "Notification", detail: "CSE 2027 notice out; applications open on upsconline.nic.in" },
      { date: "2 Feb 2027", title: "Applications close", detail: "Last date to submit the online form (6:00 PM)" },
      { date: "23 May 2027", title: "Prelims", detail: "GS Paper I in the morning, CSAT in the afternoon" },
      { date: "Aug 2027", title: "Mains", detail: "Begins 20 August 2027, runs across five days" },
      { date: "Jan–Apr 2028", title: "Interview", detail: "Personality tests at Dholpur House, New Delhi" },
      { date: "Apr–May 2028", title: "Final result", detail: "Rank list, service allocation and reserve list" }
    ]
  },

  /* Where the cycle stands today — edit this block as results come in. */
  status: {
    headline: "CSE 2026 is at the interview stage",
    detail: "Mains results were declared on 5 November 2026 and the interview schedule went up on 17 November. Personality tests run from January to April 2027, with the final result expected in April–May 2027.",
    facts: [
      { label: "CSE 2026 notified vacancies", value: "1,016" },
      { label: "Qualified for Mains 2026", value: "13,343" },
      { label: "Applied for Prelims 2026", value: "8,19,732" },
      { label: "Appeared for Prelims 2026", value: "≈ 5.49 lakh" }
    ]
  }
};
