#!/usr/bin/env python3
"""
Converts your uploaded UPSC Syllabus HTML files into data/syllabus-data.js
exporting window.SYLLABUS_DATA in the exact schema used by syllabus.js & home.js.

Usage (Python 3, no external packages required):
  python3 convert_syllabus.py "index (1).html" "index.html" data/syllabus-data.js
"""

import json
import os
import re
import sys
from html.parser import HTMLParser


class SimpleOutlineParser(HTMLParser):
    """Extracts headings (h2-h4) and list items (li) in document order."""
    def __init__(self):
        super().__init__()
        self.items = []
        self._tag = None
        self._buf = []

    def handle_starttag(self, tag, attrs):
        if tag in ("h1", "h2", "h3", "h4", "li"):
            self._tag = tag
            self._buf = []

    def handle_data(self, data):
        if self._tag:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag == self._tag:
            text = re.sub(r"\s+", " ", "".join(self._buf)).strip()
            if text:
                self.items.append((tag, text))
            self._tag = None
            self._buf = []


def slugify(text, fallback="item"):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:48] or fallback


def parse_html_into_units(filepath, prefix):
    if not filepath or not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        parser = SimpleOutlineParser()
        parser.feed(f.read())

    units = []
    current_unit = None
    u_idx = 0
    for tag, text in parser.items:
        if tag in ("h2", "h3", "h4"):
            u_idx += 1
            current_unit = {
                "id": f"{prefix}-u{u_idx}",
                "title": text,
                "topics": []
            }
            units.append(current_unit)
        elif tag == "li":
            if current_unit is None:
                u_idx += 1
                current_unit = {"id": f"{prefix}-u{u_idx}", "title": "Core Topics", "topics": []}
                units.append(current_unit)
            t_idx = len(current_unit["topics"]) + 1
            current_unit["topics"].append({
                "id": f"{current_unit['id']}-t{t_idx}-{slugify(text)[:18]}",
                "title": text
            })

    return [u for u in units if u["topics"]]


