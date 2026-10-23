#!/usr/bin/env python3
# Script to extract 30 student resumes from NUST BSCS-2025-Graduate-Booklet.pdf
# Generates .md files first, and then converts each .md to .pdf using md-to-pdf.py

import os
import re
import sys
import subprocess
from pathlib import Path

# Path to md-to-pdf.py
MD_TO_PDF_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "md-to-pdf.py")

PDF_PATH = "/home/hammad/code/hackathon/docs/research/top-candidates/bench/BSCS-2025-Graduate-Booklet.pdf"
OUTPUT_DIR = "/home/hammad/code/hackathon/docs/research/top-candidates/bench/cvs"

def crop_text(sheet, x, y, w, h):
    # Extracts text from a specific rectangular region of a PDF sheet
    try:
        raw = subprocess.check_output([
            "pdftotext", "-layout", "-f", str(sheet), "-l", str(sheet),
            "-x", str(x), "-y", str(y), "-W", str(w), "-H", str(h),
            PDF_PATH, "-"
        ]).decode("utf-8", "ignore")
        # Remove booklet page footer lines if present
        raw = re.sub(r"^[ \t]*Page No\.\s*\d+\s*\|\s*BSCS.*$", "", raw, flags=re.MULTILINE)
        return raw.strip()
    except Exception as e:
        print(f"Error cropping sheet {sheet} ({x},{y},{w},{h}): {e}", file=sys.stderr)
        return ""

def clean_lines(text):
    return [l.strip() for l in text.splitlines() if l.strip()]

def join_wrapped_lines(lines):
    # Reconnects hyphenated line wraps without inserting spaces inside compound words or URLs
    if not lines:
        return ""
    text = "\n".join(l.strip() for l in lines if l.strip())
    text = re.sub(r"([A-Za-z0-9])-\n([a-z0-9])", r"\1-\2", text)
    text = re.sub(r"\s*\n\s*", " ", text)
    return re.sub(r"\s{2,}", " ", text).strip()

def split_into_bullets(body_text):
    # Splits a paragraph into clean bullets without breaking hyphenated words
    if not body_text:
        return []
    cleaned = body_text.strip()
    # Remove trailing orphan bullet markers at the end of a block
    cleaned = re.sub(r"[\s•●◦–-]+$", "", cleaned).strip()
    if not cleaned:
        return []

    # Check if explicit bullet symbols or dash-bullets exist
    has_symbol_bullets = bool(re.search(r"[•●◦]", cleaned))
    has_dash_bullets = bool(re.search(r"(?:^|(?<=[\.\!\?\:\;])\s+)[–-]\s+(?=[A-Z0-9])", cleaned))

    if has_symbol_bullets or has_dash_bullets:
        parts = re.split(
            r"\s*[•●◦]\s*|(?:^|(?<=[\.\!\?\:\;])\s+)[–-]\s+(?=[A-Z0-9])",
            cleaned,
        )
        bullets = [re.sub(r"^[•●◦–-]\s*", "", p).strip() for p in parts if p and p.strip()]
        bullets = [re.sub(r"[\s•●◦–-]+$", "", b).strip() for b in bullets if b]
        return [b for b in bullets if b]

    # Otherwise split on sentence boundaries while avoiding common title/company abbreviations
    sentences = [
        s.strip()
        for s in re.split(
            r"(?<!\bDr\.)(?<!\bProf\.)(?<!\bMr\.)(?<!\bMs\.)(?<!\bMrs\.)(?<!\bInc\.)(?<!\bLtd\.)(?<!\bPvt\.)(?<!\bF\.)(?<=[.!?])\s+(?=[A-Z])",
            cleaned,
        )
        if s.strip()
    ]
    return sentences if sentences else [cleaned]

