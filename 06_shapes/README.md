# Module 06 — Shapes

## Concepts

### Geometry terms

- **Vertex** (plural *vertices*) — a corner point where two edges meet
- **Edge / side** — a straight line segment connecting two vertices
- **Angle** — the turn between two edges at a vertex, measured in degrees
- **Polygon** — a closed 2D shape made of straight edges only
- **Regular polygon** — all edges equal length and all angles equal
- **Irregular polygon** — edges and/or angles differ
- **Closed shape** — the outline returns to its starting vertex
- **Diagonal** — a line between non-adjacent vertices

### Drawing with `turtle`

- `forward(n)` / `backward(n)` — move along the current edge
- `left(deg)` / `right(deg)` — turn at a vertex (exterior angle)
- For a regular *n*-gon: edge length `s`, turn `360 / n` degrees each vertex
- `done()` — keep the window open

## Practice prompts

1. Draw a **square** (4 edges, 90° turns, 4 right angles).
2. Draw an **equilateral triangle** (3 equal edges, 60° turns → exterior 120°).
3. Draw a **regular hexagon** (6 edges, 60° turns).
4. Draw any **irregular quadrilateral** — comment which edges differ.
5. For each shape, comment: number of vertices, number of edges, sum of interior angles (`(n - 2) * 180`).

Complete the TODOs in [starters.py](https://github.com/nanapaknanapak-huemirit/basic-programming-learning-phase-1/blob/main/06_shapes/starters.py).
