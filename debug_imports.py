try:
    from langchain_core.documents import Document
    print("Document import: SUCCESS")
except ImportError as e:
    print(f"Document import: FAILED - {e}")

try:
    from langchain_chroma import Chroma
    print("Chroma import: SUCCESS")
except ImportError as e:
    print(f"Chroma import: FAILED - {e}")

try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    print("Embeddings import: SUCCESS")
except ImportError as e:
    print(f"Embeddings import: FAILED - {e}")
