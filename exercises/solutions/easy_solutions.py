def hello():
    name = input("Name: ")
    return f"Hello, {name}!"


def max3(a, b, c):
    return max(a, b, c)


def reverse_string(s):
    result = ""
    for ch in s:
        result = ch + result
    return result


if __name__ == "__main__":
    # print(hello())
    print(max3(3, 9, 5))
    print(reverse_string("hello"))
