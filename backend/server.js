const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const axios = require("axios")
const fs = require("fs")
const ffmpeg = require("fluent-ffmpeg")
const path = require("path")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const { analyzeCallRecording } = require("./suspicionAnalysis") // Import your additional function if needed

// --- Gemini AI Pipeline Function ---
async function processWithGeminiAI(transcription) {
  try {
    const GEMINI_API_KEY = "AIzaSyCOSX_kqyRGqdjaCzA4gc_2LzxIigPAkC0"
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.")
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `Try creating a meaningful sentence using both of these transcriptions that are en-US and en-IN:\n\nTranscription:\n${transcription}`
    console.log("Generating refined text with Gemini AI...")
    const result = await model.generateContent(prompt)
    const refinedText = await result.response.text()
    console.log("Refined Text from Gemini AI:\n", refinedText)

    // Perform scam analysis (if desired)
    const scamAnalysis = await analyzeCallRecording(refinedText)
    console.log("Scam Analysis Result:\n", scamAnalysis)

    return { refinedText, scamAnalysis }
  } catch (error) {
    console.error("Error processing with Gemini AI:", error)
    return {
      refinedText: "Error processing text.",
      scamAnalysis: "Scam analysis unavailable.",
    }
  }
}

// --- MongoDB Setup ---
const MONGO_URI = "mongodb+srv://chetan95497:Chetan@rtc.5rtod.mongodb.net/?retryWrites=true&w=majority&appName=rtc"
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err))

const recordingSchema = new mongoose.Schema({
  url: String,
  transcription: String,
  refinedTranscription: String,
  scamAnalysis: String, // To store scam analysis results
  createdAt: { type: Date, default: Date.now },
})
const Recording = mongoose.model("Recording", recordingSchema)

// --- Express & Socket.IO Setup ---
const app = express()
app.use(cors())
app.use(bodyParser.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
})

// --- Direct Calling Signaling & Heartbeat ---
const onlineUsers = {} // userId -> socket.id
const lastPing = {} // userId -> timestamp

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  // Register the user.
  socket.on("register-user", (userId) => {
    onlineUsers[userId] = socket.id
    lastPing[userId] = Date.now()
    console.log("Online Users:", onlineUsers)
    io.emit("update-users", onlineUsers)
  })

  // Receive heartbeat pings from clients.
  socket.on("heartbeat", (userId) => {
    lastPing[userId] = Date.now()
  })

  socket.on("call-user", ({ targetUserId, callerId, offer }) => {
    const targetSocketId = onlineUsers[targetUserId]
    if (targetSocketId) {
      console.log(`Forwarding call from ${callerId} to ${targetUserId}`)
      io.to(targetSocketId).emit("incoming-call", { callerId, offer })
    } else {
      socket.emit("call-error", { message: "User not available" })
    }
  })

  socket.on("call-answer", ({ callerId, answer }) => {
    const callerSocketId = onlineUsers[callerId]
    if (callerSocketId) {
      console.log(`Forwarding call answer from callee to ${callerId}`)
      io.to(callerSocketId).emit("call-answered", { answer })
    }
  })

  socket.on("call-declined", ({ callerId }) => {
    const callerSocketId = onlineUsers[callerId]
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-declined")
    }
  })

  socket.on("ice-candidate", ({ targetUserId, candidate, from }) => {
    const targetSocketId = onlineUsers[targetUserId]
    if (targetSocketId) {
      console.log(`Forwarding ICE candidate from ${from} to ${targetUserId}`)
      io.to(targetSocketId).emit("ice-candidate", { candidate, from })
    }
  })

  socket.on("end-call", ({ otherUserId }) => {
    const targetSocketId = onlineUsers[otherUserId]
    if (targetSocketId) {
      console.log("Forwarding end-call to", otherUserId)
      io.to(targetSocketId).emit("end-call")
    }
  })

  socket.on("disconnect", () => {
    // Remove ALL keys whose value matches this socket's ID.
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId]
        delete lastPing[userId]
      }
    }
    io.emit("update-users", onlineUsers)
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// Periodically remove stale users that haven't sent a heartbeat in 30 seconds.
setInterval(() => {
  const now = Date.now()
  const staleThreshold = 30000 // 30 seconds
  let removed = false
  for (const userId in lastPing) {
    if (now - lastPing[userId] > staleThreshold) {
      console.log(`Removing stale user: ${userId}`)
      delete onlineUsers[userId]
      delete lastPing[userId]
      removed = true
    }
  }
  if (removed) {
    io.emit("update-users", onlineUsers)
  }
}, 10000) // every 10 seconds

