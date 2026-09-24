#!/usr/bin/env bash
# assemble-video.sh — assemble the AFTERBUILD demo video from GENUINE screen recordings.
#
# This script never generates product footage. It trims, crops, scales, holds, captions,
# concatenates and muxes clips that the owner recorded from the real app, plus separately
# recorded narration. It refuses to build until every referenced recording exists.
#
# Usage (run from anywhere; paths resolve relative to this script's directory):
#   submission/assemble-video.sh init                 # write raw/cuts.tsv + raw/narration.tsv templates
#   submission/assemble-video.sh check                # validate inputs, print the timeline
#   submission/assemble-video.sh frame <file> <sec>   # extract a PNG still to measure crop coordinates
#   submission/assemble-video.sh build                # render submission/afterbuild-demo.mp4
#   submission/assemble-video.sh singletake <file> <in> <out>   # fallback: trim one continuous take
#
# Env: END_CARD=1 appends a 3 s plain end card. FONT overrides the caption font file.
#
# Requires: ffmpeg/ffprobe with libx264, libfreetype (drawtext), tpad, loudnorm, adelay, amix.
# Verified against ffmpeg 6.1.1 on 2026-09-24.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAW="$SCRIPT_DIR/raw"
BUILD="$SCRIPT_DIR/build"
OUT="$SCRIPT_DIR/afterbuild-demo.mp4"
CUTS="$RAW/cuts.tsv"
NARR="$RAW/narration.tsv"
FONT="${FONT:-/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf}"
LIVE_URL="rishidar-lab.github.io/afterbuild"

W=1920; H=1080; FPS=30
VCODEC=(-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r "$FPS")
MAX_SECONDS=180
TARGET_MIN=115; TARGET_MAX=135

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { printf '[%s] %s\n' "$(ts)" "$*"; }
die() { printf '[%s] ERROR: %s\n' "$(ts)" "$*" >&2; exit 1; }

need() { command -v "$1" >/dev/null 2>&1 || die "missing tool: $1"; }
need ffmpeg; need ffprobe; need awk

