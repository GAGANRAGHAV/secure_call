const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// API Keys (Replace with your own)
const GOOGLE_SPEECH_API_KEY = 'AIzaSyBiIUJiunnW34aF5VLIIpEx1J_iKZRCvn0';
const GEMINI_API_KEY = 'AIzaSyCOSX_kqyRGqdjaCzA4gc_2LzxIigPAkC0';

// Convert WebM to WAV
async function convertWebmToWav(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .toFormat('wav')
            .audioChannels(1)
            .audioFrequency(48000)
            .on('end', () => {
                console.log("Conversion to WAV completed.");
                resolve(outputFile);
            })
            .on('error', err => reject(err))
            .save(outputFile);
    });
}

// Transcribe Audio in Multiple Languages
async function transcribeInTwoLanguages(audioFilePath) {
    try {
        const audioData = fs.readFileSync(audioFilePath);
        const audioBase64 = audioData.toString('base64');

        const url = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`;
        const languages = ["en-US", "en-IN"];
        let fullTranscription = "";

        for (const lang of languages) {
            console.log(`Transcribing in ${lang}...`);
            const requestBody = {
                config: { encoding: "LINEAR16", sampleRateHertz: 48000, languageCode: lang },
                audio: { content: audioBase64 }
            };

            try {
                const response = await axios.post(url, requestBody);
                const transcription = response.data.results
                    ? response.data.results.map(result => result.alternatives[0].transcript).join(" ")
                    : "";

                console.log(transcription);

                if (transcription) {
                    fullTranscription += `[${lang}] ${transcription}\n`;
                }
            } catch (error) {
                console.error(`Error transcribing ${lang}:`, error.response?.data || error.message);
            }
        }

        console.log("Final Transcription:\n", fullTranscription.trim());
        return fullTranscription.trim();
    } catch (error) {
        console.error("Error during transcription:", error);
    }
}

// Process the Transcription with Gemini AI
// Process the Transcription with Gemini AI
async function processWithGeminiAI(transcription) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Provide a structured prompt for merging the text
        const prompt = `
        try creating a meaning full sentence using both of these transcription that is en US and en IN

        Transcription:
        ${transcription}
        `;

        console.log("Generating refined text with Gemini AI...");
        const result = await model.generateContent(prompt);
        const refinedText = await result.response.text();

        console.log("Refined Text from Gemini AI:\n", refinedText);
        return refinedText;
    } catch (error) {
        console.error("Error processing with Gemini AI:", error);
        return "Error processing text.";
    }
}


// Main Execution
async function processAudio(inputFile) {
    try {
        const outputFile = "output.wav";
        await convertWebmToWav(inputFile, outputFile);
        const transcription = await transcribeInTwoLanguages(outputFile);
        
        if (transcription) {
            const refinedText = await processWithGeminiAI(transcription);
            fs.writeFileSync("final_transcription.txt", refinedText, "utf-8");
            console.log("Final transcription saved to final_transcription.txt");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run with Sample WebM file
processAudio("samle2.webm"); // Replace with your actual WebM file