FROM nginx:latest

# 1) logrotate 설정이나 cron, 추가 패키지 설치가 필요하면 여기서
#    (예: logrotate 복사, cron 설치 등)

# 2) 커스텀 엔트리포인트 복사
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 3) 기본 엔트리포인트/명령어를 덮어쓰기
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
# CMD 를 지정하지 않으면, 위 스크립트 마지막 줄의 exec nginx ... 가 실행됩니다.
