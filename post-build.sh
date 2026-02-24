#!/bin/bash
# Add base tag to all HTML files for correct relative path resolution

BASE_HREF='/a/course-creator-30c2a685/'

find out -name "*.html" -type f | while read html; do
  # Insert base tag after <head>
  sed -i '' "s|<head>|<head><base href=\"$BASE_HREF\">|g" "$html"
  echo "Updated: $html"
done
