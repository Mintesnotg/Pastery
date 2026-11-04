#!/usr/bin/env bash
# Upload the backend folder to GoDaddy Node.js Hosting and publish it.
# Requires GDDY_PAT and GODADDY_APP_ID. package.json must be at the zip root.
set -euo pipefail

if [[ -z "${GDDY_PAT:-}" || -z "${GODADDY_APP_ID:-}" ]]; then
  echo "Set repository secrets GDDY_PAT and GODADDY_APP_ID before this job can deploy."
  echo "Create a Personal Access Token with hosting.source:write, hosting.source:read, and hosting.deployment:execute."
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ZIP="${RUNNER_TEMP:-/tmp}/backend-app.zip"
rm -f "$ZIP"

(
  cd "$ROOT/backend"
  zip -r "$ZIP" . \
    -x "node_modules/*" \
    -x ".env" \
    -x ".env.*" \
    -x "uploads/*" \
    -x "coverage/*" \
    -x "dist/*" \
    -x "*.log"
)

pick_field() {
  printf '%s\n' "$1" | node "$ROOT/.github/scripts/pick-field.mjs" "$2"
}

wait_for() {
  local label="$1"
  shift
  local attempt=0
  local status=""
  local out=""
  while [[ "$attempt" -lt 60 ]]; do
    out="$("$@" 2>&1 || true)"
    echo "$out"
    status="$(pick_field "$out" status || true)"
    if [[ "$status" == "COMPLETED" ]]; then
      return 0
    fi
    if [[ "$status" == "FAILED" || "$status" == "ERROR" ]]; then
      echo "${label} failed."
      return 1
    fi
    attempt=$((attempt + 1))
    sleep 5
  done
  echo "${label} did not finish within 5 minutes."
  return 1
}

echo "Uploading backend to ${GODADDY_APP_ID}"
set +e
upload_out="$(gddy hosting source upload --app-id "$GODADDY_APP_ID" --file "$ZIP" 2>&1)"
upload_code=$?
set -e
echo "$upload_out"
if [[ "$upload_code" -ne 0 ]]; then
  exit "$upload_code"
fi
import_id="$(pick_field "$upload_out" importId || true)"
if [[ -z "$import_id" ]]; then
  echo "Could not read importId from the upload response."
  exit 1
fi

wait_for "Source import" gddy hosting source status --app-id "$GODADDY_APP_ID" --import-id "$import_id"

echo "Publishing ${GODADDY_APP_ID}"
set +e
publish_out="$(gddy hosting deployment publish --app-id "$GODADDY_APP_ID" 2>&1)"
publish_code=$?
set -e
echo "$publish_out"
if [[ "$publish_code" -ne 0 ]]; then
  exit "$publish_code"
fi
deployment_id="$(pick_field "$publish_out" deploymentId || true)"
if [[ -z "$deployment_id" ]]; then
  echo "Could not read deploymentId from the publish response."
  exit 1
fi

wait_for "Publish" gddy hosting deployment get --app-id "$GODADDY_APP_ID" --deployment-id "$deployment_id"
echo "Published ${GODADDY_APP_ID}"
