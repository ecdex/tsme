#!/usr/bin/env bash
# Environment tree:
#
#   _default.sh
#   ├── development.sh
#   │   └── test.sh
#   └── production.sh
#       └── staging.sh.sh
#
# This provides DRY flexibilty, but in practice I recommend using mainly
# development.sh and production.sh, and duplication keys between them
# so you can easily compare side by side.
# Then just use _default.sh, test.sh, staging.sh for tweaks, to keep things
# clear.
#
# These variables are mandatory and have special meaning
#
#   - NODE_APP_PREFIX="MYAPP" # filter and nest vars starting with MYAPP right into your app
#   - NODE_ENV="production"   # the environment your program thinks it's running
#   - DEPLOY_ENV="staging"    # the machine you are actually running on
#   - DEBUG=*.*               # Used to control debug levels per module

export NODE_APP_PREFIX="TSME"
export TSME_SERVER_PORT="3000"
export TSME_CONTENT_BASEPATH="content"

export multi="spec=-"
