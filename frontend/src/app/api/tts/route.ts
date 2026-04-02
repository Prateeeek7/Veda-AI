import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    
    // Call the local Flask API TTS engine via GET
    const baseUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5001';
    const backendUrl = `${baseUrl}/tts?text=${encodeURIComponent(text)}`;
    const response = await fetch(backendUrl, {
      method: "GET"
    });

    if (!response.ok) {
      console.error("GeetaAI Backend returned:", response.status, response.statusText);
      return new NextResponse(JSON.stringify({ error: "Backend failed" }), { status: response.status });
    }

    // Pipe the raw streaming binary chunk stream natively back to the browser
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      }
    });

  } catch (error) {
    console.error("Next.js Proxy TTS Error:", error);
    return new NextResponse(JSON.stringify({ error: "TTS Proxy Exception" }), { status: 500 });
  }
}

