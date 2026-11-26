"""Build SVG map paths for the India maps from a vetted GeoJSON boundary dataset.

Source dataset: udit-001/india-maps-data (geojson/india.geojson), a district-level
dataset derived from the DataMeet / Census-2011 India boundary set, updated for the
2019 reorganisation (Jammu & Kashmir and Ladakh as separate units).

Usage: python3 scripts/build-geo.py [source.geojson] [output-dir]
Download the source once:
  curl -sSLo geo-src/india.geojson \
    https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/india.geojson

Outputs (written to geo/):
  - india_outline.json  : one dissolved outline path (mainland + A&N + Lakshadweep)
                          projected, plus graticule lines and reference points
  - india_states.json   : per-state paths for the interactive Optional PYQs map
"""
import json, math, os, sys
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

SRC = sys.argv[1] if len(sys.argv) > 1 else "geo-src/india.geojson"
OUT = sys.argv[2] if len(sys.argv) > 2 else "geo"
os.makedirs(OUT, exist_ok=True)

# ---- Albers equal-area conic projection (India-appropriate) -----------------
LON0 = 80.0
LAT0 = 24.0
SP1, SP2 = 12.0, 35.0
R = 1.0

def _rad(d):
    return d * math.pi / 180.0

n = 0.5 * (math.sin(_rad(SP1)) + math.sin(_rad(SP2)))
C = math.cos(_rad(SP1)) ** 2 + 2 * n * math.sin(_rad(SP1))
rho0 = R * math.sqrt(C - 2 * n * math.sin(_rad(LAT0))) / n

def project(lon, lat):
    rho = R * math.sqrt(C - 2 * n * math.sin(_rad(lat))) / n
    theta = n * _rad(lon - LON0)
    x = rho * math.sin(theta)
    y = rho0 - rho * math.cos(theta)
    return x, y

# Scale/offset computed later from the bbox of the country.
SCALE = None
MINX = MINY = None

def to_svg(lon, lat, prec=1):
    x, y = project(lon, lat)
    sx = (x - MINX) * SCALE
    sy = (MAXY - y) * SCALE
    return round(sx, prec), round(sy, prec)

def ring_to_path(coords, prec=1):
    pts = [to_svg(lon, lat, prec) for lon, lat in coords]
    # drop consecutive duplicates created by rounding
    out = []
    for p in pts:
        if not out or p != out[-1]:
            out.append(p)
    if len(out) < 3:
        return ""
    d = "M" + " ".join(f"{x} {y}" for x, y in out) + "Z"
    return d

def geom_to_paths(geom, prec=1):
    """Return list of subpath strings (one per polygon ring set)."""
    paths = []
    polys = []
    if geom.geom_type == "Polygon":
        polys = [geom]
    elif geom.geom_type == "MultiPolygon":
        polys = list(geom.geoms)
    for poly in polys:
        if poly.area < 1e-5:      # drop specks (< ~ 1 km2)
            continue
        d = ring_to_path(list(poly.exterior.coords), prec)
        if not d:
            continue
        for interior in poly.interiors:
            hole = ring_to_path(list(interior.coords), prec)
            if hole:
                d += hole
        paths.append(d)
    return paths

# ---- Load + dissolve -------------------------------------------------------
data = json.load(open(SRC))
feats = data["features"]

by_state = {}
for f in feats:
    name = f["properties"]["st_nm"]
    g = shape(f["geometry"])
    if not g.is_valid:
        g = g.buffer(0)
    by_state.setdefault(name, []).append(g)

states = {name: unary_union(geoms) for name, geoms in by_state.items()}
country = unary_union(list(states.values()))

# ---- Fit projection to viewbox --------------------------------------------
allx, ally = [], []
def collect(geom):
    geoms = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
    for p in geoms:
        for lon, lat in p.exterior.coords:
            x, y = project(lon, lat)
            allx.append(x); ally.append(y)

collect(country)
MINX, MAXX = min(allx), max(allx)
MINY, MAXY = min(ally), max(ally)
VB_W = 520.0
SCALE = VB_W / (MAXX - MINX)
VB_H = round((MAXY - MINY) * SCALE, 1)
# Sea margin on the west so the Tropic of Cancer label can sit over open water
PAD_L = 172
PAD_R = 10
PAD_T = 4
PAD_B = 4
VB_X = -PAD_L
VB_Y = -PAD_T
VB_TOTAL_W = VB_W + PAD_L + PAD_R
VB_TOTAL_H = VB_H + PAD_T + PAD_B
print("viewBox", VB_X, VB_Y, VB_TOTAL_W, VB_TOTAL_H, "aspect", round(VB_TOTAL_W / VB_TOTAL_H, 3))

# ---- Home outline (single path, gently simplified) -------------------------
outline_src = country.simplify(0.05, preserve_topology=True)
outline_paths = geom_to_paths(outline_src, 1)
mainland = max(outline_paths, key=lambda d: len(d))
islands = [d for d in outline_paths if d is not mainland]

# graticule (projected so parallels/longitudes curve correctly)
grat = []
for lat in (10, 15, 20, 25, 30, 35):
    pts = [to_svg(lon, lat) for lon in range(60, 101, 2)]
    grat.append({"kind": "lat", "label": f"{lat}° N",
                 "d": "M" + " ".join(f"{x} {y}" for x, y in pts)})
for lon in (70, 75, 80, 85, 90, 95):
    pts = [to_svg(lon, lat) for lat in range(6, 39, 1)]
    grat.append({"kind": "lon", "label": f"{lon}° E",
                 "d": "M" + " ".join(f"{x} {y}" for x, y in pts)})

tropic = [to_svg(lon, 23.5) for lon in range(58, 101, 2)]
tropic_d = "M" + " ".join(f"{x} {y}" for x, y in tropic)

newdelhi = to_svg(77.21, 28.61)
kanyakumari = to_svg(77.54, 8.09)

# sea-margin anchor for the Tropic of Cancer label: far west, open Arabian Sea
tropic_label_at = (-146.0, None)
tropic_y = to_svg(80.0, 23.5)[1]

json.dump({
    "viewBox": f"{VB_X} {VB_Y} {VB_TOTAL_W} {VB_TOTAL_H}",
    "mainland": mainland,
    "islands": islands,
    "graticule": grat,
    "tropic": tropic_d,
    "tropicLabelX": -164.0,
    "tropicLabelY1": round(tropic_y - 19, 1),
    "tropicLabelY2": round(tropic_y - 4, 1),
    "tropicY": tropic_y,
    "newDelhi": newdelhi,
    "kanyakumari": kanyakumari,
}, open(os.path.join(OUT, "india_outline.json"), "w"), indent=1)

# ---- States for the interactive Optional map -------------------------------
def short(name):
    return (name.replace(" and ", " & ")
                 .replace("Dadra & Nagar Haveli & Daman & Diu", "DNH & Daman-Diu"))

state_out = []
for name in sorted(states):
    g = states[name].simplify(0.085, preserve_topology=True)
    paths = geom_to_paths(g, 0)
    if not paths:
        continue
    c = g.centroid
    cx, cy = to_svg(c.x, c.y)
    state_out.append({"name": name, "short": short(name),
                      "d": " ".join(paths), "cx": cx, "cy": cy})

json.dump({"viewBox": f"{VB_X} {VB_Y} {VB_TOTAL_W} {VB_TOTAL_H}", "states": state_out},
          open(os.path.join(OUT, "india_states.json"), "w"), indent=1)

print("states", len(state_out), "outline paths", len(outline_paths))
print("outline bytes", len(mainland), "states bytes", len(json.dumps(state_out)))
print("newdelhi", newdelhi, "kanyakumari", kanyakumari, "tropicLabel", tropic_label_at)
