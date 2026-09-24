# Module 06 — Shapes
# Geometry terms: vertex, edge, angle, polygon, regular vs irregular

import turtle

# TODO 1: Draw a square.
# 4 vertices, 4 edges (equal length), interior angles 90° each.
# Turn 90° at each vertex.


def draw_square(t, side=100):
    # 4 vertices, 4 edges, interior angle sum = (4 - 2) * 180 = 360°
    for _ in range(4):
        t.forward(side)
        t.left(90)


# TODO 2: Draw an equilateral triangle.
# 3 vertices, 3 equal edges, exterior turn = 360/3 = 120°


def draw_triangle(t, side=100):
    # 3 vertices, 3 edges, interior angle sum = (3 - 2) * 180 = 180°
    # Interior angle is 60°; the turtle *turns* the exterior angle 120°.
    for _ in range(3):
        t.forward(side)
        t.left(120)


# TODO 3: Draw a regular hexagon.
# 6 vertices, 6 equal edges, exterior turn = 360/6 = 60°
# Interior angle sum = (6 - 2) * 180 = 720°


def draw_hexagon(t, side=80):
    # 6 vertices, 6 edges, interior angle sum = (6 - 2) * 180 = 720°
    # Interior angle is 120°; the turtle *turns* the exterior angle 60°.
    for _ in range(6):
        t.forward(side)
        t.left(60)


# TODO 4: Draw an irregular quadrilateral.
# Same number of vertices/edges as a square, but edges differ in length
# and/or turn angles differ. Comment which edges are unequal.


def draw_irregular_quad(t):
    # 4 vertices, 4 edges, interior angle sum = (4 - 2) * 180 = 360°.
    # Sides differ: 80, 60, 100, 70 (all unequal).
    # Turns 80, 100, 90, 90 — not all the same, but they sum to 360°.
    for side, turn in [(80, 80), (60, 100), (100, 90), (70, 90)]:
        t.forward(side)
        t.left(turn)


def go_to(t, x, y):
    # Lift the pen, move to (x, y), put the pen down again.
    t.penup()
    t.goto(x, y)
    t.pendown()


if __name__ == "__main__":
    screen = turtle.Screen()
    screen.title("Module 06 — Shapes")
    screen.setup(width=800, height=400)
    t = turtle.Turtle()
    t.speed(3)

    # TODO 5: Call your draw functions with spacing between shapes,
    # then print for each shape: vertices, edges, interior angle sum.

    shapes = [
        ("Square", lambda: draw_square(t)),
        ("Triangle", lambda: draw_triangle(t)),
        ("Hexagon", lambda: draw_hexagon(t)),
        ("Irregular quad", lambda: draw_irregular_quad(t)),
    ]
    starts = [-300, -100, 100, 300]
    for (name, draw), x in zip(shapes, starts):
        go_to(t, x, 0)
        t.setheading(0)
        draw()
        edge_count = {"Square": 4, "Triangle": 3, "Hexagon": 6, "Irregular quad": 4}[name]
        print(f"{name}: {edge_count} vertices, {edge_count} edges, "
              f"interior angle sum = {edge_count * 180 - 360}°")

    turtle.done()