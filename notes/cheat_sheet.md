# Python Phase 1 Cheat Sheet

## Types

```python
int(42) float(3.14) str("hi") bool(True)
type(x)  # inspect
```

## Operators

```python
+ - * / // % **          # arithmetic
== != > < >= <=          # comparison
and or not               # logical
```

## Strings

```python
f"{name} is {age}"       # f-string
s.upper() s.lower() s.strip()
s.split(",") s.replace("a", "b")
```

## Control flow

```python
if cond:
    ...
elif other:
    ...
else:
    ...

for i in range(10):  # 0..9
    ...
while cond:
    ...
```

## Functions

```python
def add(a, b=0):
    """Return sum."""
    return a + b
```

## Collections

```python
lst = [1, 2, 3]     # ordered, mutable
lst.append(4) lst[0] lst[1:3]
tup = (1, 2, 3)     # immutable
d = {"k": "v"}      # dict: d["k"], d.get("k", default)
s = {1, 2, 3}       # set: unique, s | t, s & t
```

## Files & errors

```python
with open("f.txt") as f:
    text = f.read()

try:
    ...
except ValueError as e:
    ...
finally:
    ...
```
