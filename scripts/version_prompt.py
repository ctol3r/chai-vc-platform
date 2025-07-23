#!/usr/bin/env python3
import os
import sys

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'prompts')


def get_next_version() -> int:
    versions = []
    for name in os.listdir(PROMPTS_DIR):
        if name.startswith('prompt_v') and name.endswith('.txt'):
            try:
                versions.append(int(name[len('prompt_v'):-4]))
            except ValueError:
                pass
    return max(versions) + 1 if versions else 1


def main():
    if len(sys.argv) < 2:
        print('Usage: version_prompt.py "prompt text"')
        sys.exit(1)
    version = get_next_version()
    filename = os.path.join(PROMPTS_DIR, f'prompt_v{version}.txt')
    with open(filename, 'w') as f:
        f.write(sys.argv[1])
    print(f'Created {filename}')


if __name__ == '__main__':
    main()
