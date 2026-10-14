#!/usr/bin/env sh
# Prints fresh values for the secrets required by .env.
for name in POSTGRES_PASSWORD JWT_ACCESS_SECRET OTP_SECRET INTERNAL_API_KEY REVALIDATE_SECRET; do
  printf '%s=%s\n' "$name" "$(openssl rand -base64 48 | tr -d '\n=+/' | cut -c1-48)"
done
