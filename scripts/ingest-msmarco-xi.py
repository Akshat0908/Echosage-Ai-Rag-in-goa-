#!/usr/bin/env python3
"""Build a bounded, inspectable MSMARCO-XI corpus artifact for the fast online index.

Example:
  python scripts/ingest-msmarco-xi.py --languages hin,ben,tel --split validation --rows-per-language 2000

The online service deliberately consumes a bounded artifact. The full 11M-row
corpus is not loaded into request memory; run this job offline for the chosen
languages/split, review the output, and commit or deploy the generated TS file.
"""
from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--languages",
        default="hin,ben,tel",
        help="Comma-separated HF language codes, for example: hin,ben,tel",
    )
    parser.add_argument("--split", default="validation", choices=["train", "validation"])
    parser.add_argument(
        "--rows-per-language",
        type=int,
        default=2000,
        help="Records retained for each requested language",
    )
    parser.add_argument(
        "--sampling",
        choices=["reservoir", "head"],
        default="reservoir",
        help="Reservoir covers the whole split; head is faster but biased toward first rows",
    )
    parser.add_argument("--seed", type=int, default=2026, help="Deterministic reservoir sample seed")
    parser.add_argument(
        "--include-english",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Also index the English query/passage projection from the first language file",
    )
    parser.add_argument("--output", default="src/server/rag/generated-corpus.ts")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        from datasets import load_dataset
    except ImportError as exc:
        raise SystemExit("Install the offline build dependencies first: pip install datasets pyarrow") from exc

    records: list[dict[str, Any]] = []
    languages = [language.strip() for language in args.languages.split(",") if language.strip()]
    if not languages:
        raise SystemExit("Specify at least one language with --languages")

    def clean_passages(values: Any) -> list[str]:
        return [str(value).strip() for value in (values or []) if str(value).strip()]

    def build_candidate(row: dict[str, Any], language: str, fallback_id: int) -> dict[str, Any] | None:
        passages = row.get("passages") or {}
        translated = clean_passages(passages.get("Translated_passages"))
        if not translated:
            return None
        selected = [int(value) for value in (passages.get("is_selected") or [])]
        query_id = str(row.get("query_id", fallback_id))
        target_language = str(row.get("target_lang") or language)
        translated_record = {
            "queryId": f"{target_language}:{query_id}",
            "language": target_language,
            "queryType": str(row.get("query_type") or "UNKNOWN"),
            "query": str(row.get("query") or ""),
            "answer": str(row.get("Answer") or ""),
            "passages": translated,
            "selected": selected,
            "source": "msmarco-xi",
        }
        english = clean_passages(passages.get("English_passages"))
        english_query = str(row.get("Eng_Query") or "").strip()
        english_record = None
        if english and english_query:
            english_record = {
                "queryId": f"eng_Latn:{query_id}",
                "language": "eng_Latn",
                "queryType": str(row.get("query_type") or "UNKNOWN"),
                "query": english_query,
                "answer": str(row.get("Eng_Answer") or ""),
                "passages": english,
                "selected": selected,
                "source": "msmarco-xi",
            }
        return {"translated": translated_record, "english": english_record}

    for language_index, language in enumerate(languages):
        filename = f"{language}{'train' if args.split == 'train' else 'val'}.parquet"
        url = f"hf://datasets/ai4bharat/MSMARCO-XI/{args.split}/{filename}"
        print(json.dumps({"event": "streaming-language", "language": language}), flush=True)
        stream = load_dataset("parquet", data_files=url, split="train", streaming=True)
        sampler = random.Random(args.seed + language_index)
        sampled: list[dict[str, Any]] = []
        eligible = 0
        for row in stream:
            candidate = build_candidate(row, language, eligible)
            if not candidate:
                continue
            eligible += 1
            if len(sampled) < args.rows_per_language:
                sampled.append(candidate)
            elif args.sampling == "reservoir":
                replacement = sampler.randrange(eligible)
                if replacement < args.rows_per_language:
                    sampled[replacement] = candidate
            else:
                break
            if eligible % 10_000 == 0:
                print(json.dumps({"event": "sampling-progress", "language": language, "eligible": eligible}), flush=True)

        for candidate in sampled:
            records.append(candidate["translated"])
            # The English projection is a distinct indexable view, not a translation at query time.
            # Add it once to avoid duplicating the same English rows for every target language.
            if args.include_english and language_index == 0 and candidate["english"]:
                records.append(candidate["english"])
        print(json.dumps({"event": "language-complete", "language": language, "rows": len(sampled)}), flush=True)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    out.write_text(
        'import type { CorpusRecord } from "./types";\n\n'
        '// Generated by scripts/ingest-msmarco-xi.py. Do not hand-edit.\n'
        f"export const msmarcoCorpus: CorpusRecord[] = {payload};\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "rows": len(records),
        "languages": languages,
        "includeEnglish": args.include_english,
        "rowsPerLanguage": args.rows_per_language,
        "sampling": args.sampling,
        "seed": args.seed,
        "split": args.split,
        "output": str(out),
    }))


if __name__ == "__main__":
    main()
