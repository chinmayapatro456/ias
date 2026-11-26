/* ==========================================================================
   Syllabus dataset — UPSC Civil Services Examination
   Prelims (GS I + CSAT), Mains (Essay + GS I–IV) and Geography Optional
   (Paper VI & VII). Consumed by assets/js/syllabus.js as window.SYLLABUS_DATA
   and by assets/js/home.js for the desk inventory count.

   Source: the syllabus pages of this study desk (the cartographer's Geography
   optional chart and the complete UPSC syllabus page). Optional unit ids
   (P1-01…P2-10) match the topic ids used in data/optional-data.js, so PYQ
   counts and syllabus ticks line up unit by unit.

   Schema
     SYLLABUS_DATA.stages[]            { id, title, subtitle, papers[] }
     stage.papers[]                    { id, code, title, marks, units[] }
     paper.units[]                     { id, title, topics[] }
     unit.topics[]                     { id, title }
   ========================================================================== */

window.SYLLABUS_DATA = {
  "metadata": {
    "title": "UPSC CSE Syllabus — Prelims, Mains & Geography Optional",
    "source": "Compiled from the UPSC CSE syllabus pages of the study desk (index.html, index_1.html)",
    "papers": 9,
    "units": 37,
    "totalTopics": 227
  },
  "stages": [
    {
      "id": "prelims",
      "title": "Preliminary Examination",
      "subtitle": "Two objective papers, 400 marks — a screening test only.",
      "papers": [
        {
          "id": "prelims-p1",
          "code": "Paper I",
          "title": "General Studies I",
          "marks": "200 marks",
          "subtitle": "",
          "units": [
            {
              "id": "prelims-p1-u1",
              "title": "Syllabus",
              "topics": [
                {
                  "id": "prelims-p1-u1-t01",
                  "title": "Current events of national and international importance."
                },
                {
                  "id": "prelims-p1-u1-t02",
                  "title": "History of India and Indian National Movement."
                },
                {
                  "id": "prelims-p1-u1-t03",
                  "title": "Indian and World Geography — Physical, Social, Economic Geography of India and the World."
                },
                {
                  "id": "prelims-p1-u1-t04",
                  "title": "Indian Polity and Governance — Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, etc."
                },
                {
                  "id": "prelims-p1-u1-t05",
                  "title": "Economic and Social Development — Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives, etc."
                },
                {
                  "id": "prelims-p1-u1-t06",
                  "title": "General issues on Environmental ecology, Bio-diversity and Climate Change — that do not require subject specialization."
                },
                {
                  "id": "prelims-p1-u1-t07",
                  "title": "General Science."
                }
              ]
            }
          ]
        },
        {
          "id": "prelims-p2",
          "code": "Paper II",
          "title": "CSAT",
          "marks": "200 marks",
          "subtitle": "",
          "units": [
            {
              "id": "prelims-p2-u1",
              "title": "Syllabus",
              "topics": [
                {
                  "id": "prelims-p2-u1-t01",
                  "title": "Comprehension."
                },
                {
                  "id": "prelims-p2-u1-t02",
                  "title": "Interpersonal skills including communication skills."
                },
                {
                  "id": "prelims-p2-u1-t03",
                  "title": "Logical reasoning and analytical ability."
                },
                {
                  "id": "prelims-p2-u1-t04",
                  "title": "Decision making and problem solving."
                },
                {
                  "id": "prelims-p2-u1-t05",
                  "title": "General mental ability."
                },
                {
                  "id": "prelims-p2-u1-t06",
                  "title": "Basic numeracy (numbers and their relations, orders of magnitude, etc.) (Class X level), Data interpretation (charts, graphs, tables, data sufficiency etc. — Class X level)."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mains",
      "title": "Main Examination",
      "subtitle": "Essay and General Studies I–IV, 1,250 marks counted for merit.",
      "papers": [
        {
          "id": "mains-p1",
          "code": "Paper I",
          "title": "Essay",
          "marks": "250 marks",
          "subtitle": "",
          "units": [
            {
              "id": "mains-p1-u1",
              "title": "Syllabus",
              "topics": [
                {
                  "id": "mains-p1-u1-t01",
                  "title": "Candidates may be required to write essays on multiple topics. They will be expected to keep closely to the subject of the essay to arrange their ideas in orderly fashion, and to write concisely."
                },
                {
                  "id": "mains-p1-u1-t02",
                  "title": "Credit will be given for effective and exact expression."
                }
              ]
            }
          ]
        },
        {
          "id": "mains-p2",
          "code": "Paper II",
          "title": "General Studies I",
          "marks": "250 marks",
          "subtitle": "Indian Heritage & Culture, History and Geography of the World and Society",
          "units": [
            {
              "id": "mains-p2-u1",
              "title": "Indian Culture & History",
              "topics": [
                {
                  "id": "mains-p2-u1-t01",
                  "title": "Salient aspects of Art Forms, literature and Architecture from ancient to modern times."
                },
                {
                  "id": "mains-p2-u1-t02",
                  "title": "Modern Indian history from mid-18th century until present — significant events, personalities, issues."
                },
                {
                  "id": "mains-p2-u1-t03",
                  "title": "The Freedom Struggle — its various stages and important contributors/contributions."
                },
                {
                  "id": "mains-p2-u1-t04",
                  "title": "Post-independence consolidation and reorganization within the country."
                }
              ]
            },
            {
              "id": "mains-p2-u2",
              "title": "World History",
              "topics": [
                {
                  "id": "mains-p2-u2-t01",
                  "title": "Events from 18th century: industrial revolution, world wars, redrawal of boundaries, colonization, decolonization."
                },
                {
                  "id": "mains-p2-u2-t02",
                  "title": "Political philosophies like communism, capitalism, socialism etc. — their forms and effect on the society."
                }
              ]
            },
            {
              "id": "mains-p2-u3",
              "title": "Society",
              "topics": [
                {
                  "id": "mains-p2-u3-t01",
                  "title": "Salient features of Indian Society, Diversity of India."
                },
                {
                  "id": "mains-p2-u3-t02",
                  "title": "Role of women/organizations, population issues, poverty, urbanization, problems and remedies."
                },
                {
                  "id": "mains-p2-u3-t03",
                  "title": "Effects of globalization on Indian society."
                },
                {
                  "id": "mains-p2-u3-t04",
                  "title": "Social empowerment, communalism, regionalism & secularism."
                }
              ]
            },
            {
              "id": "mains-p2-u4",
              "title": "Geography",
              "topics": [
                {
                  "id": "mains-p2-u4-t01",
                  "title": "Salient features of world's physical geography."
                },
                {
                  "id": "mains-p2-u4-t02",
                  "title": "Distribution of key natural resources across the world; factors for location of primary, secondary, and tertiary sector industries."
                },
                {
                  "id": "mains-p2-u4-t03",
                  "title": "Important Geophysical phenomena (earthquakes, Tsunami, Volcanic activity, cyclone etc.), geographical features and their location-changes."
                }
              ]
            }
          ]
        },
        {
          "id": "mains-p3",
          "code": "Paper III",
          "title": "General Studies II",
          "marks": "250 marks",
          "subtitle": "Governance, Constitution, Polity, Social Justice and International Relations",
          "units": [
            {
              "id": "mains-p3-u1",
              "title": "Constitution & Polity",
              "topics": [
                {
                  "id": "mains-p3-u1-t01",
                  "title": "Indian Constitution — historical underpinnings, evolution, features, amendments, significant provisions and basic structure."
                },
                {
                  "id": "mains-p3-u1-t02",
                  "title": "Functions and responsibilities of the Union and States, issues and challenges pertaining to federal structure, devolution of powers and finances up to local levels."
                },
                {
                  "id": "mains-p3-u1-t03",
                  "title": "Separation of powers between various organs, dispute redressal mechanisms and institutions."
                },
                {
                  "id": "mains-p3-u1-t04",
                  "title": "Comparison of the Indian constitutional scheme with that of other countries."
                },
                {
                  "id": "mains-p3-u1-t05",
                  "title": "Parliament and State legislatures — structure, functioning, conduct of business, powers & privileges."
                },
                {
                  "id": "mains-p3-u1-t06",
                  "title": "Structure, organization and functioning of the Executive and the Judiciary — Ministries and Departments; pressure groups and formal/informal associations."
                },
                {
                  "id": "mains-p3-u1-t07",
                  "title": "Salient features of the Representation of People's Act."
                },
                {
                  "id": "mains-p3-u1-t08",
                  "title": "Appointment to various Constitutional posts, powers, functions and responsibilities."
                },
                {
                  "id": "mains-p3-u1-t09",
                  "title": "Statutory, regulatory and various quasi-judicial bodies."
                }
              ]
            },
            {
              "id": "mains-p3-u2",
              "title": "Social Justice & Governance",
              "topics": [
                {
                  "id": "mains-p3-u2-t01",
                  "title": "Government policies and interventions for development in various sectors."
                },
                {
                  "id": "mains-p3-u2-t02",
                  "title": "Development processes and industry — role of NGOs, SHGs, donors, charities."
                },
                {
                  "id": "mains-p3-u2-t03",
                  "title": "Welfare schemes for vulnerable sections; mechanisms, laws, institutions and Bodies constituted for their protection."
                },
                {
                  "id": "mains-p3-u2-t04",
                  "title": "Issues relating to development and management of Social Sector/Services relating to Health, Education, HR."
                },
                {
                  "id": "mains-p3-u2-t05",
                  "title": "Issues relating to poverty and hunger."
                },
                {
                  "id": "mains-p3-u2-t06",
                  "title": "Governance, transparency, e-governance applications, citizens charters, institutional measures."
                },
                {
                  "id": "mains-p3-u2-t07",
                  "title": "Role of civil services in a democracy."
                }
              ]
            },
            {
              "id": "mains-p3-u3",
              "title": "International Relations",
              "topics": [
                {
                  "id": "mains-p3-u3-t01",
                  "title": "India and its neighborhood — relations."
                },
                {
                  "id": "mains-p3-u3-t02",
                  "title": "Bilateral, regional and global groupings and agreements involving India and/or affecting India's interests."
                },
                {
                  "id": "mains-p3-u3-t03",
                  "title": "Effect of policies and politics of developed and developing countries on India's interests, Indian diaspora."
                },
                {
                  "id": "mains-p3-u3-t04",
                  "title": "Important International institutions, agencies and fora — their structure, mandate."
                }
              ]
            }
          ]
        },
        {
          "id": "mains-p4",
          "code": "Paper IV",
          "title": "General Studies III",
          "marks": "250 marks",
          "subtitle": "Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management",
          "units": [
            {
              "id": "mains-p4-u1",
              "title": "Economy & Agriculture",
              "topics": [
                {
                  "id": "mains-p4-u1-t01",
                  "title": "Indian Economy and issues relating to planning, mobilization, of resources, growth, development and employment."
                },
                {
                  "id": "mains-p4-u1-t02",
                  "title": "Inclusive growth and issues arising from it."
                },
                {
                  "id": "mains-p4-u1-t03",
                  "title": "Government Budgeting."
                },
                {
                  "id": "mains-p4-u1-t04",
                  "title": "Major crops — cropping patterns, different types of irrigation, storage, transport and marketing of agricultural produce; e-technology for farmers."
                },
                {
                  "id": "mains-p4-u1-t05",
                  "title": "Issues related to direct and indirect farm subsidies and minimum support prices; Public Distribution System; issues of buffer stocks and food security; Technology missions; economics of animal-rearing."
                },
                {
                  "id": "mains-p4-u1-t06",
                  "title": "Food processing and related industries in India — scope, location, supply chain management."
                },
                {
                  "id": "mains-p4-u1-t07",
                  "title": "Land reforms in India."
                },
                {
                  "id": "mains-p4-u1-t08",
                  "title": "Effects of liberalization on the economy, changes in industrial policy and their effects on industrial growth."
                },
                {
                  "id": "mains-p4-u1-t09",
                  "title": "Infrastructure: Energy, Ports, Roads, Airports, Railways etc."
                },
                {
                  "id": "mains-p4-u1-t10",
                  "title": "Investment models."
                }
              ]
            },
            {
              "id": "mains-p4-u2",
              "title": "Science & Environment",
              "topics": [
                {
                  "id": "mains-p4-u2-t01",
                  "title": "Science and Technology — developments and their applications and effects in everyday life."
                },
                {
                  "id": "mains-p4-u2-t02",
                  "title": "Achievements of Indians in science & technology; indigenization of technology and developing new technology."
                },
                {
                  "id": "mains-p4-u2-t03",
                  "title": "Awareness in the fields of IT, Space, Computers, robotics, nano-technology, bio-technology and issues relating to intellectual property rights."
                },
                {
                  "id": "mains-p4-u2-t04",
                  "title": "Conservation, environmental pollution and degradation, environmental impact assessment."
                },
                {
                  "id": "mains-p4-u2-t05",
                  "title": "Disaster and disaster management."
                }
              ]
            },
            {
              "id": "mains-p4-u3",
              "title": "Security",
              "topics": [
                {
                  "id": "mains-p4-u3-t01",
                  "title": "Linkages between development and spread of extremism."
                },
                {
                  "id": "mains-p4-u3-t02",
                  "title": "Role of external state and non-state actors in creating challenges to internal security."
                },
                {
                  "id": "mains-p4-u3-t03",
                  "title": "Challenges to internal security through communication networks, role of media and social networking sites, basics of cyber security; money-laundering and its prevention."
                },
                {
                  "id": "mains-p4-u3-t04",
                  "title": "Security challenges and their management in border areas — linkages of organized crime with terrorism."
                },
                {
                  "id": "mains-p4-u3-t05",
                  "title": "Various Security forces and agencies and their mandate."
                }
              ]
            }
          ]
        },
        {
          "id": "mains-p5",
          "code": "Paper V",
          "title": "General Studies IV",
          "marks": "250 marks",
          "subtitle": "Ethics, Integrity and Aptitude",
          "units": [
            {
              "id": "mains-p5-u1",
              "title": "Ethics & Human Interface",
              "topics": [
                {
                  "id": "mains-p5-u1-t01",
                  "title": "Essence, determinants and consequences of Ethics in human actions; dimensions of ethics; ethics — in private and public relationships."
                },
                {
                  "id": "mains-p5-u1-t02",
                  "title": "Human Values — lessons from the lives and teachings of great leaders, reformers and administrators; role of family, society and educational institutions in inculcating values."
                }
              ]
            },
            {
              "id": "mains-p5-u2",
              "title": "Attitude & Aptitude",
              "topics": [
                {
                  "id": "mains-p5-u2-t01",
                  "title": "Content, structure, function; its influence and relation with thought and behaviour; moral and political attitudes; social influence and persuasion."
                },
                {
                  "id": "mains-p5-u2-t02",
                  "title": "Aptitude and foundational values for Civil Service — integrity, impartiality and non-partisanship, objectivity, dedication to public service, empathy, tolerance and compassion towards the weaker sections."
                }
              ]
            },
            {
              "id": "mains-p5-u3",
              "title": "Emotional Intelligence & Thinkers",
              "topics": [
                {
                  "id": "mains-p5-u3-t01",
                  "title": "Emotional intelligence — concepts, and their utilities and application in administration and governance."
                },
                {
                  "id": "mains-p5-u3-t02",
                  "title": "Contributions of moral thinkers and philosophers from India and the world."
                }
              ]
            },
            {
              "id": "mains-p5-u4",
              "title": "Probity in Governance",
              "topics": [
                {
                  "id": "mains-p5-u4-t01",
                  "title": "Public/Civil Service Values & Ethics: Status and problems; ethical concerns and dilemmas; laws, rules, regulations and conscience as sources of ethical guidance; accountability and ethical governance."
                },
                {
                  "id": "mains-p5-u4-t02",
                  "title": "Concept of public service; Philosophical basis of governance and probity; Information sharing and transparency, RTI, Codes of Ethics/Conduct, Citizen's Charters, Work culture, Quality of service delivery, Utilization of public funds, challenges of corruption."
                },
                {
                  "id": "mains-p5-u4-t03",
                  "title": "Case Studies on above issues."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "optional",
      "title": "Geography Optional",
      "subtitle": "Papers VI & VII — Principles of Geography and Geography of India, 500 marks.",
      "papers": [
        {
          "id": "optional-p1",
          "code": "Paper I",
          "title": "Principles of Geography",
          "marks": "250 marks",
          "units": [
            {
              "id": "P1-01",
              "title": "Geomorphology",
              "topics": [
                {
                  "id": "P1-01-t01",
                  "title": "Factors controlling landform development"
                },
                {
                  "id": "P1-01-t02",
                  "title": "Endogenetic and exogenetic forces"
                },
                {
                  "id": "P1-01-t03",
                  "title": "Origin and evolution of the earth's crust"
                },
                {
                  "id": "P1-01-t04",
                  "title": "Fundamentals of geomagnetism; physical conditions of earth's interior"
                },
                {
                  "id": "P1-01-t05",
                  "title": "Geosynclines; Continental drift; Isostasy; Plate tectonics"
                },
                {
                  "id": "P1-01-t06",
                  "title": "Recent views on mountain building"
                },
                {
                  "id": "P1-01-t07",
                  "title": "Volcanicity; Earthquakes and Tsunamis"
                },
                {
                  "id": "P1-01-t08",
                  "title": "Concepts of geomorphic cycles and landscape development"
                },
                {
                  "id": "P1-01-t09",
                  "title": "Denudation chronology; Channel morphology"
                },
                {
                  "id": "P1-01-t10",
                  "title": "Erosion surfaces; Slope development"
                },
                {
                  "id": "P1-01-t11",
                  "title": "Applied Geomorphology; economic geology and environment"
                }
              ]
            },
            {
              "id": "P1-02",
              "title": "Climatology",
              "topics": [
                {
                  "id": "P1-02-t01",
                  "title": "Temperature and pressure belts of the world"
                },
                {
                  "id": "P1-02-t02",
                  "title": "Heat budget of the earth; Atmospheric circulation"
                },
                {
                  "id": "P1-02-t03",
                  "title": "Atmospheric stability and instability"
                },
                {
                  "id": "P1-02-t04",
                  "title": "Planetary and local winds; Monsoons and jet streams"
                },
                {
                  "id": "P1-02-t05",
                  "title": "Air masses and fronts"
                },
                {
                  "id": "P1-02-t06",
                  "title": "Temperate and tropical cyclones"
                },
                {
                  "id": "P1-02-t07",
                  "title": "Types and distribution of precipitation"
                },
                {
                  "id": "P1-02-t08",
                  "title": "Weather and Climate"
                },
                {
                  "id": "P1-02-t09",
                  "title": "Koppen's, Thornthwaite's and Trewartha's classifications of world climate"
                },
                {
                  "id": "P1-02-t10",
                  "title": "Hydrological cycle"
                },
                {
                  "id": "P1-02-t11",
                  "title": "Global climatic change and man's role in climatic changes"
                },
                {
                  "id": "P1-02-t12",
                  "title": "Applied climatology and Urban climate"
                }
              ]
            },
            {
              "id": "P1-03",
              "title": "Oceanography",
              "topics": [
                {
                  "id": "P1-03-t01",
                  "title": "Bottom topography of the Atlantic, Indian, and Pacific Oceans"
                },
                {
                  "id": "P1-03-t02",
                  "title": "Temperature and salinity of the oceans"
                },
                {
                  "id": "P1-03-t03",
                  "title": "Heat and salt budgets; Ocean deposits"
                },
                {
                  "id": "P1-03-t04",
                  "title": "Waves, currents, and tides"
                },
                {
                  "id": "P1-03-t05",
                  "title": "Marine resources: biotic, mineral, and energy resources"
                },
                {
                  "id": "P1-03-t06",
                  "title": "Coral reefs and coral bleaching"
                },
                {
                  "id": "P1-03-t07",
                  "title": "Sea-level changes"
                },
                {
                  "id": "P1-03-t08",
                  "title": "Law of the sea and marine pollution"
                }
              ]
            },
            {
              "id": "P1-04",
              "title": "Biogeography",
              "topics": [
                {
                  "id": "P1-04-t01",
                  "title": "Genesis of soils; Classification and distribution of soils"
                },
                {
                  "id": "P1-04-t02",
                  "title": "Soil profile"
                },
                {
                  "id": "P1-04-t03",
                  "title": "Soil erosion, degradation, and conservation"
                },
                {
                  "id": "P1-04-t04",
                  "title": "Factors influencing world distribution of plants and animals"
                },
                {
                  "id": "P1-04-t05",
                  "title": "Problems of deforestation and conservation measures"
                },
                {
                  "id": "P1-04-t06",
                  "title": "Social forestry; Agro-forestry"
                },
                {
                  "id": "P1-04-t07",
                  "title": "Wildlife; Major gene pool centers"
                }
              ]
            },
            {
              "id": "P1-05",
              "title": "Environmental Geography",
              "topics": [
                {
                  "id": "P1-05-t01",
                  "title": "Principle of ecology; Human ecological adaptations"
                },
                {
                  "id": "P1-05-t02",
                  "title": "Influence of man on ecology and environment"
                },
                {
                  "id": "P1-05-t03",
                  "title": "Global and regional ecological changes and imbalances"
                },
                {
                  "id": "P1-05-t04",
                  "title": "Ecosystem — management and conservation"
                },
                {
                  "id": "P1-05-t05",
                  "title": "Environmental degradation, management, and conservation"
                },
                {
                  "id": "P1-05-t06",
                  "title": "Biodiversity and sustainable development"
                },
                {
                  "id": "P1-05-t07",
                  "title": "Environmental policy; Hazards and remedial measures"
                },
                {
                  "id": "P1-05-t08",
                  "title": "Environmental education and legislation"
                }
              ]
            },
            {
              "id": "P1-06",
              "title": "Perspectives in Human Geography",
              "topics": [
                {
                  "id": "P1-06-t01",
                  "title": "Areal differentiation; Regional synthesis"
                },
                {
                  "id": "P1-06-t02",
                  "title": "Dichotomy and dualism; Environmentalism"
                },
                {
                  "id": "P1-06-t03",
                  "title": "Quantitative revolution and locational analysis"
                },
                {
                  "id": "P1-06-t04",
                  "title": "Radical, behavioral, human, and welfare approaches"
                },
                {
                  "id": "P1-06-t05",
                  "title": "Languages, religions, and secularisation"
                },
                {
                  "id": "P1-06-t06",
                  "title": "Cultural regions of the world"
                },
                {
                  "id": "P1-06-t07",
                  "title": "Human development index"
                }
              ]
            },
            {
              "id": "P1-07",
              "title": "Economic Geography",
              "topics": [
                {
                  "id": "P1-07-t01",
                  "title": "World economic development: measurement and problems"
                },
                {
                  "id": "P1-07-t02",
                  "title": "World resources and their distribution"
                },
                {
                  "id": "P1-07-t03",
                  "title": "Energy crisis; The limits to growth"
                },
                {
                  "id": "P1-07-t04",
                  "title": "World agriculture: typology of agricultural regions"
                },
                {
                  "id": "P1-07-t05",
                  "title": "Agricultural inputs and productivity"
                },
                {
                  "id": "P1-07-t06",
                  "title": "Food and nutrition problems; Food security; Famine — causes, effects, remedies"
                },
                {
                  "id": "P1-07-t07",
                  "title": "World industries: location patterns and problems"
                },
                {
                  "id": "P1-07-t08",
                  "title": "Patterns of world trade"
                }
              ]
            },
            {
              "id": "P1-08",
              "title": "Population & Settlement Geography",
              "topics": [
                {
                  "id": "P1-08-t01",
                  "title": "Growth and distribution of world population"
                },
                {
                  "id": "P1-08-t02",
                  "title": "Demographic attributes; Causes and consequences of migration"
                },
                {
                  "id": "P1-08-t03",
                  "title": "Concepts of over-, under-, and optimum population"
                },
                {
                  "id": "P1-08-t04",
                  "title": "Population theories, problems, and policies"
                },
                {
                  "id": "P1-08-t05",
                  "title": "Social well-being and quality of life; Population as social capital"
                },
                {
                  "id": "P1-08-t06",
                  "title": "Types and patterns of rural settlements; Environmental issues"
                },
                {
                  "id": "P1-08-t07",
                  "title": "Hierarchy of urban settlements; Urban morphology"
                },
                {
                  "id": "P1-08-t08",
                  "title": "Primate city and rank-size rule; Functional classification of towns"
                },
                {
                  "id": "P1-08-t09",
                  "title": "Sphere of urban influence; Rural-urban fringe; Satellite towns"
                },
                {
                  "id": "P1-08-t10",
                  "title": "Problems and remedies of urbanisation; Sustainable development of cities"
                }
              ]
            },
            {
              "id": "P1-09",
              "title": "Regional Planning",
              "topics": [
                {
                  "id": "P1-09-t01",
                  "title": "Concept of a region; Types and methods of regionalization"
                },
                {
                  "id": "P1-09-t02",
                  "title": "Growth centers and growth poles"
                },
                {
                  "id": "P1-09-t03",
                  "title": "Regional imbalances; Development strategies"
                },
                {
                  "id": "P1-09-t04",
                  "title": "Environmental issues in regional planning"
                },
                {
                  "id": "P1-09-t05",
                  "title": "Planning for sustainable development"
                }
              ]
            },
            {
              "id": "P1-10",
              "title": "Models, Theories & Laws",
              "topics": [
                {
                  "id": "P1-10-t01",
                  "title": "System analysis in Human geography"
                },
                {
                  "id": "P1-10-t02",
                  "title": "Malthusian, Marxian, and demographic transition models"
                },
                {
                  "id": "P1-10-t03",
                  "title": "Central Place theories of Christaller and Losch; Perroux and Boudeville"
                },
                {
                  "id": "P1-10-t04",
                  "title": "Von Thunen's model of agricultural location"
                },
                {
                  "id": "P1-10-t05",
                  "title": "Weber's model of industrial location"
                },
                {
                  "id": "P1-10-t06",
                  "title": "Rostow's model of stages of growth"
                },
                {
                  "id": "P1-10-t07",
                  "title": "Heartland and Rimland theories"
                },
                {
                  "id": "P1-10-t08",
                  "title": "Laws of international boundaries and frontiers"
                }
              ]
            }
          ]
        },
        {
          "id": "optional-p2",
          "code": "Paper II",
          "title": "Geography of India",
          "marks": "250 marks",
          "units": [
            {
              "id": "P2-01",
              "title": "Physical Setting",
              "topics": [
                {
                  "id": "P2-01-t01",
                  "title": "Space relationship of India with neighboring countries"
                },
                {
                  "id": "P2-01-t02",
                  "title": "Structure and relief; Drainage system and watersheds"
                },
                {
                  "id": "P2-01-t03",
                  "title": "Physiographic regions"
                },
                {
                  "id": "P2-01-t04",
                  "title": "Mechanism of Indian monsoons and rainfall patterns"
                },
                {
                  "id": "P2-01-t05",
                  "title": "Tropical cyclones and western disturbances"
                },
                {
                  "id": "P2-01-t06",
                  "title": "Floods and droughts; Climatic regions"
                },
                {
                  "id": "P2-01-t07",
                  "title": "Natural vegetation; Soil types and their distributions"
                }
              ]
            },
            {
              "id": "P2-02",
              "title": "Resources",
              "topics": [
                {
                  "id": "P2-02-t01",
                  "title": "Land, surface and ground water resources"
                },
                {
                  "id": "P2-02-t02",
                  "title": "Energy, minerals, biotic and marine resources"
                },
                {
                  "id": "P2-02-t03",
                  "title": "Forest and wildlife resources and their conservation"
                },
                {
                  "id": "P2-02-t04",
                  "title": "Energy crisis"
                }
              ]
            },
            {
              "id": "P2-03",
              "title": "Agriculture",
              "topics": [
                {
                  "id": "P2-03-t01",
                  "title": "Infrastructure: irrigation, seeds, fertilizers, power"
                },
                {
                  "id": "P2-03-t02",
                  "title": "Institutional factors: land holdings, tenure, and reforms"
                },
                {
                  "id": "P2-03-t03",
                  "title": "Cropping pattern, productivity, intensity, combination, land capability"
                },
                {
                  "id": "P2-03-t04",
                  "title": "Agro and social-forestry"
                },
                {
                  "id": "P2-03-t05",
                  "title": "Green revolution and its socio-economic and ecological implications"
                },
                {
                  "id": "P2-03-t06",
                  "title": "Significance of dry farming"
                },
                {
                  "id": "P2-03-t07",
                  "title": "Livestock resources and white revolution; Aquaculture; Sericulture; Poultry"
                },
                {
                  "id": "P2-03-t08",
                  "title": "Agricultural regionalisation; Agro-climatic zones; Agroecological regions"
                }
              ]
            },
            {
              "id": "P2-04",
              "title": "Industry",
              "topics": [
                {
                  "id": "P2-04-t01",
                  "title": "Evolution of industries; locational factors of cotton, jute, and textile industries"
                },
                {
                  "id": "P2-04-t02",
                  "title": "Iron & steel, aluminium, fertilizer, paper, and chemical-pharmaceutical industries"
                },
                {
                  "id": "P2-04-t03",
                  "title": "Automobile, cottage, and agro-based industries"
                },
                {
                  "id": "P2-04-t04",
                  "title": "Industrial houses and complexes, including public sector undertakings"
                },
                {
                  "id": "P2-04-t05",
                  "title": "Industrial rationalisation and new industrial policies"
                },
                {
                  "id": "P2-04-t06",
                  "title": "Multinationals, liberalisation, and Special Economic Zones"
                },
                {
                  "id": "P2-04-t07",
                  "title": "Tourism, including eco-tourism"
                }
              ]
            },
            {
              "id": "P2-05",
              "title": "Transport, Communication & Trade",
              "topics": [
                {
                  "id": "P2-05-t01",
                  "title": "Road, railway, waterway, airway, and pipeline networks"
                },
                {
                  "id": "P2-05-t02",
                  "title": "Complementary roles of transport modes in regional development"
                },
                {
                  "id": "P2-05-t03",
                  "title": "Growing importance of ports in national and foreign trade"
                },
                {
                  "id": "P2-05-t04",
                  "title": "Trade balance and trade policy; Export processing zones"
                },
                {
                  "id": "P2-05-t05",
                  "title": "Developments in communication and IT, and their economic-social impact"
                },
                {
                  "id": "P2-05-t06",
                  "title": "The Indian space programme"
                }
              ]
            },
            {
              "id": "P2-06",
              "title": "Cultural Setting",
              "topics": [
                {
                  "id": "P2-06-t01",
                  "title": "Historical perspective of Indian society"
                },
                {
                  "id": "P2-06-t02",
                  "title": "Racial, linguistic, and ethnic diversities; religious minorities"
                },
                {
                  "id": "P2-06-t03",
                  "title": "Major tribes, tribal areas, and their problems; cultural regions"
                },
                {
                  "id": "P2-06-t04",
                  "title": "Growth, distribution, and density of population"
                },
                {
                  "id": "P2-06-t05",
                  "title": "Demographic attributes: sex-ratio, age structure, literacy, workforce, dependency ratio, longevity"
                },
                {
                  "id": "P2-06-t06",
                  "title": "Migration — inter-regional, intra-regional, and international — and associated problems"
                },
                {
                  "id": "P2-06-t07",
                  "title": "Population problems and policies; Health indicators"
                }
              ]
            },
            {
              "id": "P2-07",
              "title": "Settlements",
              "topics": [
                {
                  "id": "P2-07-t01",
                  "title": "Types, patterns, and morphology of rural settlements"
                },
                {
                  "id": "P2-07-t02",
                  "title": "Urban developments; morphology of Indian cities"
                },
                {
                  "id": "P2-07-t03",
                  "title": "Functional classification of Indian cities"
                },
                {
                  "id": "P2-07-t04",
                  "title": "Conurbations and metropolitan regions; urban sprawl"
                },
                {
                  "id": "P2-07-t05",
                  "title": "Slums and associated problems; town planning"
                },
                {
                  "id": "P2-07-t06",
                  "title": "Problems of urbanisation and remedies"
                }
              ]
            },
            {
              "id": "P2-08",
              "title": "Regional Development & Planning",
              "topics": [
                {
                  "id": "P2-08-t01",
                  "title": "Experience of regional planning in India; the Five Year Plans"
                },
                {
                  "id": "P2-08-t02",
                  "title": "Integrated rural development programmes"
                },
                {
                  "id": "P2-08-t03",
                  "title": "Panchayati Raj and decentralised planning"
                },
                {
                  "id": "P2-08-t04",
                  "title": "Command area development and watershed management"
                },
                {
                  "id": "P2-08-t05",
                  "title": "Planning for backward, desert, drought-prone, hill, and tribal areas"
                },
                {
                  "id": "P2-08-t06",
                  "title": "Multi-level planning; Regional planning for island territories"
                }
              ]
            },
            {
              "id": "P2-09",
              "title": "Political Aspects",
              "topics": [
                {
                  "id": "P2-09-t01",
                  "title": "Geographical basis of Indian federalism"
                },
                {
                  "id": "P2-09-t02",
                  "title": "State reorganisation and the emergence of new states"
                },
                {
                  "id": "P2-09-t03",
                  "title": "Regional consciousness and inter-state issues"
                },
                {
                  "id": "P2-09-t04",
                  "title": "International boundary of India and related issues; Cross-border terrorism"
                },
                {
                  "id": "P2-09-t05",
                  "title": "India's role in world affairs"
                },
                {
                  "id": "P2-09-t06",
                  "title": "Geopolitics of South Asia and the Indian Ocean realm"
                }
              ]
            },
            {
              "id": "P2-10",
              "title": "Contemporary Issues",
              "topics": [
                {
                  "id": "P2-10-t01",
                  "title": "Environmental hazards: landslides, earthquakes, tsunamis, floods, droughts, epidemics"
                },
                {
                  "id": "P2-10-t02",
                  "title": "Environmental pollution; changes in land-use patterns"
                },
                {
                  "id": "P2-10-t03",
                  "title": "Environmental impact assessment and environmental management"
                },
                {
                  "id": "P2-10-t04",
                  "title": "Population explosion and food security"
                },
                {
                  "id": "P2-10-t05",
                  "title": "Environmental degradation, deforestation, desertification, and soil erosion"
                },
                {
                  "id": "P2-10-t06",
                  "title": "Problems of agrarian and industrial unrest"
                },
                {
                  "id": "P2-10-t07",
                  "title": "Regional disparities in economic development"
                },
                {
                  "id": "P2-10-t08",
                  "title": "Sustainable growth and development; environmental awareness"
                },
                {
                  "id": "P2-10-t09",
                  "title": "River linkage; globalisation and the Indian economy"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
