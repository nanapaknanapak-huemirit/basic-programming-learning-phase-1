# Module 06 — Shapes
# Geometry terms: vertex, edge, angle, polygon, regular vs irregular

import turtle

# TODO 1: Draw a square.
# 4 vertices, 4 edges (equal length), interior angles 90° each.
# Turn 90° at each vertex.


def draw_square(t, side=100):
    # TODO: loop 4 times: forward(side), left(90)
    pass


# TODO 2: Draw an equilateral triangle.
# 3 vertices, 3 equal edges, exterior turn = 360/3 = 120°


def draw_triangle(t, side=100):
    # TODO: loop 3 times: forward(side), left(120)
    pass


# TODO 3: Draw a regular hexagon.
# 6 vertices, 6 equal edges, exterior turn = 360/6 = 60°
# Interior angle sum = (6 - 2) * 180 = 720°


def draw_hexagon(t, side=80):
    # TODO: loop 6 times: forward(side), left(60)
    pass


# TODO 4: Draw an irregular quadrilateral.
# Same number of vertices/edges as a square, but edges differ in length
# and/or turn angles differ. Comment which edges are unequal.


def draw_irregular_quad(t):
    # TODO: pick 4 unequal sides and turn angles that sum to 360°
    pass


if __name__ == "__main__":
    screen = turtle.Screen()
    screen.title("Module 06 — Shapes")
    t = turtle.Turtle()
    t.speed(3)

    # TODO 5: Call your draw functions with spacing between shapes,
    # then print for each shape: vertices, edges, interior angle sum.

    turtle.done()
