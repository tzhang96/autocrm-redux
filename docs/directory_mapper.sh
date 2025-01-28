#!/bin/bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR"
MARKDOWN_FILE="$OUTPUT_DIR/directory_structure.md"
IGNORE_PATTERNS=(
    "node_modules"
    ".git"
    ".next"
    "dist"
    "build"
    ".DS_Store"
    "*.log"
    "coverage"
    ".vercel"
)
should_ignore() {
    local path="$1"
    for pattern in "${IGNORE_PATTERNS[@]}"; do
        if [[ "$path" == *"$pattern"* ]]; then
            return 0
        fi
    done
    return 1
}
generate_tree() {
    local dir="$1"
    local prefix="$2"
    local directories=()
    local files=()
    while IFS= read -r item; do
        if [ -z "$item" ] || should_ignore "$item"; then
            continue
        fi
       
        if [ -d "$item" ]; then
            directories+=("$item")
        else
            files+=("$item")
        fi
    done < <(find "$dir" -maxdepth 1 -mindepth 1 | sort)
    for item in "${directories[@]}"; do
        local name=$(basename "$item")
        printf "%s├── %s/\n" "$prefix" "$name"
        generate_tree "$item" "$prefix    "
    done
    local last_idx=$((${#files[@]} - 1))
    for i in "${!files[@]}"; do
        local item="${files[$i]}"
        local name=$(basename "$item")
        if [ $i -eq $last_idx ] && [ ${#directories[@]} -eq 0 ]; then
            # Last item in both files and directories
            printf "%s└── %s\n" "$prefix" "$name"
        else
            printf "%s├── %s\n" "$prefix" "$name"
        fi
    done
}
mkdir -p "$OUTPUT_DIR"
cat > "$MARKDOWN_FILE" << EOL
Generated on: $(date +'%Y-%m-%d %H:%M:%S %Z')
\`\`\`
$(generate_tree "$(pwd)" "")
\`\`\`
EOL