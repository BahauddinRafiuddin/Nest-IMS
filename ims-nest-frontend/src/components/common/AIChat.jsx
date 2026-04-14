/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Loader2 } from "lucide-react";
import { publicChatHandler } from "../../api/publicChat-bot.api"; // Adjust this path to your api file
import { privateChatHandler } from "../../api/privateChat.api";
import { registerUser } from "../../api/auth.api";

const renderMarkdown = (text) => {
  if (!text) return "";
  return (
    text
      // Headers
      .replace(
        /^### (.+)$/gm,
        '<h3 style="margin:4px 0 2px;font-size:13px;font-weight:600">$1</h3>',
      )
      .replace(
        /^## (.+)$/gm,
        '<h2 style="margin:4px 0 2px;font-size:14px;font-weight:600">$1</h2>',
      )
      .replace(
        /^# (.+)$/gm,
        '<h1 style="margin:4px 0 2px;font-size:15px;font-weight:700">$1</h1>',
      )
      // Bold italic combined
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code style="background:rgba(0,0,0,0.08);padding:1px 4px;border-radius:3px;font-size:11px;font-family:monospace">$1</code>',
      )
      // Numbered lists
      .replace(
        /^\d+\.\s+(.+)$/gm,
        '<li style="margin-left:16px;list-style:decimal">$1</li>',
      )
      // Bullet lists
      .replace(
        /^[-*]\s+(.+)$/gm,
        '<li style="margin-left:16px;list-style:disc">$1</li>',
      )
      // Wrap consecutive <li> items in <ul>
      .replace(
        /(<li[^>]*>.+?<\/li>\n?)+/g,
        '<ul style="margin:4px 0;padding:0">$&</ul>',
      )
      // Paragraphs
      .replace(/\n\n/g, '</p><p style="margin:6px 0">')
      // Line breaks
      .replace(/\n/g, "<br/>")
      .trim()
  );
};

const AIChat = ({ type = "public" }) => {
  const [registerStep, setRegisterStep] = useState(null);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hi! I'm your Internship Assistant. How can I help you today?",
    },
  ]);

  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (type === "private") {
      setMessages([
        {
          role: "ai",
          content: "Hi! I'm your Dashboard Assistant. I am here to help you.",
        },
      ]);
    }
  }, [type]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // ✅ STEP 1: HANDLE REGISTER FLOW FIRST (VERY IMPORTANT)
    if (registerStep) {
      handleRegisterFlow(userMessage);
      return;
    }

    setLoading(true);

    try {
      const data =
        type === "private"
          ? await privateChatHandler({ message: userMessage })
          : await publicChatHandler({ message: userMessage });

      // ✅ STEP 2: START REGISTER FLOW
      if (data.action === "REGISTER") {
        setRegisterStep("name");

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              "Great! Let's create your account.\n\n👉 What is your full name?\n\n(Type 'cancel' anytime to stop)",
          },
        ]);

        return;
      }

      // Normal chatbot reply
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFlow = async (userMessage) => {
    const cleanInput = userMessage.trim();

    //  CANCEL OPTION
    if (cleanInput.toLowerCase() === "cancel") {
      setRegisterStep(null);
      setRegisterData({ name: "", email: "", password: "" });

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "❌ Registration cancelled. You can start again anytime.",
        },
      ]);
      return;
    }

    // STEP 1: NAME
    if (registerStep === "name") {
      const nameRegex = /^[A-Za-z ]{3,30}$/;

      if (!nameRegex.test(cleanInput)) {
        return setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: "❌ Enter a valid name (3–30 letters only).",
          },
        ]);
      }

      setRegisterData((prev) => ({ ...prev, name: cleanInput }));
      setRegisterStep("email");

      return setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "📧 Enter your email address:\n\n(Type 'cancel' to exit)",
        },
      ]);
    }

    // STEP 2: EMAIL
    if (registerStep === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanInput)) {
        return setMessages((prev) => [
          ...prev,
          { role: "ai", content: "❌ Invalid email format. Try again." },
        ]);
      }

      setRegisterData((prev) => ({ ...prev, email: cleanInput }));
      setRegisterStep("password");

      return setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "🔒 Create password (8+ chars, 1 capital, 1 number):\n\n(Type 'cancel' to exit)",
        },
      ]);
    }

    // STEP 3: PASSWORD
    if (registerStep === "password") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

      if (!passwordRegex.test(cleanInput)) {
        return setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: "❌ Weak password. Include 1 capital letter & 1 number.",
          },
        ]);
      }

      const finalData = {
        ...registerData,
        password: cleanInput,
      };

      try {
        await registerUser(finalData);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: "🎉 Registration successful! You can now login.",
          },
        ]);

        // ✅ RESET
        setRegisterStep(null);
        setRegisterData({ name: "", email: "", password: "" });
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: err.response?.data?.message || "Registration failed",
          },
        ]);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="w-[320px] sm:w-96 h-125 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-200" />
              <span className="font-bold tracking-tight">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-indigo-500 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <span
                      className="prose-ai"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-slate-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about internships..."
              className="flex-1 text-sm bg-slate-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
          {registerStep && (
            <div className="px-4 pb-3">
              <button
                onClick={() => {
                  setRegisterStep(null);
                  setRegisterData({ name: "", email: "", password: "" });

                  setMessages((prev) => [
                    ...prev,
                    { role: "ai", content: "❌ Registration cancelled." },
                  ]);
                }}
                className="w-full text-sm text-red-600 border border-red-300 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
              >
                Cancel Registration
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`
          flex items-center justify-center transition-all duration-300 shadow-2xl 
          border-4 border-white cursor-pointer relative group active:scale-95
          ${
            isChatOpen
              ? "w-14 h-14 rounded-full bg-white text-indigo-600 rotate-90"
              : "px-6 h-14 rounded-full bg-indigo-600 text-white hover:scale-105"
          }
        `}
      >
        <div className="flex items-center gap-2 whitespace-nowrap">
          {/* Text only shows when chat is closed */}
          {!isChatOpen && (
            <span className="text-sm font-bold tracking-wide animate-in fade-in zoom-in duration-300">
              Ask AI
            </span>
          )}

          {isChatOpen ? (
            <X size={28} />
          ) : (
            <Sparkles size={24} className="animate-pulse" />
          )}
        </div>
      </button>
    </div>
  );
};

export default AIChat;
