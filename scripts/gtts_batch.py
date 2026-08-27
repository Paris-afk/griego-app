#!/usr/bin/env python3
"""Sintetiza mp3 de griego con gTTS (alternativa a edge-tts, que hoy devuelve 403).
Lee un manifest JSON [{text, file}] y escribe cada audio. Baja a MP3 mono 48 kbps
con ffmpeg si está disponible (recomendado en §3 paso 3); si no, guarda la salida
de gTTS tal cual. Idempotente: salta archivos que ya existen. Uso:
    python3 scripts/gtts_batch.py <manifest.json>
"""
import json
import os
import subprocess
import sys

from gtts import gTTS


def to_48kbps_mono(src: str, dest: str) -> bool:
    """Intenta re-encodear a MP3 mono 48 kbps. Devuelve True si lo logró."""
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", src, "-codec:a", "libmp3lame", "-b:a", "48k", "-ac", "1", dest],
            check=True,
            capture_output=True,
        )
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def main() -> None:
    manifest = json.load(open(sys.argv[1], encoding="utf-8"))
    ok = skipped = failed = 0
    for item in manifest:
        text = item["text"]
        out = item["file"]
        if os.path.exists(out):
            skipped += 1
            continue
        tmp = out + ".tmp.mp3"
        try:
            gTTS(text, lang="el").save(tmp)
            if to_48kbps_mono(tmp, out):
                os.remove(tmp)
            else:
                os.replace(tmp, out)
            ok += 1
            print(f"OK  {text} -> {os.path.basename(out)}")
        except Exception as exc:  # noqa: BLE001 - reporta y sigue con el resto
            failed += 1
            print(f"ERR {text}: {exc}", file=sys.stderr)
            if os.path.exists(tmp):
                os.remove(tmp)
    print(f"Generados: {ok} · saltados: {skipped} · fallidos: {failed}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
