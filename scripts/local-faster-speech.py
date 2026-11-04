"""Offline, file-backed multilingual small ASR; never downloads or calls a provider."""

import argparse
import ctypes
from ctypes import wintypes
import json
import math
import os
from pathlib import Path
import socket
import sys
import time
import wave


def resources():
    class Counters(ctypes.Structure):
        _fields_ = [("cb", wintypes.DWORD), ("faults", wintypes.DWORD)] + [
            (name, ctypes.c_size_t) for name in (
                "peak", "working", "peakPaged", "paged", "peakNonPaged", "nonPaged", "page", "peakPage"
            )
        ]
    value = Counters()
    value.cb = ctypes.sizeof(value)
    if not ctypes.windll.psapi.GetProcessMemoryInfo(wintypes.HANDLE(-1), ctypes.byref(value), value.cb):
        raise RuntimeError("local_speech_memory_unavailable")
    if value.peak > 6 * 1024 ** 3:
        raise RuntimeError("local_speech_memory_limit")
    return {"peakRssMiB": round(value.peak / 1024 ** 2, 1), "cpuSeconds": round(time.process_time(), 2)}


def transcribe(model_path, audio, output, threads, batch, vad=True, compute="int8", beam=5):
    started = time.perf_counter()
    os.environ.update({
        "HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1",
        "HF_HUB_DISABLE_TELEMETRY": "1", "HF_HUB_DISABLE_XET": "1",
        "OMP_NUM_THREADS": str(threads), "OPENBLAS_NUM_THREADS": "1",
    })

    def no_network(*_args, **_kwargs):
        raise RuntimeError("local_speech_network_forbidden")

    socket.socket.connect = no_network
    socket.create_connection = no_network
    socket.getaddrinfo = no_network
    with wave.open(str(audio), "rb") as wav:
        if wav.getnchannels() != 1 or wav.getsampwidth() != 2 or wav.getframerate() != 16000:
            raise ValueError("local_speech_audio_invalid")
        duration_ms = round(wav.getnframes() * 1000 / wav.getframerate())
    if duration_ms <= 0 or duration_ms > 15 * 60 * 1000:
        raise ValueError("local_speech_audio_invalid")
    from faster_whisper import BatchedInferencePipeline, WhisperModel

    imported = time.perf_counter()
    model = WhisperModel(
        str(model_path), device="cpu", compute_type=compute,
        cpu_threads=threads, num_workers=1, local_files_only=True,
    )
    loaded = time.perf_counter()
    resources()
    engine = BatchedInferencePipeline(model=model) if batch > 1 else model
    settings = dict(
        language=None, task="transcribe", beam_size=beam, best_of=5,
        temperature=0, condition_on_previous_text=True,
        word_timestamps=True, without_timestamps=False, vad_filter=vad,
        vad_parameters={"min_silence_duration_ms": 500},
    )
    if batch > 1:
        settings["batch_size"] = batch
    segments, info = engine.transcribe(str(audio), **settings)
    words = []
    for segment in segments:
        resources()
        for word in segment.words or []:
            if not math.isfinite(word.start) or not math.isfinite(word.end):
                raise ValueError("local_speech_clock_invalid")
            begin, end = round(word.start * 1000), round(word.end * 1000)
            if begin < 0 or end > duration_ms + 80 or end < begin:
                raise ValueError("local_speech_clock_invalid")
            text = word.word.strip()
            if not text:
                continue
            if end == begin:
                if words:
                    words[-1]["text"] += text
                else:
                    raise ValueError("local_speech_clock_invalid")
                continue
            words.append({"text": text, "offsets": {"from": begin, "to": min(end, duration_ms)}})
            if len(words) > 100000:
                raise ValueError("local_speech_output_large")
    finished = time.perf_counter()
    result = {
        "transcription": words, "language": info.language,
        "timings": {
            "importMs": round((imported - started) * 1000),
            "loadMs": round((loaded - imported) * 1000),
            "transcribeMs": round((finished - loaded) * 1000),
            "totalMs": round((finished - started) * 1000),
        },
        "resources": resources(),
    }
    encoded = json.dumps(result, ensure_ascii=False, allow_nan=False).encode("utf-8")
    if len(encoded) > 4 * 1024 ** 2 or not words:
        raise ValueError("local_speech_output_invalid")
    temporary = Path(str(output) + ".partial")
    if output.exists():
        raise ValueError("local_speech_output_exists")
    try:
        with temporary.open("xb") as handle:
            handle.write(encoded)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    return result["timings"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--threads", required=True, type=int, choices=[2, 4, 6, 8])
    parser.add_argument("--batch", required=True, type=int, choices=[1, 2, 4, 8])
    parser.add_argument("--no-vad", action="store_true")
    parser.add_argument("--compute", choices=["int8", "int16", "float32"], default="int8")
    parser.add_argument("--beam", type=int, choices=[5, 10], default=5)
    args = parser.parse_args()
    try:
        transcribe(args.model, args.audio, args.output, args.threads, args.batch, not args.no_vad, args.compute, args.beam)
    except Exception:
        sys.stderr.write("local_speech_failed\n")
        sys.exit(1)
