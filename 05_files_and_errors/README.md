# Module 05 — Files and errors

## Concepts

- Opening files: `with open(...) as f`
- Reading: `read()`, `readlines()`, iteration
- Writing: `write()`, `writelines()`
- Modes: `r`, `w`, `a`
- Exceptions: `try` / `except` / `else` / `finally`
- Raising exceptions
- Common errors: `FileNotFoundError`, `ValueError`, `ZeroDivisionError`

## Practice prompts

1. Write 3 lines to `output.txt`, then read and print them.
2. Append a 4th line to the same file.
3. Wrap a division in `try/except` that handles `ZeroDivisionError`.
4. Write `parse_int(s)` that raises `ValueError` if `s` isn't an integer; handle it in a caller.
5. Use `finally` to print `"done"` regardless of outcome.

Complete the TODOs in [starters.py](https://github.com/nanapaknanapak-huemirit/basic-programming-learning-phase-1/blob/main/05_files_and_errors/starters.py).