// --- Endpoint to Process and Save Recording (Full Call) ---
app.post("/saveRecording", async (req, res) => {
  try {
    const { cloudinaryUrl } = req.body
    console.log("Received /saveRecording with URL:", cloudinaryUrl)
    if (!cloudinaryUrl) {
      return res.status(400).json({ error: "cloudinaryUrl is required" })
    }

    const newRecording = new Recording({ url: cloudinaryUrl })
    await newRecording.save()
    console.log("Recording document created in MongoDB.")

    const localWebmPath = path.join(__dirname, "temp_input.webm")
    const localWavPath = path.join(__dirname, "output.wav")
    const writer = fs.createWriteStream(localWebmPath)
    const response = await axios({
      url: cloudinaryUrl,
      method: "GET",
      responseType: "stream",
    })
    response.data.pipe(writer)
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
    })

    console.log("Downloaded WebM file from Cloudinary.")
    await new Promise((resolve, reject) => {
      ffmpeg(localWebmPath)
        .toFormat("wav")
        .audioChannels(1)
        .audioFrequency(48000)
        .on("end", () => {
          console.log("Conversion to WAV completed.")
          resolve()
        })
        .on("error", (err) => {
          console.error("Error during conversion:", err)
          reject(err)
        })
        .save(localWavPath)
    })

    const GOOGLE_API_KEY = "AIzaSyBiIUJiunnW34aF5VLIIpEx1J_iKZRCvn0"
    const audioData = fs.readFileSync(localWavPath)
    const audioBase64 = audioData.toString("base64")
    const googleUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`
    const languages = ["en-US", "en-IN"]
    let fullTranscription = ""

    for (const lang of languages) {
      console.log(`Transcribing with language: ${lang}`)
      const requestBody = {
        config: { encoding: "LINEAR16", sampleRateHertz: 48000, languageCode: lang },
        audio: { content: audioBase64 },
      }

      try {
        const googleResponse = await axios.post(googleUrl, requestBody)
        const transcription = googleResponse.data.results
          ? googleResponse.data.results.map((result) => result.alternatives[0].transcript).join(" ")
          : ""
        if (transcription) {
          fullTranscription += `[${lang}] ${transcription}\n`
        }
      } catch (error) {
        console.error(`Error transcribing with ${lang}:`, error.response?.data || error.message)
      }
    }

    console.log("Final Transcription:\n", fullTranscription.trim())
    newRecording.transcription = fullTranscription.trim()
    await newRecording.save()

    // Refine transcription and perform scam analysis.
    const { refinedText, scamAnalysis } = await processWithGeminiAI(newRecording.transcription)
    newRecording.refinedTranscription = refinedText
    newRecording.scamAnalysis = scamAnalysis
    await newRecording.save()

    // Clean up temporary files.
    fs.unlinkSync(localWebmPath)
    fs.unlinkSync(localWavPath)

    console.log("Recording processing complete. Sending response.")
    res.json({ success: true, recording: newRecording })
  } catch (error) {
    console.error("Error in /saveRecording:", error)
    res.status(500).json({ error: error.message })
  }
})

server.listen(5000, () => console.log("Server running on port 5000"))

