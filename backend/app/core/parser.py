import pypdf
import docx2txt
from pathlib import Path
from fastapi import UploadFile, HTTPException

class ContentParser:
    """
    Utility class to extract raw text content from various file formats.
    Supports: PDF, DOCX, and plain TXT.
    """

    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        """
        Extracts text from an uploaded file based on its extension.
        """
        filename = file.filename.lower()
        content = ""

        try:
            if filename.endswith(".pdf"):
                # PDF Extraction logic
                reader = pypdf.PdfReader(file.file)
                for page in reader.pages:
                    content += page.extract_text() + "\n"
            
            elif filename.endswith(".docx"):
                # DOCX Extraction logic
                content = docx2txt.process(file.file)
            
            elif filename.endswith(".txt"):
                # Plain Text logic
                raw_bytes = await file.read()
                content = raw_bytes.decode("utf-8")
            
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format.")
            
            # Basic cleanup: remove excessive whitespace
            return " ".join(content.split())

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")
        finally:
            # Important: Reset file pointer if we need to read it again elsewhere
            await file.seek(0)
