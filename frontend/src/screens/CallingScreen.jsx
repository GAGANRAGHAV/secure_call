import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, UserCircle } from 'lucide-react';
import io from "socket.io-client";

const socket = io("http://localhost:5000");

// Replace these with your Cloudinary details.
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dazgjfmbe/upload";
const CLOUDINARY_UPLOAD_PRESET = "rtccall";

// Use a STUN server configuration.
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function Home() {
  const [userId, setUserId] = useState("user_" + Math.floor(Math.random() * 1000));
  const [onlineUsers, setOnlineUsers] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [recordingData, setRecordingData] = useState({ transcription: "", refinedTranscription: "" });
  const [isCaller, setIsCaller] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const audioContext = useRef(null);
  const destination = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  useEffect(() => {
    socket.emit("register-user", userId);
    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", userId);
    }, 5000);
    return () => clearInterval(heartbeatInterval);
  }, [userId]);

  useEffect(() => {
    socket.on("update-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("incoming-call", async ({ callerId, offer }) => {
      console.log("Incoming call from:", callerId);
      setIncomingCall({ callerId, offer });
    });

    socket.on("end-call", () => {
      console.log("Received end-call event from remote.");
      endCall(false);
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
      console.log("Received ICE candidate from:", from, candidate);
      const pc = peerConnections.current[from];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log("Added ICE candidate"))
          .catch((error) => console.error("Error adding ICE candidate:", error));
      }
    });

    socket.on("call-answered", async ({ answer }) => {
      console.log("Received call answered event", answer);
      if (targetUser) {
        const pc = peerConnections.current[targetUser];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("Set remote description on caller side.");
        }
      }
    });

    return () => {
      socket.off("update-users");
      socket.off("incoming-call");
      socket.off("end-call");
      socket.off("ice-candidate");
      socket.off("call-answered");
    };
  }, [targetUser]); // Added targetUser to dependencies

  const startRecording = () => {
    if (destination.current) {
      mediaRecorder.current = new MediaRecorder(destination.current.stream);
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      mediaRecorder.current.start();
      console.log("Recording started...");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      console.log("Recording stopped.");
      await new Promise(resolve => mediaRecorder.current.onstop = resolve);
      const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
      uploadRecording(blob);
    }
  };

  const uploadRecording = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, `recording-${userId}.webm`);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Cloudinary response:", data);
      if (data.secure_url) {
        const backendResponse = await fetch("http://localhost:5000/saveRecording", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cloudinaryUrl: data.secure_url }),
        });
        const backendData = await backendResponse.json();
        if (backendData.success) {
          setRecordingData({
            transcription: backendData.recording.transcription,
            refinedTranscription: backendData.recording.refinedTranscription,
          });
          console.log("Recording processed successfully:", backendData);
        } else {
          console.error("Backend processing failed", backendData);
        }
      } else {
        console.error("Upload failed", data);
      }
    } catch (error) {
      console.error("Error processing recording:", error);
    }
  };

  const callUser = async (targetUserId) => {
    setIsCaller(true);
    setTargetUser(targetUserId);
    const peer = new RTCPeerConnection(rtcConfig);
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate from caller:", event.candidate);
        socket.emit("ice-candidate", {
          targetUserId,
          candidate: event.candidate,
          from: userId,
        });
      }
    };
    peerConnections.current[targetUserId] = peer;

    let localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Error accessing audio:", err);
      alert("Unable to access microphone");
      return;
    }
    localStreamRef.current = localStream;
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.current.resume();
    destination.current = audioContext.current.createMediaStreamDestination();
    const localAudioSource = audioContext.current.createMediaStreamSource(localStream);
    localAudioSource.connect(destination.current);

    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const audio = document.createElement("audio");
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      document.body.appendChild(audio);
      const remoteAudioSource = audioContext.current.createMediaStreamSource(remoteStream);
      remoteAudioSource.connect(destination.current);
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("call-user", { targetUserId, callerId: userId, offer });
    setCallActive(true);
    startRecording();
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    setIsCaller(false);
    const { callerId, offer } = incomingCall;
    const peer = new RTCPeerConnection(rtcConfig);
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate from callee:", event.candidate);
        socket.emit("ice-candidate", {
          targetUserId: callerId,
          candidate: event.candidate,
          from: userId,
        });
      }
    };
    peerConnections.current[callerId] = peer;

    let localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Error accessing audio:", err);
      alert("Unable to access microphone");
      return;
    }
    localStreamRef.current = localStream;
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.current.resume();
    destination.current = audioContext.current.createMediaStreamDestination();
    const localAudioSource = audioContext.current.createMediaStreamSource(localStream);
    localAudioSource.connect(destination.current);

    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const audio = document.createElement("audio");
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      document.body.appendChild(audio);
      const remoteAudioSource = audioContext.current.createMediaStreamSource(remoteStream);
      remoteAudioSource.connect(destination.current);
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("call-answer", { callerId, answer });
    setIncomingCall(null);
    setCallActive(true);
    startRecording();
  };

  const declineCall = () => {
    if (incomingCall) {
      socket.emit("call-declined", { callerId: incomingCall.callerId });
      setIncomingCall(null);
    }
  };

  const endCall = (triggerUpload = true) => {
    const otherUserId = Object.keys(peerConnections.current)[0];
    socket.emit("end-call", { otherUserId });
    setCallActive(false);
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (triggerUpload) {
      stopRecording();
    }
    recordedChunks.current = [];
  };


  return (
    <div>
      <h1>Realtime Chat App</h1>
      <p>Your ID: {userId}</p>
      <h2>Online Users</h2>
      <ul>
        {Object.keys(onlineUsers).map((key) => (
          <li key={key}>
            {key}
            {!callActive && (
              <button onClick={() => callUser(key)}>Call</button>
            )}
          </li>
        ))}
      </ul>
      {incomingCall && (
        <div>
          <p>Incoming call from {incomingCall.callerId}</p>
          <button onClick={answerCall}>Answer</button>
          <button onClick={declineCall}>Decline</button>
        </div>
      )}
      {callActive && (
        <div>
          <p>Call active</p>
          <button onClick={endCall}>End Call</button>
        </div>
      )}
      <h2>Recording Data</h2>
      <p>Transcription: {recordingData.transcription}</p>
      <p>Refined Transcription: {recordingData.refinedTranscription}</p>
    </div>
  );
}
