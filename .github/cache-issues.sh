#!/usr/bin/env bash
# GitHub Issues Local Caching Script
# Caches issues locally to avoid network calls during development

CACHE_DIR=".github/cache"
CACHE_FILE="$CACHE_DIR/issues.json"
LABELS_FILE="$CACHE_DIR/labels.json"

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Function to cache all issues
cache_issues() {
    echo "Caching issues..."
    gh issue list --json number,title,state,labels,assignees,createdAt,updatedAt,url --limit 1000 > "$CACHE_FILE"
    echo "Issues cached to $CACHE_FILE"
}

# Function to cache labels
cache_labels() {
    echo "Caching labels..."
    gh label list --json name,description,color > "$LABELS_FILE"
    echo "Labels cached to $LABELS_FILE"
}

# Function to show cached issues by phase
show_phase_issues() {
    local phase="$1"
    if [ ! -f "$CACHE_FILE" ]; then
        echo "Cache not found. Run './cache-issues.sh cache' first."
        return 1
    fi

    echo "=== Phase $phase Issues ==="
    jq -r ".[] | select(.labels[]?.name | contains(\"phase-$phase\")) | \"#\(.number) - \(.title) [\(.state)]\"" "$CACHE_FILE"
}

# Function to show all cached issues
show_all_issues() {
    if [ ! -f "$CACHE_FILE" ]; then
        echo "Cache not found. Run './cache-issues.sh cache' first."
        return 1
    fi

    echo "=== All Issues ==="
    jq -r ".[] | \"#\(.number) - \(.title) [\(.state)]\"" "$CACHE_FILE"
}

# Function to show issue count by phase
show_stats() {
    if [ ! -f "$CACHE_FILE" ]; then
        echo "Cache not found. Run './cache-issues.sh cache' first."
        return 1
    fi

    echo "=== Issue Statistics ==="
    echo "Total issues: $(jq length "$CACHE_FILE")"
    echo "Phase 1: $(jq '[.[] | select(.labels[]?.name | contains("phase-1"))] | length' "$CACHE_FILE")"
    echo "Phase 2: $(jq '[.[] | select(.labels[]?.name | contains("phase-2"))] | length' "$CACHE_FILE")"
    echo "Phase 3: $(jq '[.[] | select(.labels[]?.name | contains("phase-3"))] | length' "$CACHE_FILE")"
    echo "Open issues: $(jq '[.[] | select(.state == "OPEN")] | length' "$CACHE_FILE")"
    echo "Closed issues: $(jq '[.[] | select(.state == "CLOSED")] | length' "$CACHE_FILE")"
}

# Main command handling
case "$1" in
    "cache")
        cache_issues
        cache_labels
        ;;
    "phase1"|"phase-1")
        show_phase_issues "1"
        ;;
    "phase2"|"phase-2")
        show_phase_issues "2"
        ;;
    "phase3"|"phase-3")
        show_phase_issues "3"
        ;;
    "all")
        show_all_issues
        ;;
    "stats")
        show_stats
        ;;
    *)
        echo "Usage: $0 {cache|phase1|phase2|phase3|all|stats}"
        echo ""
        echo "Commands:"
        echo "  cache    - Cache all issues and labels locally"
        echo "  phase1   - Show Phase 1 issues"
        echo "  phase2   - Show Phase 2 issues"
        echo "  phase3   - Show Phase 3 issues"
        echo "  all      - Show all issues"
        echo "  stats    - Show issue statistics"
        ;;
esac