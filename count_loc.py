
import os
import subprocess

def count_lines():
    try:
        # Get all tracked files using git
        files = subprocess.check_output(['git', 'ls-files']).decode('utf-8').splitlines()
    except Exception as e:
        print(f"Error running git: {e}")
        return

    extensions = {
        '.py': 'Python',
        '.ts': 'TypeScript',
        '.tsx': 'TypeScript (React)',
        '.js': 'JavaScript',
        '.jsx': 'JavaScript (React)',
        '.css': 'CSS',
        '.less': 'Less',
        '.html': 'HTML',
        '.md': 'Markdown',
        '.yml': 'YAML',
        '.yaml': 'YAML',
        '.sql': 'SQL'
    }

    stats = {lang: {'files': 0, 'lines': 0} for lang in set(extensions.values())}
    stats['Other'] = {'files': 0, 'lines': 0}

    total_lines = 0
    total_files = 0

    for f in files:
        if not os.path.isfile(f):
            continue
        
        # Skip node_modules or other giant vendor dirs if they somehow got tracked
        if 'node_modules' in f:
            continue

        ext = os.path.splitext(f)[1]
        lang = extensions.get(ext, 'Other')
        
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as file:
                lines = sum(1 for line in file)
                stats[lang]['lines'] += lines
                stats[lang]['files'] += 1
                total_lines += lines
                total_files += 1
        except Exception:
            continue

    print(f"{'Language':<25} | {'Files':<10} | {'Lines':<10}")
    print("-" * 50)
    for lang, data in sorted(stats.items(), key=lambda x: x[1]['lines'], reverse=True):
        if data['lines'] > 0:
            print(f"{lang:<25} | {data['files']:<10} | {data['lines']:<10}")
    
    print("-" * 50)
    print(f"{'Total':<25} | {total_files:<10} | {total_lines:<10}")

if __name__ == "__main__":
    count_lines()
