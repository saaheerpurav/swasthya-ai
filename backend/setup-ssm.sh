#!/usr/bin/env bash
# Creates SSM SecureString parameters for SwasthyaAI in ap-south-1.
# Run once before deploying: bash setup-ssm.sh
set -euo pipefail

export MSYS_NO_PATHCONV=1
# Set your AWS credentials via environment or AWS CLI profile before running
# export AWS_ACCESS_KEY_ID=your-access-key
# export AWS_SECRET_ACCESS_KEY=your-secret-key

REGION="ap-south-1"
STAGE="dev"
PREFIX="/swasthyaai/${STAGE}"

put() {
  aws ssm put-parameter \
    --region "$REGION" \
    --name "${PREFIX}/$1" \
    --value "$2" \
    --type SecureString \
    --overwrite \
    --no-cli-pager
  echo "  stored: ${PREFIX}/$1"
}

echo "Writing SSM parameters to $REGION / $PREFIX ..."

put "jwt-secret"           "your-jwt-secret"
put "admin-api-key"        "your-admin-api-key"
put "openai-api-key"       "your-openai-api-key"
put "twilio-account-sid"   "your-twilio-account-sid"
put "twilio-auth-token"    "your-twilio-auth-token"
put "twilio-whatsapp-from" "whatsapp:+your-whatsapp-number"
put "twilio-sms-from"      "+your-sms-number"

echo "Done."
