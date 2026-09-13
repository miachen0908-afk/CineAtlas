from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/mia0908/2-教学工作/电影学教研室/2026-2027 上/科研项目/印度电影史.docx")
OUTPUT_DIR = ROOT / "data/countryCinemaHistory"

STAGE_SHORT_TITLES = [
    "电影萌芽期",
    "无声奠基期",
    "有声制片厂期",
    "建国黄金期",
    "类型分化期",
    "大众与平行期",
    "自由化转型期",
    "多厅全球化期",
    "平台融合期",
]


def ascii_slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value or "item"


def period(value: str) -> tuple[int, int | None, str]:
    match = re.match(r"(\d{4})(?:—(\d{4}|至今))?", value.strip().replace("年", ""))
    if not match:
        raise ValueError(f"Invalid period: {value}")
    start = int(match.group(1))
    raw_end = match.group(2)
    end = None if raw_end in (None, "至今") else int(raw_end)
    return start, end, value.strip()


def event_type(title: str, has_film: bool) -> str:
    if has_film or "《" in title:
        return "film"
    if any(word in title for word in ["有声", "彩色", "数字", "摄影机", "宽银幕", "技术", "声音"]):
        return "technology"
    if any(word in title for word in ["宣言", "新现实主义", "未来主义", "运动", "作者电影", "新浪潮"]):
        return "movement"
    if any(word in title for word in ["学院", "电影城", "实验中心", "资料馆", "中心成立", "公司", "电影节", "戛纳", "凯撒奖"]):
        return "institution"
    if any(word in title for word in ["产业", "工业", "市场", "票房", "影院", "制片", "电视", "平台", "审查", "法律", "税收", "发行", "合拍", "政策", "资助"]):
        return "industry"
    if any(word in title for word in ["导演", "演员", "明星", "逝世", "梅里爱", "卢米埃尔", "居伊", "布列松"]):
        return "person"
    return "historical"


def films_from_block(paragraphs: list[str], event_id: str) -> list[dict]:
    films = []
    positions = [
        pos
        for pos, text in enumerate(paragraphs)
        if (re.fullmatch(r"《.+》", text) or re.fullmatch(r"代表影片：《.+》", text))
        and pos + 1 < len(paragraphs)
        and paragraphs[pos + 1].startswith("原文片名：")
    ]
    for index, pos in enumerate(positions):
        text = paragraphs[pos]
        title_match = re.search(r"《(.+)》", text)
        if not title_match:
            continue
        title = title_match.group(1)
        metadata = {}
        for line in paragraphs[pos + 1].splitlines():
            if "：" in line:
                key, value = line.split("：", 1)
                if value.strip():
                    metadata[key.strip()] = value.strip()
        synopsis = ""
        significance = ""
        film_end = positions[index + 1] if index + 1 < len(positions) else len(paragraphs)
        film_body = paragraphs[pos + 2:film_end]
        for body_index, following in enumerate(film_body):
            if following.startswith("内容简介："):
                synopsis = following.split("：", 1)[1].strip()
            elif following == "内容简介" and body_index + 1 < len(film_body):
                synopsis = film_body[body_index + 1].strip()
            elif following.startswith("价值意义："):
                significance = following.split("：", 1)[1].strip()
            elif following == "价值意义" and body_index + 1 < len(film_body):
                significance = film_body[body_index + 1].strip()
            elif following.startswith("资料来源"):
                break
        credits = []
        for role in ["导演", "编剧", "摄影", "制片", "原作", "音乐", "剪辑", "美术", "主演", "出镜"]:
            if metadata.get(role):
                credits.append({"role": role, "name": metadata[role]})
        films.append({
            "id": f"in-{event_id}-film-{index + 1}",
            "title": title,
            **({"genre": metadata["类型"]} if metadata.get("类型") else {}),
            "credits": credits,
            "synopsis": synopsis,
            "significance": significance,
        })
    return films


