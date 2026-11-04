"""Explicit free local tool preparation. Application startup never runs this file."""

import hashlib
import configparser
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
LOCK = json.loads((ROOT / "scripts/faster-speech-lock.json").read_text(encoding="utf-8"))


def digest(path):
    value = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def ordinary(path, directory=False):
    info = path.lstat()
    if info.st_file_attributes & 0x400 or (directory and not path.is_dir()):
        raise ValueError("speech_prepare_path_invalid")


def download(path, url, expected, maximum):
    if path.exists():
        ordinary(path)
        if path.stat().st_size != maximum or digest(path) != expected:
            raise ValueError("speech_prepare_digest")
        return
    partial = path.with_name(path.name + ".partial")
    try:
        size, value = 0, hashlib.sha256()
        with urllib.request.urlopen(url, timeout=90) as response, partial.open("xb") as output:
            while block := response.read(1024 * 1024):
                size += len(block)
                if size > maximum:
                    raise ValueError("speech_prepare_limit")
                value.update(block)
                output.write(block)
        if size != maximum or value.hexdigest() != expected:
            raise ValueError("speech_prepare_digest")
        partial.replace(path)
    finally:
        partial.unlink(missing_ok=True)


def runtime_manifest(wheels):
    entries = {}
    for wheel in wheels:
        with zipfile.ZipFile(wheel) as archive:
            for item in archive.infolist():
                name = item.filename
                if item.is_dir() or name.endswith(".dist-info/RECORD"):
                    continue
                if ".data/" in name:
                    group, suffix = name.split(".data/", 1)[1].split("/", 1)
                    if group not in ("purelib", "platlib"):
                        continue
                    name = suffix
                if name.startswith("/") or ".." in Path(name).parts or name.endswith(".pyc"):
                    raise ValueError("speech_prepare_wheel_invalid")
                value = archive.read(item)
                record = {"sha256": hashlib.sha256(value).hexdigest(), "bytes": len(value)}
                if name in entries and entries[name] != record:
                    raise ValueError("speech_prepare_collision")
                entries[name] = record
    return json.dumps({"version": 1, "files": dict(sorted(entries.items()))}, separators=(",", ":")).encode()


def remove_unused_console_launchers(wheels, site):
    # Only pip-generated launchers declared by the locked wheels; no recursive deletion.
    console = site / "bin"
    if not console.exists():
        return
    ordinary(console, True)
    if console.resolve().parent != site.resolve():
        raise ValueError("speech_prepare_path_invalid")
    for wheel in wheels:
        with zipfile.ZipFile(wheel) as archive:
            for name in archive.namelist():
                if not name.endswith(".dist-info/entry_points.txt"):
                    continue
                parser = configparser.ConfigParser()
                parser.read_string(archive.read(name).decode())
                for entry in parser["console_scripts"] if parser.has_section("console_scripts") else []:
                    if not all(char.isalnum() or char in "_-" for char in entry):
                        raise ValueError("speech_prepare_entrypoint_invalid")
                    path = console / (entry + ".exe")
                    if path.exists():
                        ordinary(path)
                        path.unlink()
    if any(console.iterdir()):
        raise ValueError("speech_prepare_unexpected_launcher")
    console.rmdir()


def main():
    started = time.perf_counter()
    if os.name != "nt" or sys.version_info[:3] != (3, 11, 9):
        raise ValueError("speech_prepare_python_3119_required")
    directory = ROOT / ".local-build/tools/faster-speech"
    for path in (ROOT / ".local-build", ROOT / ".local-build/tools", directory):
        path.mkdir(exist_ok=True)
        ordinary(path, True)
    wheels = directory / "wheels"
    model = directory / "model"
    for path in (wheels, model):
        path.mkdir(exist_ok=True)
        ordinary(path, True)
    wheel_paths = []
    for item in LOCK["wheels"]:
        path = wheels / item["file"]
        if not path.exists():
            metadata = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/{item['name']}/{item['version']}/json", timeout=30))
            offered = next(file for file in metadata["urls"] if file["filename"] == item["file"] and file["digests"]["sha256"] == item["sha256"])
            url = offered["url"]
        else:
            url = ""
        download(path, url, item["sha256"], item["bytes"])
        wheel_paths.append(path)
    for name, item in LOCK["model"]["files"].items():
        url = f"https://huggingface.co/{LOCK['model']['repository']}/resolve/{LOCK['model']['revision']}/{name}"
        download(model / name, url, item["sha256"], item["bytes"])
    seal = runtime_manifest(wheel_paths)
    seal_hash = hashlib.sha256(seal).hexdigest()
    if LOCK.get("runtimeManifestSha256") and seal_hash != LOCK["runtimeManifestSha256"]:
        raise ValueError("speech_prepare_manifest_invalid")
    runtime = directory / "runtime"
    clean_env = {"SystemRoot": os.environ["SystemRoot"], "PATH": os.environ["SystemRoot"] + "\\System32", "TEMP": str(directory), "TMP": str(directory)}
    if not runtime.exists():
        # No pip/setuptools or inherited site packages in the inference runtime.
        subprocess.run([sys.executable, "-I", "-m", "venv", "--without-pip", str(runtime)], env=clean_env, check=True, creationflags=subprocess.CREATE_NO_WINDOW)
        requirements = directory / "requirements.lock"
        requirements.write_text("".join(f"{item['name']}=={item['version']} --hash=sha256:{item['sha256']}\n" for item in LOCK["wheels"]), encoding="utf-8")
        subprocess.run([sys.executable, "-I", "-m", "pip", "--isolated", "install", "--no-index", "--no-deps", "--no-compile", "--require-hashes", "--find-links", str(wheels), "--target", str(runtime / "Lib/site-packages"), "--disable-pip-version-check", "-r", str(requirements)], env=clean_env, check=True, creationflags=subprocess.CREATE_NO_WINDOW, stdout=subprocess.DEVNULL)
    ordinary(runtime, True)
    site = runtime / "Lib/site-packages"
    remove_unused_console_launchers(wheel_paths, site)
    entries = json.loads(seal)["files"]
    for name, item in entries.items():
        path = site / name
        ordinary(path)
        if path.stat().st_size != item["bytes"] or digest(path) != item["sha256"]:
            raise ValueError("speech_prepare_install_invalid")
    (directory / "runtime-manifest.json").write_bytes(seal)
    print(json.dumps({"prepared": True, "elapsedMs": round((time.perf_counter() - started) * 1000), "files": len(entries), "runtimeManifestSha256": seal_hash,
                      "pythonExecutableSha256": digest(Path(sys.base_prefix) / "python.exe"), "pythonDllSha256": digest(Path(sys.base_prefix) / "python311.dll"),
                      "venvExecutableSha256": digest(runtime / "Scripts/python.exe")}), flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.stderr.write("speech_prepare_failed\n")
        sys.exit(1)
