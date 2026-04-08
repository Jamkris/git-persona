#!/bin/bash

# git-persona Release Helper Script
# Usage: ./scripts/release.sh <version>
# Example: ./scripts/release.sh 1.0.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.0"
    exit 1
fi

# Remove 'v' prefix if provided
VERSION="${VERSION#v}"

echo "Preparing release v$VERSION..."

# 1. Update package.json
echo "Updating package.json..."
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

echo "Version updated to $VERSION in package.json."

# 2. Build and test
echo "Building..."
npm run build

echo "Running tests..."
npm run test:run

# 3. Git commit and tag
git add package.json

echo "Committing version bump..."
git commit -m "chore: bump version to $VERSION"

echo "Creating tag v$VERSION..."
git tag "v$VERSION"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo ""
echo "Done!"
echo "Next steps:"
echo "1. git push origin $BRANCH"
echo "2. git push origin v$VERSION"
if [ "$BRANCH" != "main" ]; then
    echo "3. Create a PR to merge '$BRANCH' into main"
    echo "   gh pr create --title 'chore: release v$VERSION' --body 'Bump version to $VERSION'"
    echo "4. After merge, push the tag: git push origin v$VERSION"
    echo "5. Check GitHub Actions for the Release process."
else
    echo "3. Check GitHub Actions for the Release process."
fi