def event_from_block(title: str, paragraphs: list[str], stage_index: int, event_index: int) -> dict:
    match = re.match(r"(?P<date>\d{4}(?:—(?:\d{4}|至今))?)(?:年)?(?:｜|：)(?P<title>.+)", title)
    if not match:
        raise ValueError(f"Invalid event heading: {title}")
    start, end, _ = period(match.group("date"))
    event_title = match.group("title")
    event_id = f"in-s{stage_index + 1}-{start}-{event_index + 1}"
    films = films_from_block(paragraphs, event_id)
    description_parts = []
    for text in paragraphs:
        if text.startswith("资料来源") or re.fullmatch(r"《.+》", text) or text.startswith(("代表影片：《", "原文片名：", "内容简介：", "价值意义：")):
            break
        description_parts.append(text)
    description = "\n".join(description_parts).strip()
    result = {
        "id": event_id,
        "year": start,
        **({"endYear": end} if end is not None and end != start else {}),
        "title": event_title.strip(),
        "description": description,
        "type": event_type(event_title, bool(films)),
    }
    if films:
        result["archiveFilms"] = films
    return result


def parse_section(paragraphs, start: int, end: int, stage_index: int) -> tuple[str, list[dict]]:
    summary_parts = []
    timeline_index = None
    in_background = False
    for i in range(start, end):
        text = paragraphs[i].text.strip()
        if text == "时代背景":
            in_background = True
            continue
        if text == "历史时间轴":
            timeline_index = i
            break
        if in_background and text and not paragraphs[i].style.name.startswith("Heading"):
            summary_parts.append(text)
    if timeline_index is None:
        return "\n".join(filter(None, summary_parts)), []
    headings = []
    for i in range(timeline_index + 1, end):
        text = paragraphs[i].text.strip()
        if paragraphs[i].style.name.startswith("Heading 3") and re.match(r"^\d{4}", text):
            headings.append((i, text))
    events = []
    for event_index, (i, title) in enumerate(headings):
        block_end = headings[event_index + 1][0] if event_index + 1 < len(headings) else end
        block = [p.text.strip() for p in paragraphs[i + 1:block_end] if p.text.strip()]
        events.append(event_from_block(title, block, stage_index, event_index))
    return "\n".join(filter(None, summary_parts)), events