dur() { ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$1"; }

# ---------------------------------------------------------------- init
cmd_init() {
  mkdir -p "$RAW" "$BUILD"
  if [[ -e "$CUTS" ]]; then log "exists, not overwriting: $CUTS"; else
    cat >"$CUTS" <<'EOF'
# clip	source	in	out	hold	crop	caption	cap_in	cap_out
# clip    : two-digit id, ordering key
# source  : file in raw/ (a per-clip file or the single continuous take); ENDCARD is generated
# in/out  : seconds in the source (decimals ok). "?" blocks the build until filled.
# hold    : seconds to freeze the LAST frame (tpad clone). 0 for none. Wow clips: 5 and 4.
# crop    : none | W:H:X:Y in SOURCE pixels (static punch-in, scaled back to 1920x1080)
# caption : - for none. Text is burned bottom-left between cap_in and cap_out (rel. to clip start).
#           Two captions on one clip: add a second row with the same clip id and in/out.
01	clip01-take1.mkv	?	?	0	none	-	0	0
02	clip02-take1.mkv	?	?	0	none	REAL GIT DIFF	2	7
03	clip03-take1.mkv	?	?	0	none	LOCAL + DETERMINISTIC	2	7
04	clip04-take1.mkv	?	?	5	none	CONCEPT → EXACT EVIDENCE	0.5	4.5
04	clip04-take1.mkv	?	?	5	none	TRACEABLE TO THE REAL DIFF	6	12.5
05	clip05-take1.mkv	?	?	4	none	-	0	0
06	clip06-take1.mkv	?	?	0	none	-	0	0
07	clip07-take1.mkv	?	?	0	none	PERSONAL LEARNING PATH	2	7
08	clip08-take1.mkv	?	?	0	none	GROUNDED QUIZ	2	7
09	clip09-take1.mkv	?	?	0	none	-	0	0
EOF
    log "wrote template $CUTS"
  fi
  if [[ -e "$NARR" ]]; then log "exists, not overwriting: $NARR"; else
    cat >"$NARR" <<'EOF'
# segment	file	start_seconds
# One WAV per narration segment (FABLE-FINAL-NARRATION.md), placed at its timeline start.
S1	narr01.wav	0
S2	narr02.wav	11
S3	narr03.wav	27
S4	narr04.wav	43
S5	narr05.wav	76
S6	narr06.wav	98
S7	narr07.wav	113
EOF
    log "wrote template $NARR"
  fi
  log "next: record the clips (FABLE-CAPTURE-PLAN.md), fill in/out in $CUTS, then: $0 check"
}

# ---------------------------------------------------------------- parsing
# Emits: clip source in out hold crop caption cap_in cap_out (tab-separated), comments stripped.
read_cuts() {
  [[ -f "$CUTS" ]] || die "missing $CUTS (run: $0 init)"
  grep -vE '^\s*(#|$)' "$CUTS" | awk -F'\t' 'NF>=9 {print} NF<9 {print "BAD\t" $0}'
}
read_narr() {
  [[ -f "$NARR" ]] || die "missing $NARR (run: $0 init)"
  grep -vE '^\s*(#|$)' "$NARR"
}

# ---------------------------------------------------------------- check
cmd_check() {
  local ok=1 total=0 line
  log "checking $CUTS"
  local prev_clip="" first_row=1
  while IFS=$'\t' read -r clip source in out hold crop caption cap_in cap_out; do
    [[ "$clip" == "BAD" ]] && { log "  malformed row: $source"; ok=0; continue; }
    if [[ "$source" != "ENDCARD" && ! -f "$RAW/$source" ]]; then
      log "  clip $clip: MISSING recording raw/$source"; ok=0
    fi
    if [[ "$in" == "?" || "$out" == "?" ]]; then
      log "  clip $clip: in/out not filled"; ok=0; continue
    fi
    if [[ "$clip" != "$prev_clip" ]]; then
      local d
      d=$(awk -v a="$in" -v b="$out" -v h="$hold" 'BEGIN{printf "%.2f", (b-a)+h}')
      awk -v a="$in" -v b="$out" 'BEGIN{exit !(b>a)}' || { log "  clip $clip: out must be > in"; ok=0; }
      local start
      start=$(awk -v t="$total" 'BEGIN{printf "%02d:%05.2f", int(t/60), t-60*int(t/60)}')
      printf '  clip %s  at %s  dur %6ss  src=%s [%s..%s] hold=%s crop=%s\n' \
        "$clip" "$start" "$d" "$source" "$in" "$out" "$hold" "$crop"
      total=$(awk -v t="$total" -v d="$d" 'BEGIN{printf "%.2f", t+d}')
      prev_clip="$clip"
    fi
  done < <(read_cuts)
  if [[ "${END_CARD:-0}" == "1" ]]; then total=$(awk -v t="$total" 'BEGIN{printf "%.2f", t+3}'); log "  + end card 3s"; fi
  log "video timeline total: ${total}s (target ${TARGET_MIN}-${TARGET_MAX}s, hard max ${MAX_SECONDS}s)"
  awk -v t="$total" -v m="$MAX_SECONDS" 'BEGIN{exit !(t<=m)}' || { log "  OVER HARD MAX"; ok=0; }

  log "checking $NARR"
  local prev_start="" prev_file="" prev_seg=""
  while IFS=$'\t' read -r seg file start; do
    if [[ ! -f "$RAW/$file" ]]; then log "  $seg: MISSING raw/$file"; ok=0; continue; fi
    local nd; nd=$(dur "$RAW/$file")
    printf '  %s  start %5ss  file %s  dur %.2fs\n' "$seg" "$start" "$file" "$nd"
    if [[ -n "$prev_start" ]]; then
      local slot; slot=$(awk -v a="$prev_start" -v b="$start" 'BEGIN{printf "%.2f", b-a}')
      local pd; pd=$(dur "$RAW/$prev_file")
      awk -v s="$slot" -v d="$pd" 'BEGIN{exit !(d<=s)}' || log "  WARNING: $prev_seg runs ${pd}s but its slot is ${slot}s — re-record it"
    fi
    prev_start="$start"; prev_file="$file"; prev_seg="$seg"
  done < <(read_narr)

  [[ -f "$FONT" ]] || { log "  caption font missing: $FONT (set FONT=...)"; ok=0; }
  [[ "$ok" == "1" ]] && log "CHECK OK — run: $0 build" || die "check failed; fix the items above"
}

# ---------------------------------------------------------------- frame
cmd_frame() {
  local file="${1:?file}" t="${2:?seconds}"
  mkdir -p "$BUILD"
  local src="$file"; [[ -f "$src" ]] || src="$RAW/$file"
  [[ -f "$src" ]] || die "no such file: $file"
  local png="$BUILD/frame-$(basename "${src%.*}")-${t}.png"
  ffmpeg -v error -y -ss "$t" -i "$src" -frames:v 1 "$png"
  local res; res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src")
  log "wrote $png (source ${res}); measure the crop rectangle W:H:X:Y in these pixels"
}

# ---------------------------------------------------------------- build helpers
vf_for() {
  # $1 crop, $2 hold, $3 caption-textfile list (comma-separated "file@in@out" entries or empty)
  local crop="$1" hold="$2" caps="$3" vf=""
  if [[ "$crop" != "none" ]]; then
    IFS=':' read -r cw ch cx cy <<<"$crop"
    vf+="crop=${cw}:${ch}:${cx}:${cy},"
  fi
  vf+="scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,fps=${FPS},format=yuv420p"
  if awk -v h="$hold" 'BEGIN{exit !(h>0)}'; then vf+=",tpad=stop_mode=clone:stop_duration=${hold}"; fi
  if [[ -n "$caps" ]]; then
    local entry
    IFS=',' read -ra entries <<<"$caps"
    for entry in "${entries[@]}"; do
      IFS='@' read -r tf ci co <<<"$entry"
      vf+=",drawtext=fontfile=${FONT}:textfile=${tf}:fontsize=40:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=18:x=60:y=h-th-60:enable='between(t\,${ci}\,${co})'"
    done
  fi
  printf '%s' "$vf"
}

render_endcard() {
  local out="$BUILD/clip99-endcard.mp4"
  printf 'Afterbuild' >"$BUILD/cap-endcard-1.txt"
  printf '%s' "$LIVE_URL" >"$BUILD/cap-endcard-2.txt"
  ffmpeg -v error -y -f lavfi -i "color=c=0x111111:s=${W}x${H}:d=3:r=${FPS}" \
    -vf "drawtext=fontfile=${FONT}:textfile=$BUILD/cap-endcard-1.txt:fontsize=84:fontcolor=white:x=(w-tw)/2:y=(h/2)-th-16,drawtext=fontfile=${FONT}:textfile=$BUILD/cap-endcard-2.txt:fontsize=40:fontcolor=0xBBBBBB:x=(w-tw)/2:y=(h/2)+24,format=yuv420p" \
    -an "${VCODEC[@]}" "$out"
  printf '%s' "$out"
}

# ---------------------------------------------------------------- build
cmd_build() {
  cmd_check
  mkdir -p "$BUILD"
  : >"$BUILD/concat.txt"

  # Group rows by clip id (a clip may have several caption rows).
  local ids; ids=$(read_cuts | awk -F'\t' '$1!="BAD"{print $1}' | awk '!seen[$0]++')
  local id
  for id in $ids; do
    local rows; rows=$(read_cuts | awk -F'\t' -v c="$id" '$1==c')
    local source in out hold crop
    IFS=$'\t' read -r _ source in out hold crop _ _ _ <<<"$(printf '%s\n' "$rows" | head -1)"
    local caps="" n=0
    while IFS=$'\t' read -r _ _ _ _ _ _ caption cap_in cap_out; do
      [[ "$caption" == "-" || -z "$caption" ]] && continue
      n=$((n+1)); local tf="$BUILD/cap-${id}-${n}.txt"
      printf '%s' "$caption" >"$tf"
      caps+="${caps:+,}${tf}@${cap_in}@${cap_out}"
    done <<<"$rows"
    local outfile="$BUILD/clip${id}.mp4"
    if [[ "$source" == "ENDCARD" ]]; then outfile=$(render_endcard); else
      log "rendering clip $id from raw/$source [$in..$out] hold=$hold crop=$crop captions=$n"
      ffmpeg -v error -y -ss "$in" -to "$out" -i "$RAW/$source" \
        -vf "$(vf_for "$crop" "$hold" "$caps")" -an "${VCODEC[@]}" "$outfile"
    fi
    printf "file '%s'\n" "$outfile" >>"$BUILD/concat.txt"
  done
  if [[ "${END_CARD:-0}" == "1" ]]; then
    log "rendering end card"
    printf "file '%s'\n" "$(render_endcard)" >>"$BUILD/concat.txt"
  fi

  log "concatenating video"
  ffmpeg -v error -y -f concat -safe 0 -i "$BUILD/concat.txt" -c copy "$BUILD/video.mp4"
  local vdur; vdur=$(dur "$BUILD/video.mp4")
  log "video duration: ${vdur}s"

  log "building narration track"
  local inputs=(-f lavfi -t "$vdur" -i "anullsrc=r=48000:cl=mono") filter="" i=0 labels="[0:a]"
  while IFS=$'\t' read -r seg file start; do
    i=$((i+1))
    inputs+=(-i "$RAW/$file")
    local ms; ms=$(awk -v s="$start" 'BEGIN{printf "%d", s*1000}')
    filter+="[${i}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay=${ms}:all=1[a${i}];"
    labels+="[a${i}]"
  done < <(read_narr)
  # loudnorm upsamples internally; aresample pins the track back to 48 kHz before encoding.
  filter+="${labels}amix=inputs=$((i+1)):normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[aout]"
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[aout]" -ar 48000 -c:a pcm_s16le "$BUILD/narration.wav"

  log "muxing"
  ffmpeg -v error -y -i "$BUILD/video.mp4" -i "$BUILD/narration.wav" \
    -map 0:v -map 1:a -c:v copy -c:a aac -ar 48000 -b:a 160k -shortest -movflags +faststart "$OUT"

  local fdur; fdur=$(dur "$OUT")
  awk -v t="$fdur" -v m="$MAX_SECONDS" 'BEGIN{exit !(t<=m)}' || die "final video ${fdur}s exceeds ${MAX_SECONDS}s"
  awk -v t="$fdur" -v a="$TARGET_MIN" -v b="$TARGET_MAX" 'BEGIN{exit !(t>=a && t<=b)}' || log "WARNING: ${fdur}s is outside the ${TARGET_MIN}-${TARGET_MAX}s target"
  log "DONE: $OUT (${fdur}s)"
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate -of default=nw=1 "$OUT"
}

# ---------------------------------------------------------------- singletake (fallback)
cmd_singletake() {
  local file="${1:?file}" in="${2:?in seconds}" out="${3:?out seconds}"
  local src="$file"; [[ -f "$src" ]] || src="$RAW/$file"
  [[ -f "$src" ]] || die "no such file: $file"
  mkdir -p "$BUILD"
  log "fallback single take: $src [$in..$out]"
  local has_audio; has_audio=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$src" | head -1 || true)
  if [[ -n "$has_audio" ]]; then
    ffmpeg -v error -y -ss "$in" -to "$out" -i "$src" \
      -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,fps=${FPS},format=yuv420p" \
      -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" "${VCODEC[@]}" -c:a aac -ar 48000 -b:a 160k -movflags +faststart "$OUT"
  else
    log "take has no audio track; output will be silent (add narration with: build)"
    ffmpeg -v error -y -ss "$in" -to "$out" -i "$src" \
      -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,fps=${FPS},format=yuv420p" \
      -an "${VCODEC[@]}" -movflags +faststart "$OUT"
  fi
  local fdur; fdur=$(dur "$OUT")
  awk -v t="$fdur" -v m="$MAX_SECONDS" 'BEGIN{exit !(t<=m)}' || die "final video ${fdur}s exceeds ${MAX_SECONDS}s"
  log "DONE: $OUT (${fdur}s)"
}

# ---------------------------------------------------------------- main
case "${1:-}" in
  init)       cmd_init ;;
  check)      cmd_check ;;
  frame)      shift; cmd_frame "$@" ;;
  build)      cmd_build ;;
  singletake) shift; cmd_singletake "$@" ;;
  *) sed -n '2,17p' "$0"; exit 2 ;;
esac
