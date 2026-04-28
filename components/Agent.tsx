"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const messagesRef = useRef<SavedMessage[]>([]);
  const hasRedirectedRef = useRef(false);

  // Keep ref in sync so finishCall always has latest messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Save transcript and redirect immediately
  const finishCall = () => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;

    console.log("finishCall - type:", type, "messages:", messagesRef.current.length);

    if (type === "generate") {
      window.location.href = "/";
      return;
    }

    // Save everything needed to sessionStorage
    const data = {
      transcript: messagesRef.current,
      userId: userId || "",
      feedbackId: feedbackId || "",
    };
    sessionStorage.setItem(`interview-data-${interviewId}`, JSON.stringify(data));

    // Hard redirect to the processing page
    window.location.href = `/interview/${interviewId}/processing`;
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("VAPI call-end fired");
      setCallStatus(CallStatus.FINISHED);
      // Wait 4s for last transcripts from external assistant, then redirect
      setTimeout(() => finishCall(), 4000);
    };

    const onMessage = (message: Message) => {
      // Capture individual transcript messages (inline assistant style)
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }

      // Capture conversation-update messages (external assistant style)
      // These contain the full conversation history from the assistant
      if (message.type === "conversation-update" && message.conversation) {
        const conversation = message.conversation as Array<{
          role: string;
          content: string;
        }>;
        // Replace messages with the full conversation from VAPI
        const mapped = conversation
          .filter((m: any) => m.role === "user" || m.role === "assistant")
          .map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: typeof m.content === "string" ? m.content : (m.content?.[0]?.text || m.content?.[0]?.content || ""),
          }))
          .filter((m: any) => m.content && m.content.trim().length > 0);
        if (mapped.length > 0) {
          setMessages(mapped);
        }
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          questions: formattedQuestions,
          username: userName,
          userid: userId,
        },
      });
    }
  };

  const handleDisconnect = () => {
    console.log("End clicked, messages:", messages.length);
    setCallStatus(CallStatus.FINISHED);
    try {
      vapi.stop();
    } catch (e) {
      console.log("vapi.stop error:", e);
    }
    // Redirect immediately
    finishCall();
  };

  return (
    <>
      {/* Connecting Overlay */}
      {callStatus === CallStatus.CONNECTING && (
        <div className="fixed inset-0 bg-dark-100/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-primary-200 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-semibold text-white">Connecting to your interviewer...</h3>
            <p className="text-light-400 text-sm">Please wait while we set up your screening call</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* Ending Overlay */}
      {callStatus === CallStatus.FINISHED && (
        <div className="fixed inset-0 bg-dark-100/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-success-100/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-success-100 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-semibold text-white">Wrapping up your interview...</h3>
            <p className="text-light-400 text-sm">Saving your responses and preparing assessment</p>
          </div>
        </div>
      )}

      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>CueHire Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={callStatus === CallStatus.CONNECTING || callStatus === CallStatus.FINISHED}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === "INACTIVE"
                ? "Call"
                : callStatus === "CONNECTING"
                ? ". . ."
                : "Done"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