def build_default_optional_papers():
    p1_units = [
        ("Geomorphology", ["Factors controlling landform development; endogenetic and exogenetic forces", "Origin and evolution of the earth's crust; Geosynclines; Continental drift; Plate tectonics", "Vulcanicity; Earthquakes and Tsunamis; Concepts of geomorphic cycles and Landscape development", "Denudation chronology; Channel morphology; Erosion surfaces; Slope development; Applied Geomorphology"]),
        ("Climatology", ["Temperature and pressure belts of the world; Heat budget of the earth; Atmospheric circulation", "Monsoons and Jet streams; Air masses and Frontogenesis; Temperate and tropical cyclones", "Types and distribution of precipitation; Weather and Climate; Koppen's, Thornthwaite's and Trewartha's classification", "Hydrological cycle; Global climatic change and role and response of man in climatic changes; Applied climatology"]),
        ("Oceanography", ["Bottom topography of the Atlantic, Indian and Pacific Oceans", "Temperature and salinity of the oceans; Heat and salt budgets; Ocean deposits", "Waves, currents and tides; Marine resources: biotic, mineral and energy resources", "Coral reefs, coral bleaching; Sea-level changes; Law of the sea and marine pollution"]),
        ("Biogeography", ["Genesis of soils; Classification and distribution of soils; Soil profile; Soil erosion, degradation and conservation", "Factors influencing world distribution of plants and animals; Problems of deforestation and conservation measures", "Social forestry; Agro-forestry; Wild life; Major gene pool centres"]),
        ("Environmental Geography", ["Principle of ecology; Human ecological adaptations; Influence of man on ecology and environment", "Global and regional ecological changes and imbalances; Ecosystem management and conservation", "Environmental degradation, management and conservation; Biodiversity and sustainable development", "Environmental policy; Environmental hazards and remedial measures; Environmental education and legislation"]),
        ("Perspectives in Human Geography", ["Areal differentiation; Regional synthesis; Dichotomy and dualism; Environmentalism", "Quantitative revolution and locational analysis; Radical, behavioural, human and welfare approaches", "Languages, religions and secularisation; Cultural regions of the world; Human development index"]),
        ("Economic Geography", ["World economic development: measurement and problems; World resources and their distribution; Energy crisis", "Limits to growth; World agriculture: typology of agricultural regions; Agricultural inputs and productivity", "Food and nutrition problems; Food security; Famine: causes, effects and remedies", "World industries: locational patterns and problems; Patterns of world trade"]),
        ("Population and Settlement Geography", ["Growth and distribution of world population; Demographic attributes; Causes and consequences of migration", "Concepts of over-under-and optimum population; Population theories, world population problems and policies", "Types and patterns of rural settlements; Environmental issues in rural settlements", "Hierarchy of urban settlements; Urban morphology; Concept of primate city and rank-size rule; Functional classification of towns", "Sphere of urban influence; Rural-urban fringe; Satellite towns; Problems and remedies of urbanization; Sustainable development of cities"]),
        ("Regional Planning", ["Concept of a region; Types of regions and methods of regionalisation", "Growth centres and growth poles; Regional imbalances; Regional development strategies", "Environmental issues in regional planning; Planning for sustainable development"]),
        ("Models, Theories and Laws in Human Geography", ["System analysis in Human geography; Malthusian, Marxian and Demographic Transition models", "Central Place theories of Christaller and Losch; Perroux and Boudeville; Von Thunen's model of agricultural location", "Weber's model of industrial location; Ostov's model of stages of growth; Heartland and Rimland theories; Laws of international boundaries and frontiers"])
    ]
    p2_units = [
        ("Physical Setting", ["Space relationship of India with neighbouring countries; Structure and relief; Drainage system and watersheds", "Physiographic regions; Mechanism of Indian monsoons and rainfall patterns; Tropical cyclones and western disturbances", "Floods and droughts; Climatic regions; Natural vegetation; Soil types and their distributions"]),
        ("Resources", ["Land, surface and ground water, energy, minerals, biotic and marine resources", "Forest and wild life resources and their conservation; Energy crisis"]),
        ("Agriculture", ["Infrastructure: irrigation, seeds, fertilizers, power; Institutional factors: land holdings, land tenure and land reforms", "Cropping pattern, agricultural productivity, agricultural intensity, crop combination, land capability", "Agro and social-forestry; Green revolution and its socio-economic and ecological implications", "Significance of dry farming; Livestock resources and white revolution; Aqua-culture; Sericulture, apiculture and poultry; Agricultural regionalisation; Agro-climatic zones; Agro-ecological regions"]),
        ("Industry", ["Evolution of industries; Locational factors of cotton, jute, textile, iron and steel, aluminium, fertilizer, paper, chemical, pharmaceutical, automobile, cottage and agro-based industries", "Industrial houses and complexes including public sector undertakings; Industrial regionalisation; New industrial policies", "Multinationals and liberalisation; Special Economic Zones; Tourism including eco-tourism"]),
        ("Transport, Communication and Trade", ["Road, railway, waterway, airway and pipeline networks and their complementary roles in regional development", "Growing importance of ports on national and foreign trade; Trade balance; Trade policy; Export processing zones", "Developments in communication and information technology and their impacts on economy and society; Indian space programme"]),
        ("Cultural Setting", ["Historical perspective of Indian society; Racial, linguistic and ethnic diversities; Religious minorities", "Major tribes, tribal areas and their problems; Cultural regions", "Growth, distribution and density of population; Demographic attributes: sex-ratio, age structure, literacy rate, work-force, dependency ratio, longevity", "Migration (inter-regional, intra-regional and international) and associated problems; Population problems and policies; Health indicators"]),
        ("Settlements", ["Types, patterns and morphology of rural settlements; Urban developments; Morphology of Indian cities", "Functional classification of Indian cities; Conurbations and metropolitan regions; Urban sprawl", "Slums and associated problems; Town planning; Problems of urbanisation and remedies"]),
        ("Regional Development and Planning", ["Experience of regional planning in India; Five Year Plans; Integrated rural development programmes", "Panchayati Raj and decentralised planning; Command area development; Watershed management", "Planning for backward area, desert, drought-prone, hill, tribal area development; Multi-level planning; Regional planning and development of island territories"]),
        ("Political Aspects", ["Geographical basis of Indian federalism; State reorganisation; Emergence of new states", "Regional consciousness and inter-state issues; International boundary of India and related issues", "Cross-border terrorism; India's role in world affairs; Geopolitics of South Asia and Indian Ocean realm"]),
        ("Contemporary Issues", ["Ecological issues: environmental hazards—landslides, earthquakes, tsunamis, floods and droughts, epidemics", "Issues relating to environmental pollution; Changes in patterns of land use; Principles of environmental impact assessment and environmental management", "Population explosion and food security; Environmental degradation; Deforestation, desertification and soil erosion", "Problems of agrarian and industrial unrest; Regional disparities in economic development; Concept of sustainable growth and development; Environmental awareness; Linkage of rivers; Globalisation and Indian economy"])
    ]

    def to_units(raw, prefix):
        out = []
        for ui, (title, topics) in enumerate(raw, 1):
            out.append({
                "id": f"{prefix}-u{ui}",
                "title": f"{ui}. {title}",
                "topics": [{"id": f"{prefix}-u{ui}-t{ti}", "title": t} for ti, t in enumerate(topics, 1)]
            })
        return out

    return [
        {"id": "opt-geo-p1", "code": "Optional Paper I", "title": "Principles of Geography", "marks": "250 Marks · 3 Hours", "units": to_units(p1_units, "opt-p1")},
        {"id": "opt-geo-p2", "code": "Optional Paper II", "title": "Geography of India", "marks": "250 Marks · 3 Hours", "units": to_units(p2_units, "opt-p2")}
    ]


