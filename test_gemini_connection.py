import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load env from ai_engine/.env
env_path = os.path.abspath("ai_engine/.env")
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Fallback: try to read it manually if dotenv fails (sometimes encoding issues)
    try:
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY"):
                    api_key = line.split("=")[1].strip().strip('"')
                    os.environ["GEMINI_API_KEY"] = api_key
                    print("Loaded key manually.")
                    break
    except Exception as e:
        print(f"Manual load failed: {e}")

if not api_key:
    print("Error: GEMINI_API_KEY not found in environment.")
    exit(1)

def test_model(model_name):
    print(f"\n--- Testing Model: {model_name} ---")
    try:
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key
        )
        response = llm.invoke("Hello, are you online?")
        print(f"SUCCESS: {model_name} responded.")
        print(f"Response: {response.content}")
    except Exception as e:
        print(f"FAILURE: {model_name} failed.")
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting Connectivity Test...")
    # Test valid model first
    test_model("gemini-1.5-flash")
    # Test user requested model
    test_model("gemini-2.5-flash")
