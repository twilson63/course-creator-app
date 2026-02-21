#!/bin/bash
set -e

cd out

# Rename _next directory to static
if [ -d "_next" ]; then
  mv _next static
fi

# Replace ./static/static with ./static in all HTML files
find . -name "*.html" -type f -exec sed -i '' 's|static/static/|static/|g' {} \;

# Replace ./static with ../static in subdirectory HTML files (dashboard/, edit/)
for dir in dashboard edit _not-found 404; do
  if [ -d "$dir" ]; then
    sed -i '' 's|\./static/|../static/|g' "$dir/index.html"
  fi
done

echo "Fixed paths for onhyper.io"
ls -la static/
echo "---"
head -3 index.html | grep -o 'static/[^"]*' | head -5
