#!/bin/sh
set -e

LOG_DIR=/var/log/nginx
ACCESS_LOG=$LOG_DIR/access.log
ERROR_LOG=$LOG_DIR/error.log

# 1) 심볼릭 링크라면 지우고, 실제 파일이면 놔둔다
if [ -L "$ACCESS_LOG" ]; then
  rm "$ACCESS_LOG"
fi
if [ -L "$ERROR_LOG" ]; then
  rm "$ERROR_LOG"
fi

# 2) 로그 파일이 없으면(처음 시작 시) 생성
[ -e "$ACCESS_LOG" ] || touch "$ACCESS_LOG"
[ -e "$ERROR_LOG" ] || touch "$ERROR_LOG"

# 3) 권한 설정
chown www-data:www-data "$ACCESS_LOG" "$ERROR_LOG"

# 4) nginx 실행
exec nginx -g 'daemon off;'
