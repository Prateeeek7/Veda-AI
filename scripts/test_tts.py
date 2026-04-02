import sys
# Attempt to import gradio_client
try:
    from gradio_client import Client
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "gradio_client"])
    from gradio_client import Client

print("Connecting to MeloTTS Space...")
try:
    client = Client("mrfakename/MeloTTS")
    print("Synthesizing audio...")
    result = client.predict(
            text="The cosmic energy flows through you, illuminating the paths of dharma.",
            language="EN",
            speaker="EN-Default",
            speed=0.9,
            api_name="/synthesize"
    )
    print("Success! File saved at:", result)
except Exception as e:
    print("Failed API test:", str(e))