def parse_sidebar(sidebar_raw):
    cell = ""
    email = ""
    address_parts = []
    tech_skills = []
    soft_skills = []
    
    current_section = "details"
    lines = clean_lines(sidebar_raw)
    i = 0
    while i < len(lines):
        line = lines[i]
        if line == "Details":
            current_section = "details"
            i += 1
            continue
        elif line == "Technical Skills":
            current_section = "tech_skills"
            i += 1
            continue
        elif line == "Soft Skills":
            current_section = "soft_skills"
            i += 1
            continue
        elif line == "Reference":
            break
            
        if current_section == "details":
            if line.startswith("Cell:"):
                cell = line.replace("Cell:", "").strip()
            elif line.startswith("Email:"):
                email = line.replace("Email:", "").strip()
                if not email and i + 1 < len(lines) and "@" in lines[i+1]:
                    i += 1
                    email = lines[i].strip()
            elif line.startswith("Address:"):
                addr = line.replace("Address:", "").strip()
                if addr:
                    address_parts.append(addr)
            else:
                if "@" in line and not email:
                    email = line
                elif not line.startswith("Technical") and not line.startswith("Soft"):
                    address_parts.append(line)
        elif current_section == "tech_skills":
            tech_skills.append(line)
        elif current_section == "soft_skills":
            soft_skills.append(line)
            
        i += 1
        
    address = ", ".join([p for p in address_parts if p and p != ","])
    address = re.sub(r"\s*,\s*", ", ", address).strip(", ")
    return cell, email, address, tech_skills, soft_skills

def parse_main_content(main_raw, p2_raw=""):
    sections = {"profile": "", "education": "", "internships": "", "projects": ""}
    
    headers = [
        ("profile", r"Professional Profile"),
        ("education", r"Education"),
        ("internships", r"Internship Experience"),
        ("projects", r"Projects")
    ]
    
    positions = []
    for sec_key, pattern in headers:
        m = re.search(r"^[ \t]*" + pattern + r"[ \t]*$", main_raw, re.MULTILINE)
        if m:
            positions.append((m.start(), m.end(), sec_key))
            
    positions.sort(key=lambda x: x[0])
    
    for i in range(len(positions)):
        start, end, sec_key = positions[i]
        next_start = positions[i+1][0] if i + 1 < len(positions) else len(main_raw)
        content = main_raw[end:next_start].strip()
        sections[sec_key] = content
        
    if p2_raw:
        p2_clean = re.sub(r"^[ \t]*Projects[ \t]*\n", "", p2_raw, flags=re.MULTILINE).strip()
        if sections["projects"]:
            sections["projects"] += "\n\n" + p2_clean
        else:
            sections["projects"] = p2_clean
            
    return sections

def format_education(edu_raw):
    if not edu_raw:
        return "- **Bachelor of Science in Computer Science (BS CS)**  \n  National University of Sciences and Technology (NUST) - SEECS (2021 – 2025)"

    lines = clean_lines(edu_raw)
    items = []
    current_item = []

    for idx, line in enumerate(lines):
        current_item.append(line)
        # If the next line is a bare wrapped year like '(2025)', let the next iteration attach it
        if idx + 1 < len(lines) and re.match(r"^\(\d{4}\)$|^\(\s*\)$", lines[idx + 1]):
            continue
        # In the NUST booklet template, every education entry ends on the line with ', <grade>' or '(<year>)'
        if re.search(r",\s*\d+(?:\.\d+)?(?:/\d+(?:\.\d+)?)?\s*(?:\(\d{4}\))?$|,\s*[^,]+\(\d{4}\)$|\(\d{4}\)$|\(\s*\)$", line):
            items.append(" ".join(current_item))
            current_item = []

    if current_item:
        items.append(" ".join(current_item))

    formatted = []
    for item in items:
        cleaned = re.sub(r"\s+", " ", item).strip()
        # Skip empty portal placeholders like ", (2019)" or "Matric / O levels , (2019)" with no school/grade
        if re.match(r"^(?:Matric\s*/\s*O\s*levels|Intermediate\s*/\s*A\s*levels)?\s*,\s*\(\d{0,4}\)$", cleaned, re.IGNORECASE):
            continue
        formatted.append(f"- {cleaned}")

    return "\n".join(formatted) if formatted else edu_raw

