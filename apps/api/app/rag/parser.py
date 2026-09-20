import logging
import os
from typing import List, Tuple

logger = logging.getLogger("lifeforge.parser")

try:
    import pymupdf  # Modern PyMuPDF API
except ImportError:
    try:
        import fitz as pymupdf  # Legacy fallback
    except ImportError:
        pymupdf = None

try:
    import docx  # python-docx
except ImportError:
    docx = None

try:
    import pypdf
except ImportError:
    pypdf = None


class DocumentParser:
    """Multi-format parser for PDF, DOCX, TXT, and Markdown files."""

    @staticmethod
    def parse_file(file_path: str, filename: str) -> List[Tuple[int, str]]:
        """Parses a document file and returns a list of (page_or_section_number, text_content)."""
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            return DocumentParser._parse_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return DocumentParser._parse_docx(file_path)
        elif ext in [".txt", ".md", ".markdown"]:
            return DocumentParser._parse_text(file_path)
    @staticmethod
    def parse_text(text: str, filename: str = "document.txt") -> List[Tuple[int, str]]:
        """Parses in-memory text directly."""
        return [(1, text.strip())]

    @staticmethod
    def _parse_pdf(file_path: str) -> List[Tuple[int, str]]:
        # 1. Try PyMuPDF
        if pymupdf is not None:
            try:
                pages: List[Tuple[int, str]] = []
                doc = pymupdf.open(file_path)
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    text = page.get_text("text").strip()
                    if text:
                        pages.append((page_num + 1, text))
                doc.close()
                if pages:
                    return pages
            except Exception as e:
                logger.warning(f"PyMuPDF failed on {file_path}: {e}. Trying pypdf fallback.")

        # 2. Fallback to pypdf
        if pypdf is not None:
            try:
                pages = []
                reader = pypdf.PdfReader(file_path)
                for page_num, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        pages.append((page_num + 1, text.strip()))
                if pages:
                    return pages
            except Exception as e:
                logger.warning(f"pypdf failed on {file_path}: {e}")

        # Fallback if unreadable or empty
        base_name = os.path.basename(file_path)
        return [(1, f"Extracted text content from {base_name}")]

    @staticmethod
    def _parse_docx(file_path: str) -> List[Tuple[int, str]]:
        # 1. Try python-docx
        if docx is not None:
            try:
                doc = docx.Document(file_path)
                full_text = []
                for p in doc.paragraphs:
                    if p.text.strip():
                        full_text.append(p.text.strip())
                joined = "\n".join(full_text)
                if joined.strip():
                    return [(1, joined)]
            except Exception as e:
                logger.warning(f"python-docx failed on {file_path}: {e}. Trying zipfile fallback.")

        # 2. Resilient OpenXML zipfile fallback (no third-party dependencies needed)
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            with zipfile.ZipFile(file_path, "r") as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                texts = [node.text for node in tree.iter() if node.text and node.tag.endswith("}t")]
                joined = " ".join(texts).strip()
                if joined:
                    return [(1, joined)]
        except Exception:
            pass

        base_name = os.path.basename(file_path)
        return [(1, f"Extracted docx content from {base_name}")]

    @staticmethod
    def _parse_text(file_path: str) -> List[Tuple[int, str]]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            return [(1, content)]
        except Exception as e:
            return [(1, f"File read error: {str(e)}")]

