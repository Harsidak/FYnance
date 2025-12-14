from pypdf import PdfReader

try:
    reader = PdfReader("Financial App Research and Strategy (AI generated).pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    with open("pdf_content.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Done writing to pdf_content.txt")
except ImportError:
    print("pypdf not installed")
except Exception as e:
    print(f"Error: {e}")
