import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import { file as tmpFile } from "tmp-promise";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ANKI_SYSTEM_PROMPT = `You are a world-class Anki flashcard creator that helps students create flashcards that help them remember facts, concepts, and ideas from videos. You will be given a video or document or snippet.

1. Identify key high-level concepts and ideas presented, including relevant equations. If the video is math or physics-heavy, focus on concepts. If the video isn't heavy on concepts, focus on facts.
2. Then use your own knowledge of the concept, ideas, or facts to flesh out any additional details (eg, relevant facts, dates, and equations) to ensure the flashcards are self-contained.
3. Make question-answer cards based on the content.
4. Keep the questions and answers roughly in the same order as they appear in the content itself.
5. If a video is provided, include timestamps in the question field in [ ] brackets at the end of the questions to the segment of the video that's relevant.

Output Format:
- Do not have the first row being "Question" and "Answer".
- Each flashcard should be on a new line and use the pipe separator | to separate the question and answer.
- When writing math, wrap any math with the \\( ... \\) tags [eg, \\( a^2+b^2=c^2 \\) ] . By default this is inline math. For block math, use \\[ ... \\]. Decide when formatting each card.
- When writing chemistry equations, use the format \\( \\ce{C6H12O6 + 6O2 -> 6H2O + 6CO2} \\) where the \\ce is required for MathJax chemistry.`;

export async function POST(req: NextRequest) {
  const { type, value } = await req.json();

  let transcript = "";
  let prompt = "";

  if (type === "youtube") {
    console.log("Processing YouTube URL:", value);
    
    // Validate YouTube URL
    if (!ytdl.validateURL(value)) {
      return NextResponse.json({ error: "Invalid YouTube URL. Please provide a valid YouTube video link." }, { status: 400 });
    }

    try {
      // Get video info first to check duration and availability
      console.log("Getting video info...");
      const info = await ytdl.getInfo(value);
      const durationSeconds = parseInt(info.videoDetails.lengthSeconds);
      const durationMinutes = Math.round(durationSeconds / 60);
      
      console.log(`Video duration: ${durationMinutes} minutes`);
      
      if (durationSeconds > 1800) { // 30 minutes
        return NextResponse.json({ 
          error: "Video is too long (over 30 minutes). Please try a shorter video for better processing speed." 
        }, { status: 400 });
      }

      const { path, cleanup } = await tmpFile({ postfix: ".webm" });
      
      try {
        console.log("Starting YouTube download...");
        
        // Use a more aggressive timeout based on video length
        const timeoutMs = Math.max(60000, durationMinutes * 15000); // At least 1 min, or 15sec per minute of video
        console.log(`Setting timeout to ${timeoutMs / 1000} seconds`);
        
        const downloadPromise = new Promise<void>((resolve, reject) => {
          const stream = ytdl(value, { 
            filter: "audioonly",
            quality: "lowestaudio",
            requestOptions: {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }
          });
          
          const writeStream = fs.createWriteStream(path);
          stream.pipe(writeStream);
          
          stream.on("error", (err) => {
            console.error("YouTube stream error:", err);
            reject(new Error(`Download failed: ${err.message}`));
          });
          
          writeStream.on("error", (err) => {
            console.error("File write error:", err);
            reject(new Error(`File write failed: ${err.message}`));
          });
          
          writeStream.on("close", () => {
            console.log("YouTube download completed");
            resolve();
          });
        });

        const timeoutPromise = new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error(`Download timeout after ${timeoutMs / 1000} seconds. Video may be too long or have connection issues.`)), timeoutMs)
        );

        await Promise.race([downloadPromise, timeoutPromise]);

        // Check if file was created and has content
        const stats = fs.statSync(path);
        console.log("Downloaded file size:", stats.size, "bytes");
        
        if (stats.size === 0) {
          throw new Error("Downloaded file is empty - video may be private, age-restricted, or unavailable");
        }

        if (stats.size < 1000) { // Less than 1KB
          throw new Error("Downloaded file is too small - video may have no audio or be very short");
        }

        console.log("Starting Whisper transcription...");
        
        // 2. Transcribe with Whisper
        const audioStream = fs.createReadStream(path);
        const whisperRes = await openai.audio.transcriptions.create({
          file: audioStream,
          model: "whisper-1",
          response_format: "text",
          language: "en"
        });
        
        console.log("Transcription completed, length:", whisperRes.length);
        
        transcript = whisperRes;
        
        if (!transcript || transcript.trim().length === 0) {
          throw new Error("No speech could be transcribed from this video. The video may be music-only or have very unclear audio.");
        }

        if (transcript.trim().length < 50) {
          console.log("Short transcript:", transcript);
          throw new Error("Very little speech detected. The video may be mostly music or have poor audio quality.");
        }
        
        prompt = `Create Anki flashcards from this YouTube video transcript:\n\n${transcript}\n\nYouTube URL: ${value}`;
        
      } finally {
        cleanup();
      }
    } catch (err: any) {
      console.error("YouTube processing error:", err);
      
      let errorMessage = "Failed to process YouTube video: ";
      if (err.message.includes("timeout")) {
        errorMessage += "Processing timed out. This usually happens with longer videos or slow connections. Try a shorter video (under 10 minutes).";
      } else if (err.message.includes("private") || err.message.includes("unavailable") || err.message.includes("age-restricted")) {
        errorMessage += "Video is private, unavailable, age-restricted, or region-blocked.";
      } else if (err.message.includes("transcribed") || err.message.includes("speech")) {
        errorMessage += "No clear speech detected. Try a video with clear narration or dialogue.";
      } else if (err.message.includes("Download failed")) {
        errorMessage += "Could not download video. It may be protected or have streaming restrictions.";
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } else {
    prompt = `Create Anki flashcards from this text content:\n\n${value}`;
  }

  try {
    console.log("Starting OpenAI completion...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: ANKI_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    const aiResult = completion.choices[0]?.message?.content || "No response from AI.";
    console.log("OpenAI completion successful");
    return NextResponse.json({ result: aiResult });
  } catch (err: any) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: err.message || "OpenAI API error" }, { status: 500 });
  }
} 