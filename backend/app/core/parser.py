import pypdf
import docx2txt
import re
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
                    content += (page.extract_text() or "") + "\n"
            
            elif filename.endswith(".docx"):
                # DOCX Extraction logic
                content = docx2txt.process(file.file)
            
            elif filename.endswith(".txt"):
                # Plain Text logic
                raw_bytes = await file.read()
                content = raw_bytes.decode("utf-8")
            
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format.")
            
            # Cleanup: collapse horizontal whitespace but preserve vertical paragraphs
            content = re.sub(r'[ \t]+', ' ', content) 
            content = re.sub(r'\n\s*\n', '\n\n', content) # normalize paragraph breaks
            return content.strip()

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")
        finally:
            # Reset file pointer if possible
            if hasattr(file, "seek"):
                await file.seek(0)

    @staticmethod
    async def download_and_extract_text(file_url: str, filename: str) -> str:
        """
        Downloads a large document from a public URL (e.g., Supabase) into a 
        temporary file, then extracts its raw text to feed into LangChain.
        """
        import tempfile
        import httpx
        import os

        temp_dir = tempfile.gettempdir()
        temp_path = Path(temp_dir) / filename

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(file_url)
                response.raise_for_status()
                with open(temp_path, "wb") as f:
                    f.write(response.content)

            # Re-read locally for parsing
            with open(temp_path, "rb") as f:
                class MockUploadFile:
                    def __init__(self, f_obj, name):
                        self.file = f_obj
                        self.filename = name
                    
                    async def read(self):
                        self.file.seek(0)
                        return self.file.read()
                        
                    async def seek(self, pos):
                        self.file.seek(pos)
                        
                mock_file = MockUploadFile(f, filename)
                extracted_text = await ContentParser.extract_text(mock_file)

            return extracted_text
            
        finally:
            if temp_path.exists():
                os.remove(temp_path)
