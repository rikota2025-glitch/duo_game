#!/bin/bash

PORT=8080
PID_FILE=".server.pid"

start() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Server is already running (PID: $(cat "$PID_FILE"))"
    echo "http://localhost:$PORT"
    return
  fi
  uv run python -m http.server "$PORT" &>/dev/null &
  echo $! > "$PID_FILE"
  echo "Server started on http://localhost:$PORT (PID: $!)"
}

stop() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    kill "$(cat "$PID_FILE")"
    rm -f "$PID_FILE"
    echo "Server stopped"
  else
    rm -f "$PID_FILE"
    echo "Server is not running"
  fi
}

case "${1:-start}" in
  start) start ;;
  stop)  stop ;;
  restart) stop; start ;;
  *) echo "Usage: $0 {start|stop|restart}" ;;
esac