def collapse_multiline_dates(text):
    # Collapses multiline date ranges inside parentheses onto the same line as the company header
    def _repl(m):
        inner = re.sub(r"\s*\n\s*", " ", m.group(1)).strip()
        inner = re.sub(r"(\d{2}-)\s+([A-Za-z]{3})", r"\1\2", inner)
        inner = re.sub(r"([A-Za-z]{3}-)\s+(\d{4})", r"\1\2", inner)
        return f"( {inner} )"

    return re.sub(r"\(([^()]*\d{4}[^()]*)\)", _repl, text)

def format_internships(intern_raw):
    if not intern_raw:
        return ""

    normalized = collapse_multiline_dates(intern_raw)
    lines = normalized.splitlines()
    formatted = []
    current_title = None
    current_dates = None
    current_body = []

    def flush_entry(title, dates, body_lines):
        entry_blocks = [f"### {title}"]
        if dates:
            entry_blocks.append(f"**{dates}**")
        body_text = join_wrapped_lines(body_lines)
        for b in split_into_bullets(body_text):
            entry_blocks.append(f"- {b}")
        formatted.append("\n\n".join(entry_blocks))

    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue

        # Match company and date pattern e.g. "Company ( 01-Jan-2024 - 31-Dec-2024 )"
        date_match = re.search(r"^(.*?)\s*\(\s*(\d{2}-[A-Za-z]{3}-\d{4}\s*-\s*\d{2}-[A-Za-z]{3}-\d{4})\s*\)$", trimmed)
        if date_match:
            if current_title:
                flush_entry(current_title, current_dates, current_body)
                current_body = []
            current_title = date_match.group(1).strip()
            current_dates = date_match.group(2).strip()
        else:
            current_body.append(trimmed)

    if current_title:
        flush_entry(current_title, current_dates, current_body)

    return "\n\n".join(formatted) if formatted else intern_raw

def format_projects(proj_raw):
    if not proj_raw or not proj_raw.strip():
        return ""

    # Each project in the booklet is separated by a blank line
    blocks = re.split(r"\n\s*\n", proj_raw.strip())
    formatted = []

    for block in blocks:
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines:
            continue

        title = lines[0]
        body_lines = lines[1:]

        # Handle wrapped 2-line project titles (e.g. long title on L0 wrapping a short phrase onto L1)
        if (
            len(lines) >= 3
            and len(lines[0]) >= 60
            and len(lines[1]) < 40
            and not re.match(r"^[•●◦–-]", lines[1])
            and not lines[1].endswith(".")
        ):
            title = join_wrapped_lines([lines[0], lines[1]])
            body_lines = lines[2:]

        proj_out = [f"### {title}"]
        body_text = join_wrapped_lines(body_lines)
        for b in split_into_bullets(body_text):
            proj_out.append(f"- {b}")
        formatted.append("\n\n".join(proj_out))

    return "\n\n".join(formatted) if formatted else proj_raw

def discover_student_pages():
    students = []
    current_student = None
    
    for sheet in range(7, 46):
        for side in ["left", "right"]:
            x = 0 if side == "left" else 548
            txt = crop_text(sheet, x, 0, 548, 820)
            lines = clean_lines(txt)
            if not lines:
                continue
                
            has_prof = any("Professional Profile" in l for l in lines)
            is_projects = lines[0].startswith("Projects") and not has_prof
            
            if has_prof:
                name_raw = crop_text(sheet, x, 0, 548, 125)
                name = re.sub(r"\s+", " ", name_raw).strip()
                current_student = {
                    "name": name,
                    "sheets": [(sheet, side)],
                }
                students.append(current_student)
            elif is_projects and current_student:
                current_student["sheets"].append((sheet, side))
                
    return students

