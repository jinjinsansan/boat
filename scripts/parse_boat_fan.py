#!/usr/bin/env python3
"""Utility to extract BOAT RACE fan LZH archives and convert them into JSONL knowledge files.

This script performs three steps per run:
1. Extract every *.lzh archive in the raw directory into text files under the interim directory.
2. Parse the fixed-width CP932 text records into structured dictionaries.
3. Emit machine-friendly JSONL files under the processed directory for downstream ingestion.

The converter keeps both raw numeric strings and simple float normalisations (value / 100) for
the two metric blocks so that later stages can attach semantic labels without re-parsing the
source data.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

import lhafile


@dataclass
class FanRecord:
    source: str
    register_number: str
    name_kanji: str
    name_kana: str
    branch: str
    grade: str
    profile_code: str
    release_year: int | None
    release_month: int | None
    release_term: str | None
    metrics_primary_raw: List[str]
    metrics_primary: List[float | None]
    grade_info: str
    metrics_secondary_raw: List[str]
    metrics_secondary: List[float | None]
    metrics_secondary_suffix: str
    birthplace: str
    raw_line: str

    @property
    def text(self) -> str:
        """Build a compact textual summary for knowledge ingestion."""

        def _format_metrics(prefix: str, values: Sequence[str]) -> str:
            pairs = [f"{prefix}{idx + 1:02d}:{val}" for idx, val in enumerate(values)]
            return " ".join(pairs)

        primary_text = _format_metrics("P", self.metrics_primary_raw)
        secondary_text = _format_metrics("S", self.metrics_secondary_raw)
        release_segments: list[str] = []
        if self.release_year is not None:
            release_segments.append(f"{self.release_year}年")
        if self.release_month is not None:
            release_segments.append(f"{self.release_month:02d}月")
        if self.release_term:
            release_segments.append(self.release_term)
        release_text = "".join(release_segments)
        parts = [
            f"登録番号:{self.register_number} 氏名:{self.name_kanji}",
            f" (ﾌﾘｶﾞﾅ:{self.name_kana}) 支部:{self.branch} 級別:{self.grade}",
            f" プロフィールコード:{self.profile_code} グレード情報:{self.grade_info}",
        ]
        if release_text:
            parts.append(f" リリース:{release_text}")
        parts.extend(
            [
                f" 主要指標[{primary_text}] 追加指標[{secondary_text}",
                f"{(' ' + self.metrics_secondary_suffix) if self.metrics_secondary_suffix else ''}]",
                f" 出身:{self.birthplace}",
            ]
        )
        return "".join(parts)


def extract_archives(raw_dir: Path, interim_dir: Path) -> List[Path]:
    interim_dir.mkdir(parents=True, exist_ok=True)
    extracted: List[Path] = []

    for archive_path in sorted(raw_dir.glob("*.lzh")):
        target_root = interim_dir / archive_path.stem
        target_root.mkdir(parents=True, exist_ok=True)

        lzh = lhafile.Lhafile(str(archive_path))
        try:
            seen: set[str] = set()
            for info in lzh.infolist():
                name = info.filename.strip()
                if not name or name in seen:
                    continue
                seen.add(name)
                dest_path = target_root / name
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                dest_path.write_bytes(lzh.read(info.filename))
                extracted.append(dest_path)
        finally:
            closer = getattr(lzh, "close", None)
            if callable(closer):
                closer()

    return extracted


def _decode_cp932(segment: bytes) -> str:
    return segment.decode("cp932", errors="ignore").rstrip()


def _decode_ascii(segment: bytes) -> str:
    return segment.decode("ascii", errors="ignore").strip()


def _normalise_name(text: str) -> str:
    return text.replace("\u3000", " ").strip()


def _chunk_four(segment: bytes) -> tuple[List[str], List[float | None], str]:
    if not segment:
        return [], [], ""

    length = len(segment)
    trimmed_length = length - (length % 4)
    values_raw: List[str] = []
    values_float: List[float | None] = []

    for idx in range(0, trimmed_length, 4):
        chunk = _decode_ascii(segment[idx : idx + 4])
        values_raw.append(chunk)
        if chunk and chunk.isdigit():
            values_float.append(int(chunk) / 100.0)
        else:
            values_float.append(None)

    suffix = segment[trimmed_length:].decode("ascii", errors="ignore")
    return values_raw, values_float, suffix


def infer_release_info(source: str) -> tuple[int | None, int | None, str | None]:
    if source.startswith("fan") and len(source) >= 7:
        code = source[3:7]
        if code.isdigit():
            year = 2000 + int(code[:2])
            month = int(code[2:4])
            term = "前期" if month <= 6 else "後期"
            return year, month, term
    return None, None, None


def parse_record(raw: bytes, source: str, release_year: int | None, release_month: int | None, release_term: str | None) -> FanRecord:
    line = raw.rstrip(b"\r\n")

    register_number = _decode_ascii(line[0:4])
    name_kanji = _normalise_name(_decode_cp932(line[4:20]))
    name_kana = _decode_cp932(line[20:35]).strip()
    branch = _decode_cp932(line[35:39]).replace("\u3000", "").strip()
    grade = _decode_ascii(line[39:41])
    profile_code = _decode_ascii(line[41:58])

    metrics_primary_raw, metrics_primary, _ = _chunk_four(line[58:158])

    remainder = line[158:]
    grade_info = _decode_ascii(remainder[0:10])
    secondary_segment = remainder[10:-6]
    metrics_secondary_raw, metrics_secondary, secondary_suffix = _chunk_four(secondary_segment)
    birthplace = _normalise_name(_decode_cp932(remainder[-6:]))

    raw_line = line.decode("cp932", errors="ignore")

    return FanRecord(
        source=source,
        register_number=register_number,
        name_kanji=name_kanji,
        name_kana=name_kana,
        branch=branch,
        grade=grade,
        profile_code=profile_code,
        release_year=release_year,
        release_month=release_month,
        release_term=release_term,
        metrics_primary_raw=metrics_primary_raw,
        metrics_primary=metrics_primary,
        grade_info=grade_info,
        metrics_secondary_raw=metrics_secondary_raw,
        metrics_secondary=metrics_secondary,
        metrics_secondary_suffix=secondary_suffix,
        birthplace=birthplace,
        raw_line=raw_line,
    )


def parse_text_file(
    txt_path: Path,
    release_year: int | None = None,
    release_month: int | None = None,
    release_term: str | None = None,
) -> Iterable[FanRecord]:
    source = txt_path.stem
    year, month, term = infer_release_info(source)
    rel_year = release_year if release_year is not None else year
    rel_month = release_month if release_month is not None else month
    rel_term = release_term if release_term is not None else term
    with txt_path.open("rb") as fh:
        for raw_line in fh:
            raw_line = raw_line.rstrip(b"\r\n")
            if not raw_line:
                continue
            yield parse_record(raw_line, source, rel_year, rel_month, rel_term)


def write_jsonl(records: Iterable[FanRecord], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as fh:
        for record in records:
            payload = asdict(record)
            payload["text"] = record.text
            fh.write(json.dumps(payload, ensure_ascii=False))
            fh.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse BOAT RACE fan LZH archives into JSONL")
    parser.add_argument("--raw", type=Path, default=Path("data/raw"), help="Raw LZH directory")
    parser.add_argument(
        "--interim", type=Path, default=Path("data/interim"), help="Intermediate extraction directory"
    )
    parser.add_argument(
        "--processed", type=Path, default=Path("data/processed"), help="Processed JSONL directory"
    )
    parser.add_argument(
        "--combined-output",
        type=Path,
        default=None,
        help="Optional JSONL path to export all records in one file",
    )
    parser.add_argument("--min-year", type=int, default=None, help="Minimum release year to include")
    parser.add_argument("--max-year", type=int, default=None, help="Maximum release year to include")

    args = parser.parse_args()

    extracted_files = extract_archives(args.raw, args.interim)

    txt_files = [path for path in extracted_files if path.suffix.lower() in {".txt", ""}]
    if not txt_files:
        txt_files = sorted(args.interim.glob("**/*.txt"))
    else:
        txt_files = sorted(set(txt_files))

    aggregated: list[FanRecord] = []

    for txt_path in txt_files:
        release_year, release_month, release_term = infer_release_info(txt_path.stem)
        records = list(parse_text_file(txt_path, release_year, release_month, release_term))
        if not records:
            continue
        output_path = args.processed / f"{txt_path.stem}.jsonl"
        write_jsonl(records, output_path)
        if args.combined_output:
            if release_year is not None:
                if args.min_year is not None and release_year < args.min_year:
                    continue
                if args.max_year is not None and release_year > args.max_year:
                    continue
            aggregated.extend(records)

    if args.combined_output and aggregated:
        aggregated.sort(key=lambda rec: (
            rec.release_year or 0,
            rec.release_month or 0,
            int(rec.register_number) if rec.register_number.isdigit() else rec.register_number,
        ))
        write_jsonl(aggregated, args.combined_output)


if __name__ == "__main__":
    main()
