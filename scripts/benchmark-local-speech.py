"""Explicit owner-sample benchmark. Only aggregate metrics leave private scratch."""

import argparse
import ctypes
from ctypes import wintypes
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import unicodedata
import wave

REPO = Path(__file__).resolve().parent.parent
TOOLS = REPO / ".local-build" / "tools"


def safe_environment(root, threads=4):
    # No ignored env/config, provider key, sign-in token or inherited Python path.
    return {
        "SystemRoot": os.environ["SystemRoot"],
        "PATH": str(TOOLS / "speech") + ";" + os.environ["SystemRoot"] + "\\System32",
        "TEMP": str(root), "TMP": str(root), "NODE_ENV": "test",
        "FAKE_MODE": "true", "PROVIDER_MODE": "fake", "PAID_DEMO_ENABLED": "false",
        "LIVE_ANALYSIS_ENABLED": "false", "LIVE_ASSEMBLY_ENABLED": "false",
        "LIVE_RENDER_ENABLED": "false", "LIVE_IMAGE_GENERATION_ENABLED": "false",
        "CLOUD_SPEND_APPROVED": "false", "HF_HUB_OFFLINE": "1",
        "HF_HUB_DISABLE_TELEMETRY": "1", "TRANSFORMERS_OFFLINE": "1",
        "OMP_NUM_THREADS": str(threads), "OPENBLAS_NUM_THREADS": str(threads),
    }


class MemoryCounters(ctypes.Structure):
    _fields_ = [("cb", wintypes.DWORD), ("faults", wintypes.DWORD)] + [
        (name, ctypes.c_size_t) for name in (
            "peak", "working", "peakPaged", "paged", "peakNonPaged", "nonPaged", "page", "peakPage"
        )
    ]


def resource_sample(handle):
    counters = MemoryCounters()
    counters.cb = ctypes.sizeof(counters)
    ctypes.windll.psapi.GetProcessMemoryInfo(wintypes.HANDLE(int(handle)), ctypes.byref(counters), counters.cb)
    creation, exit_time, kernel, user = (wintypes.FILETIME() for _ in range(4))
    ctypes.windll.kernel32.GetProcessTimes(wintypes.HANDLE(int(handle)), ctypes.byref(creation), ctypes.byref(exit_time), ctypes.byref(kernel), ctypes.byref(user))
    ticks = sum((item.dwHighDateTime << 32) + item.dwLowDateTime for item in (kernel, user))
    return counters.peak, ticks / 10000000


