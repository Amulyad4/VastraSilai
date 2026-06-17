import os

root_dir = r"d:\VastraSilai\frontend\src"
exclude_dirs = {"node_modules", ".git", "venv", ".pytest_cache"}

for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                for line_no, line in enumerate(f, 1):
                    if "0000000000" in line:
                        print(f"{filepath}:{line_no}: {line.strip()}")
        except Exception as e:
            pass