def generate_markdown(candidate, index):
    sheets = candidate["sheets"]
    main_sheet, main_side = sheets[0]
    x_offset = 0 if main_side == "left" else 548
    
    sidebar_raw = crop_text(main_sheet, x_offset, 125, 185, 665)
    main_raw = crop_text(main_sheet, x_offset + 185, 125, 363, 665)
    
    p2_raw = ""
    if len(sheets) > 1:
        p2_sheet, p2_side = sheets[1]
        p2_x = 0 if p2_side == "left" else 548
        p2_raw = crop_text(p2_sheet, p2_x, 0, 548, 790)
        
    cell, email, address, tech_skills, soft_skills = parse_sidebar(sidebar_raw)
    sections = parse_main_content(main_raw, p2_raw)
    
    name = candidate["name"]
    location_str = address or "Pakistan"
    phone_str = f"+{cell}" if cell and not cell.startswith("+") else cell
    contact_parts = [location_str]
    if phone_str:
        contact_parts.append(phone_str)
    if email:
        contact_parts.append(email)
    contact_line = " | ".join(contact_parts)
    
    md_lines = [
        f"# {name}",
        f"**BS Computer Science | National University of Sciences and Technology (NUST)**  ",
        f"{contact_line}  ",
        "",
        "---",
        ""
    ]
    
    if sections["profile"]:
        md_lines.extend([
            "## Professional Profile",
            sections["profile"],
            "",
            "---",
            ""
        ])
        
    if sections["education"]:
        md_lines.extend([
            "## Education",
            format_education(sections["education"]),
            "",
            "---",
            ""
        ])
        
    if sections["internships"]:
        md_lines.extend([
            "## Work & Internship Experience",
            format_internships(sections["internships"]),
            "",
            "---",
            ""
        ])
        
    if sections["projects"]:
        md_lines.extend([
            "## Projects",
            format_projects(sections["projects"]),
            "",
            "---",
            ""
        ])
        
    if tech_skills:
        md_lines.extend([
            "## Technical Skills",
            "\n".join([f"- {s}" for s in tech_skills]),
            "",
            "---",
            ""
        ])
        
    if soft_skills:
        md_lines.extend([
            "## Soft Skills",
            "\n".join([f"- {s}" for s in soft_skills]),
            ""
        ])
        
    return "\n".join(md_lines)

def make_slug(name):
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", name.lower()).strip("_")
    return slug

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_students = discover_student_pages()
    selected_students = all_students[:30]
    
    print(f"Discovered {len(all_students)} student profiles.")
    print(f"Extracting first {len(selected_students)} resumes...")
    print("--------------------------------------------------------------------------------")
    
    md_files = []
    
    # Phase 1: Generate all .md files
    print("\nPhase 1: Generating Markdown (.md) resume files...")
    for idx, student in enumerate(selected_students, 1):
        slug = make_slug(student["name"])
        filename_base = f"cand_{idx:02d}_{slug}"
        md_path = os.path.join(OUTPUT_DIR, f"{filename_base}.md")
        
        md_content = generate_markdown(student, idx)
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_content)
            
        md_files.append((md_path, filename_base))
        print(f"  [{idx:02d}/30] Written: {os.path.basename(md_path)} ({len(md_content)} chars)")
        
    print("\nPhase 1 Complete: All 30 Markdown files generated successfully.")
    print("--------------------------------------------------------------------------------")
    
    # Phase 2: Convert all .md files to .pdf using existing md-to-pdf pipeline
    print("\nPhase 2: Converting Markdown (.md) files to styled PDF documents...")
    for idx, (md_path, filename_base) in enumerate(md_files, 1):
        pdf_path = os.path.join(OUTPUT_DIR, f"{filename_base}.pdf")
        subprocess.run([sys.executable, MD_TO_PDF_SCRIPT, md_path, pdf_path], check=True)
        print(f"  [{idx:02d}/30] Generated PDF: {os.path.basename(pdf_path)}")
        
    print("\n--------------------------------------------------------------------------------")
    print(f"Successfully generated 30 .md resumes and 30 companion .pdf files in:")
    print(f"  {OUTPUT_DIR}")
    print("================================================================================")

if __name__ == "__main__":
    main()
