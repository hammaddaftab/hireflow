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
        return subprocess.check_output([
            "pdftotext", "-layout", "-f", str(sheet), "-l", str(sheet),
            "-x", str(x), "-y", str(y), "-W", str(w), "-H", str(h),
            PDF_PATH, "-"
        ]).decode("utf-8", "ignore").strip()
    except Exception as e:
        print(f"Error cropping sheet {sheet} ({x},{y},{w},{h}): {e}", file=sys.stderr)
        return ""

def clean_lines(text):
    return [l.strip() for l in text.splitlines() if l.strip()]

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
    
    for line in lines:
        if line.startswith("BS in") or line.startswith("BS ") or line.startswith("Bachelors") or line.startswith("Matric") or line.startswith("Intermediate") or line.startswith("FSc") or line.startswith("Higher Secondary") or line.startswith("Secondary") or line.startswith("Semester Exchange") or line.startswith("A levels") or line.startswith("O levels"):
            if current_item:
                items.append(" ".join(current_item))
                current_item = []
        current_item.append(line)
        
    if current_item:
        items.append(" ".join(current_item))
        
    formatted = []
    for item in items:
        # Clean formatting of institution and grades
        cleaned = re.sub(r"\s+", " ", item).strip()
        # Add bullet
        formatted.append(f"- {cleaned}")
        
    return "\n".join(formatted) if formatted else edu_raw

def format_internships(intern_raw):
    if not intern_raw:
        return ""
        
    lines = intern_raw.splitlines()
    formatted = []
    current_title = None
    current_body = []
    
    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue
            
        # Match company and date pattern e.g. "Company ( 01-Jan-2024 - 31-Dec-2024 )"
        date_match = re.search(r"^(.*?)\s*\(\s*([^\)]+-[^\)]+)\s*\)", trimmed)
        if date_match:
            if current_title:
                formatted.append(f"### {current_title}")
                if current_dates:
                    formatted.append(f"**{current_dates}**")
                body_text = " ".join(current_body).strip()
                if body_text:
                    # Break into sentences/bullets if possible
                    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z\-])", body_text) if s.strip()]
                    for s in sentences:
                        clean_s = re.sub(r"^[•\-*]\s*", "", s).strip()
                        formatted.append(f"- {clean_s}")
                current_body = []
            current_title = date_match.group(1).strip()
            current_dates = date_match.group(2).strip()
        else:
            current_body.append(trimmed)
            
    if current_title:
        formatted.append(f"### {current_title}")
        if current_dates:
            formatted.append(f"**{current_dates}**")
        body_text = " ".join(current_body).strip()
        if body_text:
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z\-])", body_text) if s.strip()]
            for s in sentences:
                clean_s = re.sub(r"^[•\-*]\s*", "", s).strip()
                formatted.append(f"- {clean_s}")
                
    return "\n\n".join(formatted) if formatted else intern_raw

def format_projects(proj_raw):
    if not proj_raw:
        return ""
        
    lines = proj_raw.splitlines()
    formatted = []
    current_title = None
    current_body = []
    
    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue
            
        # Check if line looks like a project title (short line, not a bullet, title case or caps)
        is_bullet = trimmed.startswith("-") or trimmed.startswith("•") or trimmed.startswith("*")
        is_likely_title = not is_bullet and len(trimmed) < 65 and not trimmed.endswith(".") and not trimmed.endswith(";")
        
        if is_likely_title and not current_title:
            current_title = trimmed
        elif is_likely_title and current_title and len(current_body) > 0:
            formatted.append(f"### {current_title}")
            body_text = " ".join(current_body).strip()
            # Split bullets by • or -
            bullets = [b.strip() for b in re.split(r"[•\-*]\s*", body_text) if b.strip()]
            if len(bullets) > 1:
                for b in bullets:
                    formatted.append(f"- {b}")
            else:
                sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", body_text) if s.strip()]
                for s in (sentences or [body_text]):
                    formatted.append(f"- {s}")
            current_title = trimmed
            current_body = []
        else:
            current_body.append(trimmed)
            
    if current_title:
        formatted.append(f"### {current_title}")
        body_text = " ".join(current_body).strip()
        bullets = [b.strip() for b in re.split(r"[•\-*]\s*", body_text) if b.strip()]
        if len(bullets) > 1:
            for b in bullets:
                formatted.append(f"- {b}")
        else:
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", body_text) if s.strip()]
            for s in (sentences or [body_text]):
                formatted.append(f"- {s}")
                
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
    
    sidebar_raw = crop_text(main_sheet, x_offset, 125, 185, 630)
    main_raw = crop_text(main_sheet, x_offset + 185, 125, 363, 630)
    
    p2_raw = ""
    if len(sheets) > 1:
        p2_sheet, p2_side = sheets[1]
        p2_x = 0 if p2_side == "left" else 548
        p2_raw = crop_text(p2_sheet, p2_x, 0, 548, 760)
        
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