def execute(command, root, error_file, deadline=900, threads=4, stdout_file=None):
    started = time.perf_counter()
    peak = cpu = 0
    from contextlib import ExitStack
    with ExitStack() as stack:
        errors = stack.enter_context(error_file.open("xb"))
        output = stack.enter_context(stdout_file.open("xb")) if stdout_file else subprocess.DEVNULL
        child = subprocess.Popen(command, cwd=root, env=safe_environment(root, threads), stdin=subprocess.DEVNULL,
                                 stdout=output, stderr=errors, creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            while child.poll() is None:
                memory, consumed = resource_sample(child._handle)
                peak, cpu = max(peak, memory), max(cpu, consumed)
                if time.perf_counter() - started > deadline or peak > 6 * 1024 ** 3 or error_file.stat().st_size > 8 * 1024 ** 2 or (stdout_file and stdout_file.stat().st_size > 8 * 1024 ** 2):
                    subprocess.run([str(Path(os.environ["SystemRoot"]) / "System32/taskkill.exe"), "/PID", str(child.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
                    child.wait(timeout=10)
                    raise RuntimeError("benchmark_resource_limit")
                time.sleep(0.1)
            memory, consumed = resource_sample(child._handle)
            peak, cpu = max(peak, memory), max(cpu, consumed)
            return {
                "exitCode": child.returncode, "wallMs": round((time.perf_counter() - started) * 1000),
                "peakRssMiB": round(peak / 1024 ** 2, 1), "cpuSeconds": round(cpu, 2),
            }
        finally:
            if child.poll() is None:
                subprocess.run([str(Path(os.environ["SystemRoot"]) / "System32/taskkill.exe"), "/PID", str(child.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
                child.wait(timeout=10)


def normalized(text):
    return "".join(char for char in unicodedata.normalize("NFKC", text).lower() if char.isalnum() or char == "'")


def words_from_output(value, duration):
    words = []
    for segment in value["transcription"]:
        tokens = segment["text"].strip().split()
        begin, end = max(0, round(segment["offsets"]["from"])), min(duration, round(segment["offsets"]["to"]))
        for index, text in enumerate(tokens):
            a, b = round(begin + (end - begin) * index / len(tokens)), round(begin + (end - begin) * (index + 1) / len(tokens))
            if b > a:
                words.append({"text": text, "startMs": a, "endMs": b})
    return words


def parakeet_words(text, duration):
    words, current = [], None
    def flush():
        if current and current["text"].strip():
            if not 0 <= current["startMs"] < current["endMs"] <= duration:
                raise ValueError("benchmark_parakeet_clock_invalid")
            current["text"] = current["text"].strip()
            words.append(dict(current))
    for begin, end, new, token in re.findall(r't0=\s*(\d+)\s+t1=\s*(\d+)\s+word_start=(true|false)\s+"(.*)"', text):
        if new == "true":
            flush()
            current = {"text": "", "startMs": int(begin) * 10, "endMs": int(end) * 10}
        if current is not None:
            current["text"] += token.replace("▁", " ")
            current["endMs"] = max(current["endMs"], int(end) * 10)
    flush()
    if not words:
        raise ValueError("benchmark_parakeet_words_missing")
    return words


def comparison(reference, words, duration):
    if len(reference) > 10000 or len(words) > 10000 or len(reference) * len(words) > 20000000:
        raise ValueError("benchmark_alignment_large")
    a, b = [normalized(w["text"]) for w in reference], [normalized(w["text"]) for w in words]
    # Full alignment keeps repeated words from being paired with distant instances.
    width = len(b) + 1
    from array import array
    rows = [array("H", range(width))]
    for i, left in enumerate(a, 1):
        row = array("H", [i] + [0] * len(b))
        for j, right in enumerate(b, 1):
            row[j] = min(rows[i - 1][j] + 1, row[j - 1] + 1, rows[i - 1][j - 1] + (left != right))
        rows.append(row)
    i, j, drifts, starts, matched = len(a), len(b), [], [], 0
    while i or j:
        if i and j and rows[i][j] == rows[i - 1][j - 1] + (a[i - 1] != b[j - 1]):
            if a[i - 1] == b[j - 1]:
                matched += 1
                drifts += [abs(reference[i - 1][edge] - words[j - 1][edge]) for edge in ("startMs", "endMs")]
                starts.append(abs(reference[i - 1]["startMs"] - words[j - 1]["startMs"]))
            i -= 1
            j -= 1
        elif i and rows[i][j] == rows[i - 1][j] + 1:
            i -= 1
        else:
            j -= 1
    drifts.sort()
    starts.sort()
    percentile = lambda p: drifts[min(len(drifts) - 1, math.floor((len(drifts) - 1) * p))] if drifts else None
    invalid = sum(not (0 <= w["startMs"] < w["endMs"] <= duration) or (k and w["startMs"] < words[k - 1]["startMs"]) for k, w in enumerate(words))
    return {
        "referenceWords": len(reference), "words": len(words),
        "referenceWerPercent": round(rows[-1][-1] / max(1, len(a)) * 100, 3),
        "matchedPercent": round(matched / max(1, len(a)) * 100, 3),
        "medianClockDeltaMs": percentile(0.5), "p95ClockDeltaMs": percentile(0.95),
        "medianStartDeltaMs": starts[len(starts) // 2] if starts else None,
        "p95StartDeltaMs": starts[math.floor((len(starts) - 1) * .95)] if starts else None,
        "invalidClocks": invalid,
        "lastWordDeltaMs": abs(words[-1]["endMs"] - reference[-1]["endMs"]) if words and reference else None,
    }


def record(root, row):
    with (root / "ledger.jsonl").open("a", encoding="utf-8") as ledger:
        ledger.write(json.dumps(row, allow_nan=False) + "\n")
    print(json.dumps(row, allow_nan=False), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scratch", required=True, type=Path)
    parser.add_argument("--prepare", action="store_true")
    parser.add_argument("--engine", choices=["cpp", "faster", "parakeet", "moonshine"])
    parser.add_argument("--moonshine-size", choices=["small", "medium"], default="small")
    parser.add_argument("--parakeet-chunks", action="store_true")
    parser.add_argument("--model-kind", choices=["small", "distil"], default="small")
    parser.add_argument("--threads", type=int, choices=[2, 3, 4, 6, 8], default=4)
    parser.add_argument("--processors", type=int, choices=[1, 2], default=1)
    parser.add_argument("--batch", type=int, choices=[1, 2, 4, 8], default=1)
    parser.add_argument("--quantized", action="store_true")
    parser.add_argument("--blas", action="store_true")
    parser.add_argument("--profile", action="store_true")
    parser.add_argument("--no-context", action="store_true")
    parser.add_argument("--no-vad", action="store_true")
    parser.add_argument("--compute", choices=["int8", "int16", "float32"], default="int8")
    parser.add_argument("--beam", type=int, choices=[5, 10], default=5)
    parser.add_argument("--sample", choices=["screen", "late", "full", "gold", "gold2"], default="screen")
    parser.add_argument("--label", required=True)
    args = parser.parse_args()
    root = args.scratch.resolve(strict=True)
    if not root.name.startswith("clipbuilder-asr-benchmark-") or root.parent != Path(os.environ["TEMP"]).resolve():
        raise ValueError("benchmark_scratch_invalid")
    if not re.fullmatch(r"[a-z0-9-]{1,70}", args.label):
        raise ValueError("benchmark_label_invalid")
    lock = root / "running.lock"
    with lock.open("x"):
        pass
    row = {"label": args.label, "engine": args.engine, "modelKind": args.model_kind, "threads": args.threads, "processors": args.processors, "batch": args.batch, "sample": args.sample, "quantized": args.quantized, "blas": args.blas, "vad": not args.no_vad, "compute": args.compute, "beam": args.beam, "previousContext": not args.no_context}
    started = time.perf_counter()
    try:
        private = json.loads((root / "private-input.json").read_text(encoding="utf-8-sig"))
        if args.prepare:
            ffmpeg = TOOLS / "ffmpeg-release/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe"
            window = private["window"]
            metrics = execute([str(ffmpeg), "-nostdin", "-n", "-v", "error", "-threads", "2", "-ss", str(window["startMs"] / 1000), "-i", private["source"], "-t", str((window["endMs"] - window["startMs"]) / 1000), "-map", "0:a:0", "-vn", "-sn", "-dn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", "-map_metadata", "-1", str(root / "full.wav")], root, root / (args.label + ".stderr"))
            if metrics["exitCode"]:
                raise RuntimeError("benchmark_extract_failed")
            with wave.open(str(root / "full.wav"), "rb") as source:
                for name, offset, duration in [("screen", 90, 90), ("late", 330, 90)]:
                    source.setpos(offset * 16000)
                    with wave.open(str(root / (name + ".wav")), "wb") as out:
                        out.setparams(source.getparams())
                        out.writeframes(source.readframes(duration * 16000))
            row.update(metrics, outcome="succeeded", operation="extract")
        else:
            wav, output = root / (args.sample + ".wav"), root / (args.label + ".json")
            with wave.open(str(wav), "rb") as audio:
                duration = round(audio.getnframes() * 1000 / audio.getframerate())
            if args.engine == "cpp":
                model = TOOLS / ("speech-candidates/ggml-small-q5_1.bin" if args.quantized else "speech/ggml-small.bin")
                if args.model_kind == "distil":
                    model = TOOLS / "speech-candidates/ggml-distil-small.en.bin"
                command = [str(TOOLS / ("whisper-blas/whisper-cli.exe" if args.blas else "speech/whisper-cli.exe")), "-m", str(model), "-f", str(wav), "-l", "auto", "-t", str(args.threads), "-p", str(args.processors), "-ml", "1", "-sow", "-oj", "-of", str(output.with_suffix("")), "-ng", "-nf"]
                if not args.profile:
                    command.append("-np")
                if args.no_context:
                    command.extend(["-mc", "0"])
            elif args.engine == "parakeet":
                command = [str(TOOLS / "whisper-blas/parakeet-cli.exe"), "-m", str(TOOLS / "speech-candidates/ggml-parakeet-tdt-0.6b-v3-q8_0.bin"), "-f", str(wav), "-t", str(args.threads), "-ng", "-ps"]
            elif args.engine == "moonshine":
                manifest = json.loads((TOOLS / "moonshine-speech/model-manifest.json").read_text(encoding="utf-8"))
                command = [str(TOOLS / "moonshine-speech/venv/Scripts/python.exe"), "-I", "-B", "-X", "utf8", str(REPO / "scripts/benchmark-moonshine.py"), "--model", manifest[args.moonshine_size]["path"], "--size", args.moonshine_size, "--audio", str(wav), "--output", str(output)]
                row.update(modelKind=args.moonshine_size, threads="engine-default")
            elif args.engine == "faster":
                command = [str(TOOLS / "faster-speech/runtime/Scripts/python.exe"), "-I", "-B", "-X", "utf8", str(REPO / "scripts/local-faster-speech.py"), "--model", str(TOOLS / "faster-speech/model"), "--audio", str(wav), "--output", str(output), "--threads", str(args.threads), "--batch", str(args.batch)]
                if args.no_vad:
                    command.append("--no-vad")
                command.extend(["--compute", args.compute, "--beam", str(args.beam)])
            else:
                raise ValueError("benchmark_engine_required")
            error_file = root / (args.label + ".stderr")
            transcript_file = root / (args.label + ".native.txt") if args.engine == "parakeet" else None
            if args.engine == "parakeet" and args.parakeet_chunks:
                words, chunks, peak, cpu = [], [], 0, 0
                with wave.open(str(wav), "rb") as audio:
                    for core in range(0, duration, 60000):
                        end = min(duration, core + 60000)
                        begin, stop = max(0, core - 2000), min(duration, end + 2000)
                        part = root / (args.label + "-" + str(core) + ".wav")
                        audio.setpos(begin * 16)
                        with wave.open(str(part), "wb") as target:
                            target.setparams(audio.getparams())
                            target.writeframes(audio.readframes((stop - begin) * 16))
                        command[command.index("-f") + 1] = str(part)
                        out = root / (args.label + "-" + str(core) + ".native.txt")
                        err = root / (args.label + "-" + str(core) + ".stderr")
                        measured = execute(command, root, err, threads=args.threads, stdout_file=out)
                        chunks.append(measured["wallMs"])
                        row["chunkWallMs"] = chunks
                        peak, cpu = max(peak, measured["peakRssMiB"]), cpu + measured["cpuSeconds"]
                        if measured["exitCode"]:
                            raise RuntimeError("benchmark_engine_failed")
                        for word in parakeet_words(out.read_text(encoding="utf-8") + "\n" + err.read_text(encoding="utf-8"), stop - begin):
                            word = {**word, "startMs": word["startMs"] + begin, "endMs": word["endMs"] + begin}
                            if core <= (word["startMs"] + word["endMs"]) / 2 < end:
                                words.append(word)
                        part.unlink()
                metrics = {"exitCode": 0, "wallMs": round((time.perf_counter() - started) * 1000), "peakRssMiB": peak, "cpuSeconds": round(cpu, 2)}
                row["chunkCoreMs"] = 60000
                row["chunkOverlapMs"] = 2000
            else:
                metrics = execute(command, root, error_file, threads=args.threads, stdout_file=transcript_file)
            if args.profile:
                row["nativeTimingsMs"] = {name.strip(): float(value) for name, value in re.findall(r"whisper_print_timings:\s+([a-z]+) time\s+=\s+([0-9.]+) ms", error_file.read_text(errors="replace"))}
            row.update(metrics, inputDurationMs=duration)
            if metrics["exitCode"]:
                raise RuntimeError("benchmark_engine_failed")
            if args.engine == "parakeet":
                if not args.parakeet_chunks:
                    words = parakeet_words(transcript_file.read_text(encoding="utf-8") + "\n" + error_file.read_text(encoding="utf-8"), duration)
                value = {}
            else:
                if output.stat().st_size > 4 * 1024 ** 2:
                    raise ValueError("benchmark_output_large")
                value = json.loads(output.read_text(encoding="utf-8"))
                words = words_from_output(value, duration)
            offset = {"screen": 90000, "late": 330000, "full": 0, "gold": 0, "gold2": 0}[args.sample] + private["window"]["startMs"]
            reference = [{**w, "startMs": w["startMs"] - offset, "endMs": w["endMs"] - offset} for w in private["referenceWords"] if offset <= (w["startMs"] + w["endMs"]) / 2 < offset + duration]
            if args.sample.startswith("gold"):
                boundaries = json.loads((root / (args.sample + "-reference.json")).read_text(encoding="utf-8-sig"))["boundaries"]
                if any(not 0 <= item["startMs"] < duration for item in boundaries):
                    raise ValueError("benchmark_reference_clock_invalid")
                reference = [{"text": item["text"], "startMs": item["startMs"], "endMs": boundaries[i + 1]["startMs"] if i + 1 < len(boundaries) else duration} for i, item in enumerate(boundaries)]
            row.update(comparison(reference, words, duration), timings=value.get("timings"), language=value.get("language"), outcome="succeeded")
            if args.engine in ["faster", "moonshine"]:
                row.update(value.get("resources", {"peakRssMiB": None, "cpuSeconds": None}))
                row["resourcesScope"] = "inference-process" if value.get("resources") else "unmeasured-venv-launcher"
            excerpt_baseline = root / ("cpp-t4-" + args.sample + ".words.json")
            if args.sample != "full" and excerpt_baseline.exists():
                row["versusSameExcerptBaseline"] = comparison(json.loads(excerpt_baseline.read_text(encoding="utf-8")), words, duration)
            row["realtimeFactor"] = round(metrics["wallMs"] / duration, 4)
            (root / (args.label + ".words.json")).write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    except (Exception, KeyboardInterrupt) as error:
        row.update(outcome="failed", reason=str(error) if str(error).startswith("benchmark_") else "benchmark_failed", wallMs=round((time.perf_counter() - started) * 1000))
        if args.engine in ["faster", "moonshine"]:
            row.update(peakRssMiB=None, cpuSeconds=None, resourcesScope="unmeasured-failed-inference-process")
        record(root, row)
        return 1
    finally:
        lock.unlink(missing_ok=True)
    record(root, row)
    return 0


if __name__ == "__main__":
    sys.exit(main())
