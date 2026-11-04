"""Experimental offline Moonshine benchmark; never used by application startup."""

import argparse
import array
import ctypes
from ctypes import wintypes
import json
import math
import socket
import sys
import time
import wave


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--audio", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--size", choices=["small", "medium"], required=True)
    args = parser.parse_args()

    def offline(*_args, **_kwargs):
        raise RuntimeError("offline_only")

    socket.socket.connect = offline
    socket.create_connection = offline
    socket.getaddrinfo = offline
    started = time.perf_counter()
    from moonshine_voice import ModelArch, Transcriber

    imported = time.perf_counter()
    with wave.open(args.audio, "rb") as audio:
        if (audio.getnchannels(), audio.getsampwidth(), audio.getframerate()) != (1, 2, 16000):
            raise ValueError("audio_invalid")
        duration = audio.getnframes() / 16000
        if not 0 < duration <= 900:
            raise ValueError("audio_invalid")
        data = array.array("h", audio.readframes(audio.getnframes()))
    samples = [value / 32768 for value in data]
    arch = ModelArch.SMALL_STREAMING if args.size == "small" else ModelArch.MEDIUM_STREAMING
    with Transcriber(args.model, arch, options={"word_timestamps": "true"}) as engine:
        loaded = time.perf_counter()
        result = engine.transcribe_without_streaming(samples, sample_rate=16000)
        finished = time.perf_counter()
        words = []
        for line in result.lines:
            for word in line.words or []:
                if not math.isfinite(word.start) or not math.isfinite(word.end):
                    raise ValueError("clock_invalid")
                begin, end = round(word.start * 1000), round(word.end * 1000)
                if not 0 <= begin < end <= round(duration * 1000) + 80:
                    raise ValueError("clock_invalid")
                words.append({"text": word.word, "offsets": {"from": begin, "to": min(end, round(duration * 1000))}})

    class Counters(ctypes.Structure):
        _fields_ = [("cb", wintypes.DWORD), ("faults", wintypes.DWORD)] + [
            (name, ctypes.c_size_t) for name in (
                "peak", "working", "peakPaged", "paged", "peakNonPaged", "nonPaged", "page", "peakPage"
            )
        ]
    counters = Counters()
    counters.cb = ctypes.sizeof(counters)
    if not ctypes.windll.psapi.GetProcessMemoryInfo(wintypes.HANDLE(-1), ctypes.byref(counters), counters.cb):
        raise RuntimeError("resource_measurement_failed")
    value = {
        "transcription": words, "language": "en",
        "timings": {
            "importMs": round((imported - started) * 1000),
            "loadMs": round((loaded - imported) * 1000),
            "transcribeMs": round((finished - loaded) * 1000),
        },
        "resources": {"peakRssMiB": round(counters.peak / 1024 ** 2, 1), "cpuSeconds": round(time.process_time(), 2)},
    }
    encoded = json.dumps(value, allow_nan=False)
    if len(encoded.encode("utf-8")) > 4 * 1024 ** 2 or not words:
        raise ValueError("output_invalid")
    with open(args.output, "x", encoding="utf-8") as output:
        output.write(encoded)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.stderr.write("moonshine_benchmark_failed:" + type(error).__name__ + "\n")
        sys.exit(1)