def main() -> None:
    document = Document(SOURCE)
    paragraphs = document.paragraphs
    raw_main_starts = [
        i
        for i, p in enumerate(paragraphs)
        if p.style.name.startswith("Heading 1") and p.text.strip().startswith("第")
    ]
    main_starts = []
    for index, start in enumerate(raw_main_starts):
        if index + 1 < len(raw_main_starts):
            next_start = raw_main_starts[index + 1]
            if (
                paragraphs[start].text.strip() == paragraphs[next_start].text.strip()
                and paragraphs[start + 1].text.strip() == paragraphs[next_start + 1].text.strip()
            ):
                continue
        main_starts.append(start)
    stages = []
    for stage_index, start in enumerate(main_starts):
        later_starts = [candidate for candidate in raw_main_starts if candidate > start]
        end = later_starts[0] if later_starts else len(paragraphs)
        metadata = paragraphs[start + 1].text.strip()
        details = {
            line.split("：", 1)[0]: line.split("：", 1)[1]
            for line in metadata.splitlines()
            if "：" in line
        }
        title = details["完整标题"].strip()
        year_label = details["显示年份"].strip()
        year_start, year_end, _ = period(year_label)
        substage_starts = [
            i
            for i in range(start + 2, end)
            if paragraphs[i].style.name.startswith("Heading 2")
            and paragraphs[i].text.strip().startswith("子阶段")
        ]
        content_end = substage_starts[0] if substage_starts else end
        summary, events = parse_section(paragraphs, start + 2, content_end, stage_index)
        stage = {
            "id": f"india-stage-{stage_index + 1}",
            "title": title,
            "shortTitle": details.get("导航短名称", STAGE_SHORT_TITLES[stage_index]).strip(),
            "yearStart": year_start,
            "yearEnd": year_end,
            "yearLabel": year_label,
            "summary": summary,
            "events": events,
            "representativeFilmIds": [],
            "representativePersonIds": [],
        }
        if substage_starts:
            substages = []
            for sub_index, sub_start in enumerate(substage_starts):
                sub_end = substage_starts[sub_index + 1] if sub_index + 1 < len(substage_starts) else end
                sub_metadata = paragraphs[sub_start + 1].text.strip()
                sub_details = {
                    line.split("：", 1)[0]: line.split("：", 1)[1]
                    for line in sub_metadata.splitlines()
                    if "：" in line
                }
                sub_year_label = sub_details["显示年份"].strip()
                sub_year_start, sub_year_end, _ = period(sub_year_label)
                sub_summary, sub_events = parse_section(paragraphs, sub_start + 2, sub_end, stage_index)
                substages.append({
                    "id": f"india-stage-{stage_index + 1}-substage-{sub_index + 1}",
                    "title": sub_details["完整标题"].strip(),
                    "shortTitle": sub_details["导航短名称"].strip(),
                    "yearStart": sub_year_start,
                    "yearEnd": sub_year_end,
                    "yearLabel": sub_year_label,
                    "summary": sub_summary,
                    "events": sub_events,
                    "representativeFilmIds": [],
                    "representativePersonIds": [],
                })
            stage["subStages"] = substages
            if not stage["summary"]:
                stage["summary"] = "\n".join(
                    substage["summary"].split("\n", 1)[0]
                    for substage in substages
                    if substage["summary"]
                )
        stages.append(stage)

    event_count = sum(len(stage["events"]) + sum(len(sub["events"]) for sub in stage.get("subStages", [])) for stage in stages)
    film_count = sum(len(event.get("archiveFilms", [])) for stage in stages for event in stage["events"]) + sum(len(event.get("archiveFilms", [])) for stage in stages for sub in stage.get("subStages", []) for event in sub["events"])
    counts = {
        "stages": len(stages),
        "subStages": sum(len(stage.get("subStages", [])) for stage in stages),
        "events": event_count,
        "films": film_count,
    }
    expected = {"stages": 9, "subStages": 2, "events": 131, "films": 36}
    if counts != expected:
        raise ValueError(f"Unexpected document structure: expected {expected}, found {counts}")
    for stage_index, stage in enumerate(stages, start=1):
        payload = json.dumps(stage, ensure_ascii=False, indent=2)
        (OUTPUT_DIR / f"in-stage-{stage_index}.ts").write_text(
            'import type { CinemaHistoryStage } from "@/types/cinema";\n\n'
            f"export const indiaStage{stage_index}: CinemaHistoryStage = {payload};\n",
            encoding="utf-8",
        )
    imports = "\n".join(
        f'import {{ indiaStage{stage_index} }} from "./in-stage-{stage_index}";'
        for stage_index in range(1, len(stages) + 1)
    )
    stage_names = ",\n    ".join(f"indiaStage{stage_index}" for stage_index in range(1, len(stages) + 1))
    (OUTPUT_DIR / "in.ts").write_text(
        'import type { CountryCinemaHistory } from "@/types/cinema";\n'
        f"{imports}\n\n"
        "export const indiaCinemaHistory: CountryCinemaHistory = {\n"
        '  countryCode: "in",\n'
        '  contentStatus: "curated",\n'
        '  introduction: "印度电影从殖民时期的巡回放映与本土影像实践出发，经历无声长片、有声制片厂、独立建国后的经典电影、平行电影、综合娱乐片、全球化宝莱坞、区域产业崛起以及流媒体与泛印度电影时代，形成多语言、多中心的电影文化。",\n'
        f"  stages: [\n    {stage_names},\n  ],\n"
        "};\n",
        encoding="utf-8",
    )
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == "__main__":
    main()
