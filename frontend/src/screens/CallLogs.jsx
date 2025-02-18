import React, { useState } from "react";
import {
  Shield,
  AlertTriangle,
  QrCode,
  Search,
  MessageCircle,
  Download,
  PiggyBank,
} from "lucide-react";

const ScamAwareness = () => {
  const [activeTab, setActiveTab] = useState("threats");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scamTypes = [
    {
      icon: <QrCode size={24} />,
      title: "QR Code Scams",
      desc: "Fraudsters use fake QR codes to steal your payment information. Always verify QR codes from trusted sources.",
    },
    {
      icon: <Download size={24} />,
      title: "Fake Apps",
      desc: "Be cautious of screen-sharing apps or APK files from untrusted sources. Only download from official app stores.",
    },
    {
      icon: <PiggyBank size={24} />,
      title: "Investment Scams",
      desc: "Beware of schemes promising unrealistic returns. Verify all investment opportunities thoroughly.",
    },
    {
      icon: <Search size={24} />,
      title: "Search Engine Scams",
      desc: "Avoid clicking on suspicious ads or search results. Use official websites directly.",
    },
    {
      icon: <MessageCircle size={24} />,
      title: "SMS/Chat Threats",
      desc: "Never share OTPs or personal information via SMS or social media chat.",
    },
  ];

  const safetyTips = {
    dos: [
      "Keep your mobile number updated in bank records",
      "Only enter UPI PIN for payments, never for receiving money",
      "Check in-app notifications during transactions",
      "Verify bank contact details from the official website",
      "Report issues only to bank or police authorities",
    ],
    donts: [
      "Never share SMS or OTPs with unknown persons",
      "Keep debit card details and UPI PIN private",
      "Avoid screen sharing apps during transactions",
      "Don't post transaction details on social media",
      "Never transact while on call with strangers",
    ],
  };

  // Function to convert text to speech
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set language
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  // Function to stop speech
  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 bg-blue-600 text-white p-4 rounded-lg">
        <Shield size={32} />
        <h1 className="text-xl font-bold">Scam Alert Center</h1>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("threats")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "threats" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Threats
        </button>
        <button
          onClick={() => setActiveTab("safety")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "safety" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Safety Tips
        </button>
      </div>

      {/* Listen and Stop Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() =>
            speakText(
              activeTab === "threats"
                ? scamTypes.map((scam) => `${scam.title}: ${scam.desc}`).join(". ")
                : `Do's: ${safetyTips.dos.join(". ")}. Don'ts: ${safetyTips.donts.join(". ")}`
            )
          }
          disabled={isSpeaking}
          className="bg-green-500 text-white py-2 px-4 rounded-lg"
        >
          {isSpeaking ? "Speaking..." : "Listen"}
        </button>
        <button
          onClick={stopSpeech}
          disabled={!isSpeaking}
          className="bg-red-500 text-white py-2 px-4 rounded-lg"
        >
          Stop
        </button>
      </div>

      {/* Content */}
      {activeTab === "threats" ? (
        <div className="space-y-4">
          {scamTypes.map((scam, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-red-500">{scam.icon}</div>
                <h2 className="font-semibold">{scam.title}</h2>
              </div>
              <p className="text-gray-600 text-sm">{scam.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Do's */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <Shield size={24} />
              <h2 className="font-semibold">Do's</h2>
            </div>
            <ul className="space-y-3">
              {safetyTips.dos.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="text-green-500 mt-1">•</div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <AlertTriangle size={24} />
              <h2 className="font-semibold">Don'ts</h2>
            </div>
            <ul className="space-y-3">
              {safetyTips.donts.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="text-red-500 mt-1">•</div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScamAwareness;