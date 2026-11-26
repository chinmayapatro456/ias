#!/usr/bin/env python3
"""
Wraps/copies your existing Mains PYQ file ("data (1).js") into data/mains-data.js
and guarantees window.PYQ_METADATA, window.UPSC_MAINS_PYQS, and window.PYQ_BY_TOPIC
are exposed as browser globals.

Usage (Python 3, no external packages required):
  python3 convert_mains.py "data (1).js" data/mains-data.js
"""

import os
import sys

WRAPPER_FOOTER = """
/* Ensure globals are attached to window even if declared with const/let */
if (typeof window !== 'undefined') {
  if (typeof PYQ_METADATA !== 'undefined' && !window.PYQ_METADATA) {
    window.PYQ_METADATA = PYQ_METADATA;
  }
  if (typeof UPSC_MAINS_PYQS !== 'undefined' && !window.UPSC_MAINS_PYQS) {
    window.UPSC_MAINS_PYQS = UPSC_MAINS_PYQS;
  }
  if (typeof PYQ_BY_TOPIC !== 'undefined' && !window.PYQ_BY_TOPIC) {
    window.PYQ_BY_TOPIC = PYQ_BY_TOPIC;
  }
}
"""


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "data (1).js"
    dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join("data", "mains-data.js")

    if not os.path.exists(src):
        sys.exit(f"Source file not found: {src}")

    with open(src, "r", encoding="utf-8") as f:
        raw = f.read()

    for expected in ("PYQ_METADATA", "UPSC_MAINS_PYQS", "PYQ_BY_TOPIC"):
        if expected not in raw:
            print(f"Warning: '{expected}' was not detected in {src}. Verify the source file.")

    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(raw.rstrip() + "\n" + WRAPPER_FOOTER)

    size_kb = os.path.getsize(dst) / 1024
    print(f"Wrote {dst} ({size_kb:.1f} KB).")


if __name__ == "__main__":
    main()