def build_syllabus(cse_html_path, opt_html_path):
    cse_units = parse_html_into_units(cse_html_path, "cse")
    opt_units = parse_html_into_units(opt_html_path, "opt")

    def pick(keywords, fallback_units):
        matched = [u for u in cse_units if any(k in u["title"].lower() for k in keywords)]
        return matched if matched else fallback_units

    data = {
        "updated": "UPSC CSE Official Syllabus (Prelims, Mains & Geography Optional)",
        "stages": [
            {
                "id": "prelims",
                "title": "Prelims",
                "subtitle": "Objective Screening · 400 Marks (GS I + Qualifying CSAT)",
                "papers": [
                    {
                        "id": "pre-gs1",
                        "code": "GS Paper I",
                        "title": "General Studies Paper I",
                        "marks": "200 Marks · 2 Hours",
                        "units": pick(["prelim", "general studies paper i", "gs paper i"], [
                            {"id": "pre-gs1-u1", "title": "Core Prelims GS I Areas", "topics": [
                                {"id": "pre-gs1-u1-t1", "title": "Current events of national and international importance"},
                                {"id": "pre-gs1-u1-t2", "title": "History of India and Indian National Movement"},
                                {"id": "pre-gs1-u1-t3", "title": "Indian and World Geography — Physical, Social, Economic Geography of India and the World"},
                                {"id": "pre-gs1-u1-t4", "title": "Indian Polity and Governance — Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues"},
                                {"id": "pre-gs1-u1-t5", "title": "Economic and Social Development — Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives"},
                                {"id": "pre-gs1-u1-t6", "title": "General issues on Environmental ecology, Bio-diversity and Climate Change"},
                                {"id": "pre-gs1-u1-t7", "title": "General Science"}
                            ]}
                        ])
                    },
                    {
                        "id": "pre-csat",
                        "code": "GS Paper II (CSAT)",
                        "title": "Civil Services Aptitude Test (Qualifying 33%)",
                        "marks": "200 Marks · 2 Hours",
                        "units": pick(["csat", "aptitude"], [
                            {"id": "pre-csat-u1", "title": "CSAT Core Skills", "topics": [
                                {"id": "pre-csat-u1-t1", "title": "Comprehension"},
                                {"id": "pre-csat-u1-t2", "title": "Interpersonal skills including communication skills"},
                                {"id": "pre-csat-u1-t3", "title": "Logical reasoning and analytical ability"},
                                {"id": "pre-csat-u1-t4", "title": "Decision making and problem solving"},
                                {"id": "pre-csat-u1-t5", "title": "General mental ability"},
                                {"id": "pre-csat-u1-t6", "title": "Basic numeracy and Data interpretation (Class X level)"}
                            ]}
                        ])
                    }
                ]
            },
            {
                "id": "mains",
                "title": "Mains",
                "subtitle": "Written Examination · Essay & General Studies Papers I–IV",
                "papers": [
                    {
                        "id": "mains-essay",
                        "code": "Essay",
                        "title": "Essay Paper",
                        "marks": "250 Marks · 3 Hours",
                        "units": [
                            {"id": "mains-essay-u1", "title": "Essay Composition", "topics": [
                                {"id": "mains-essay-u1-t1", "title": "Section A — Philosophical, ethical & reflective themes"},
                                {"id": "mains-essay-u1-t2", "title": "Section B — Socio-economic, governance & global issues"}
                            ]}
                        ]
                    },
                    {
                        "id": "mains-gs1",
                        "code": "GS I",
                        "title": "Indian Heritage & Culture, History & Geography of the World and Society",
                        "marks": "250 Marks · 3 Hours",
                        "units": pick(["gs i", "gs-1", "heritage", "history", "society"], [
                            {"id": "mains-gs1-u1", "title": "Culture, History, Society & Geography", "topics": [
                                {"id": "mains-gs1-u1-t1", "title": "Indian culture — Art Forms, Literature and Architecture from ancient to modern times"},
                                {"id": "mains-gs1-u1-t2", "title": "Modern Indian history from mid-18th century to present; Freedom Struggle"},
                                {"id": "mains-gs1-u1-t3", "title": "Post-independence consolidation and reorganisation within the country"},
                                {"id": "mains-gs1-u1-t4", "title": "History of the world from 18th century (Industrial Revolution, World Wars, Decolonisation)"},
                                {"id": "mains-gs1-u1-t5", "title": "Salient features of Indian Society, Diversity of India, Role of women, Urbanisation, Globalisation"},
                                {"id": "mains-gs1-u1-t6", "title": "World's physical geography, key natural resources, geophysical phenomena"}
                            ]}
                        ])
                    },
                    {
                        "id": "mains-gs2",
                        "code": "GS II",
                        "title": "Governance, Constitution, Polity, Social Justice & International Relations",
                        "marks": "250 Marks · 3 Hours",
                        "units": pick(["gs ii", "gs-2", "polity", "governance", "international"], [
                            {"id": "mains-gs2-u1", "title": "Polity, Governance, Social Justice & IR", "topics": [
                                {"id": "mains-gs2-u1-t1", "title": "Indian Constitution — historical underpinnings, evolution, features, amendments, basic structure"},
                                {"id": "mains-gs2-u1-t2", "title": "Functions and responsibilities of the Union and States; Federal structure; Separation of powers"},
                                {"id": "mains-gs2-u1-t3", "title": "Parliament and State Legislatures; Executive and Judiciary; Statutory & regulatory bodies"},
                                {"id": "mains-gs2-u1-t4", "title": "Welfare schemes, social sector (Health, Education, Human Resources), Poverty and hunger"},
                                {"id": "mains-gs2-u1-t5", "title": "Governance, transparency, accountability, e-governance, Citizen's Charters, Civil services"},
                                {"id": "mains-gs2-u1-t6", "title": "India and its neighbourhood; Bilateral, regional and global groupings; Indian diaspora"}
                            ]}
                        ])
                    },
                    {
                        "id": "mains-gs3",
                        "code": "GS III",
                        "title": "Technology, Economic Development, Biodiversity, Environment, Security & Disaster Management",
                        "marks": "250 Marks · 3 Hours",
                        "units": pick(["gs iii", "gs-3", "economy", "environment", "security", "disaster"], [
                            {"id": "mains-gs3-u1", "title": "Economy, Agriculture, Science, Environment & Security", "topics": [
                                {"id": "mains-gs3-u1-t1", "title": "Indian Economy — planning, mobilisation of resources, growth, development, inclusive growth, budgeting"},
                                {"id": "mains-gs3-u1-t2", "title": "Major crops, irrigation, agricultural marketing, MSP, e-technology, food processing, land reforms"},
                                {"id": "mains-gs3-u1-t3", "title": "Infrastructure (Energy, Ports, Roads, Airports, Railways) and Investment models"},
                                {"id": "mains-gs3-u1-t4", "title": "Science and Technology — developments, indigenisation, IT, Space, Biotech, IPR"},
                                {"id": "mains-gs3-u1-t5", "title": "Conservation, environmental pollution and degradation, EIA, Disaster management"},
                                {"id": "mains-gs3-u1-t6", "title": "Internal security — extremism, cyber security, money-laundering, border management"}
                            ]}
                        ])
                    },
                    {
                        "id": "mains-gs4",
                        "code": "GS IV",
                        "title": "Ethics, Integrity & Aptitude",
                        "marks": "250 Marks · 3 Hours",
                        "units": pick(["gs iv", "gs-4", "ethics", "integrity"], [
                            {"id": "mains-gs4-u1", "title": "Ethics Theory & Case Studies", "topics": [
                                {"id": "mains-gs4-u1-t1", "title": "Ethics and Human Interface — essence, determinants, consequences, human values"},
                                {"id": "mains-gs4-u1-t2", "title": "Attitude, Aptitude and foundational values for Civil Service; Emotional intelligence"},
                                {"id": "mains-gs4-u1-t3", "title": "Contributions of moral thinkers and philosophers from India and the world"},
                                {"id": "mains-gs4-u1-t4", "title": "Public/Civil service values and Ethics in Public administration"},
                                {"id": "mains-gs4-u1-t5", "title": "Probity in Governance — RTI, Codes of Ethics, Citizen's Charters, Work culture, Corruption"},
                                {"id": "mains-gs4-u1-t6", "title": "Case Studies on the above issues"}
                            ]}
                        ])
                    }
                ]
            },
            {
                "id": "optional",
                "title": "Optional (Geography)",
                "subtitle": "Geography Paper I & Paper II · 500 Marks",
                "papers": build_default_optional_papers() if len(opt_units) < 4 else [
                    {"id": "opt-geo-p1", "code": "Optional Paper I", "title": "Principles of Geography", "marks": "250 Marks · 3 Hours", "units": opt_units[:10]},
                    {"id": "opt-geo-p2", "code": "Optional Paper II", "title": "Geography of India", "marks": "250 Marks · 3 Hours", "units": opt_units[10:]}
                ]
            }
        ]
    }
    return data


def main():
    cse_html = sys.argv[1] if len(sys.argv) > 1 else "index (1).html"
    opt_html = sys.argv[2] if len(sys.argv) > 2 else "index.html"
    out_path = sys.argv[3] if len(sys.argv) > 3 else os.path.join("data", "syllabus-data.js")

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    payload = build_syllabus(cse_html, opt_html)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated by convert_syllabus.py */\n")
        f.write("window.SYLLABUS_DATA = ")
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    total = sum(
        len(u["topics"])
        for s in payload["stages"]
        for p in s["papers"]
        for u in p["units"]
    )
    print(f"Wrote {out_path} with {total} syllabus topics across 3 stages.")


if __name__ == "__main__":
    main()