#!/usr/bin/env bash
# Upload the frontend folder to GoDaddy Node.js Hosting and publish it.
# The app uses the existing Web Hosting Deluxe plan. Do not buy another plan.
# Requires GDDY_PAT and GODADDY_APP_ID. package.json must be at the zip root.
set -euo pipefail

note() {
  printf '%s\n' "$1"
  printf '::notice::%s\n' "$1"
}

fail() {
  local msg="$1"
  printf '%s\n' "$msg"
  printf '::error::%s\n' "$msg"
  exit 1
}

redact() {
  printf '%s\n' "$1" \
    | sed -E 's/gd_pat_[A-Za-z0-9._-]+/[redacted]/g' \
    | tr '\r\n' '  ' \
    | cut -c1-700
}

GDDY_PAT="${GDDY_PAT:-}"
GDDY_PAT="${GDDY_PAT//$'\r'/}"
GDDY_PAT="${GDDY_PAT//$'\n'/}"
GODADDY_APP_ID="${GODADDY_APP_ID:-}"
GODADDY_APP_ID="${GODADDY_APP_ID//$'\r'/}"
GODADDY_APP_ID="${GODADDY_APP_ID//$'\n'/}"
GODADDY_APP_ID="${GODADDY_APP_ID#"${GODADDY_APP_ID%%[![:space:]]*}"}"
GODADDY_APP_ID="${GODADDY_APP_ID%"${GODADDY_APP_ID##*[![:space:]]}"}"
export GDDY_PAT
export GDDY_PAT_PROD="$GDDY_PAT"
export GODADDY_APP_ID

if [[ -z "$GDDY_PAT" || -z "$GODADDY_APP_ID" ]]; then
  fail "Set repository secrets GDDY_PAT and GODADDY_FRONTEND_APP_ID before this job can deploy."
fi
if [[ ! "$GDDY_PAT" =~ ^gd_pat_[A-Za-z0-9._-]{8,}$ ]]; then
  fail "GDDY_PAT is not a GoDaddy personal access token. Create one at https://developer.godaddy.com/personal-access-token with hosting.source:read, hosting.source:write, and hosting.deployment:execute, then update the GitHub secret. The value must start with gd_pat_."
fi
if [[ ! "$GODADDY_APP_ID" =~ ^NODEJS-[A-Za-z0-9]+$ ]]; then
  fail "GODADDY_FRONTEND_APP_ID must look like NODEJS- followed by the app id from the GoDaddy project URL."
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ZIP="${RUNNER_TEMP:-/tmp}/frontend-app.zip"
rm -f "$ZIP"

(
  cd "$ROOT/frontend"
  zip -r "$ZIP" . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".env" \
    -x ".env.*" \
    -x "coverage/*" \
    -x "*.log" \
    -x ".build-error.txt"
)

pick_field() {
  printf '%s\n' "$1" | node "$ROOT/.github/scripts/pick-field.mjs" "$2"
}

transient() {
  local text="$1"
  [[ "$text" == *"503"* || "$text" == *"502"* || "$text" == *"504"* || "$text" == *"429"* || "$text" == *"timeout"* || "$text" == *"Timeout"* || "$text" == *"temporarily"* || "$text" == *"edgesuite"* || "$text" == *"ECONNRESET"* ]]
}

run_gddy() {
  local attempt=1
  local code=0
  local out=""
  while [[ "$attempt" -le 4 ]]; do
    set +e
    out="$("$@" --timeout 90s 2>&1)"
    code=$?
    set -e
    printf '%s\n' "$out"
    if [[ "$code" -eq 0 ]]; then
      GD_OUT="$out"
      return 0
    fi
    if [[ "$attempt" -eq 4 || ! "$(transient "$out" && echo yes)" == "yes" ]]; then
      fail "$(redact "$out")"
    fi
    note "GoDaddy request failed on attempt ${attempt}. Retrying."
    sleep $((attempt * 15))
    attempt=$((attempt + 1))
  done
  fail "$(redact "$out")"
}

wait_for() {
  local label="$1"
  shift
  local attempt=0
  local status=""
  local out=""
  while [[ "$attempt" -lt 180 ]]; do
    set +e
    out="$("$@" --timeout 30s 2>&1)"
    set -e
    printf '%s\n' "$out"
    status="$(pick_field "$out" status || true)"
    if [[ "$status" == "COMPLETED" ]]; then
      return 0
    fi
    if [[ "$status" == "FAILED" || "$status" == "ERROR" ]]; then
      fail "${label} failed. $(redact "$out")"
    fi
    attempt=$((attempt + 1))
    sleep 5
  done
  fail "${label} did not finish within 15 minutes."
}

note "Uploading frontend to ${GODADDY_APP_ID} with gddy $(gddy --version)"
gddy auth status --env prod || true
run_gddy gddy hosting source upload --env prod --app-id "$GODADDY_APP_ID" --file "$ZIP"
import_id="$(pick_field "$GD_OUT" importId || true)"
if [[ -z "$import_id" ]]; then
  fail "Could not read importId from the upload response. $(redact "$GD_OUT")"
fi

wait_for "Source import" gddy hosting source status --env prod --app-id "$GODADDY_APP_ID" --import-id "$import_id"

attach_existing_plan() {
  local out=""
  local code=0
  local plan=""
  local slots=""
  set +e
  out="$(gddy hosting subscription list --env prod --hosting-product WEB_HOSTING --timeout 60s 2>&1)"
  code=$?
  set -e
  printf '%s\n' "$out"
  if [[ "$code" -ne 0 ]]; then
    fail "Could not list the existing Web Hosting plan. Add hosting.subscription:read and hosting.subscription:write to the personal access token, then update the GDDY_PAT secret. $(redact "$out")"
  fi
  plan="$(pick_field "$out" subscriptionId || true)"
  slots="$(pick_field "$out" availableSlots || true)"
  if [[ -z "$plan" ]]; then
    fail "No Web Hosting plan was found. Nothing was purchased. $(redact "$out")"
  fi
  if [[ "$slots" == "0" ]]; then
    fail "The Web Hosting plan ${plan} has no free app slots. Nothing was purchased."
  fi
  note "Attaching the existing Web Hosting plan ${plan}"
  run_gddy gddy hosting subscription attach --env prod --app-id "$GODADDY_APP_ID" --subscription-id "$plan"
}

note "Publishing ${GODADDY_APP_ID}"
set +e
publish_out="$(gddy hosting deployment publish --env prod --app-id "$GODADDY_APP_ID" --timeout 90s 2>&1)"
publish_code=$?
set -e
printf '%s\n' "$publish_out"
if [[ "$publish_code" -ne 0 && "$publish_out" == *"WH_PLAN_REQUIRED"* ]]; then
  attach_existing_plan
  run_gddy gddy hosting deployment publish --env prod --app-id "$GODADDY_APP_ID"
  publish_out="$GD_OUT"
elif [[ "$publish_code" -ne 0 ]]; then
  fail "$(redact "$publish_out")"
fi
GD_OUT="$publish_out"
deployment_id="$(pick_field "$GD_OUT" deploymentId || true)"
if [[ -z "$deployment_id" ]]; then
  fail "Could not read deploymentId from the publish response. $(redact "$GD_OUT")"
fi

wait_for "Publish" gddy hosting deployment get --env prod --app-id "$GODADDY_APP_ID" --deployment-id "$deployment_id"
note "Published ${GODADDY_APP_ID}"
