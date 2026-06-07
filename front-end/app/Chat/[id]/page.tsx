"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../lib/api";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Chat() {
  const params = useParams();
  const resumeId =
    params.id === "latest"
      ? undefined
      : Number(params.id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    if (!resumeId) return;

    console.log("WS connecting:", resumeId);

    const ws =
      new WebSocket(
        `ws://localhost:8000/ws/${resumeId}`
      );

    ws.onopen = () => {
      console.log(
        "WS connected"
      );
    };

    ws.onmessage = (
      event
    ) => {

      const data =
        JSON.parse(
          event.data
        );

      console.log(
        "WS MESSAGE:",
        data
      );

      if (
        data.step
      ) {

        setStatus(
          data.step
        );

      }

      // STREAM TOKENS
      if (
        data.step ===
        "stream"
      ) {
        setIsGenerating(
          true
        );

        isGeneratingRef.current =
          true;

        setMessages(
          (prev) => {

            const copy =
              [...prev];

            const last =
              copy[
                copy.length - 1
              ];

            // First streamed token
            if (
              !last ||
              last.role !==
              "assistant"
            ) {

              copy.push({
                role:
                  "assistant",

                text:
                  data.token
              });

            }

            // Append next tokens
            else {

              copy[
                copy.length - 1
              ] = {
                ...last,
                text:
                  last.text +
                  data.token
              };

            }

            return copy;

          }
        );

      }

      // Final completed response
      if (
        data.step ===
        "completed"
      ) {

        setStatus(
          "completed"
        );

        setIsGenerating(
          false
        );

        isGeneratingRef.current =
          false;

      }

      if (
        data.step ===
        "busy"
      ) {

        setStatus(
          "busy"
        );

        setIsGenerating(
          false
        );

        isGeneratingRef.current =
          false;

      }

    };

    ws.onclose = () => {
      console.log(
        "WS disconnected"
      );
    };

    return () => {
      ws.close();
    };

  }, [resumeId]);

  const send =
    async () => {

      if (
        !question.trim()
        ||
        isGeneratingRef.current
      )
        return;

      setStatus("");
      setIsGenerating(
        true
      );

      isGeneratingRef.current =
        true;

      setMessages(
        (prev) => [
          ...prev,
          {
            role:
              "user",

            text:
              question
          }
        ]
      );

      const q =
        question;

      setQuestion("");

      try {

        const data = await api.askQuestion(
          resumeId,
          q
        );

        if (!resumeId && data?.answer) {
          setMessages(
            (prev) => [
              ...prev,
              {
                role:
                  "assistant",

                text:
                  data.answer
              }
            ]
          );
        }

        setIsGenerating(
          false
        );

        isGeneratingRef.current =
          false;

      } catch (error) {

        setStatus(
          "failed"
        );

        setIsGenerating(
          false
        );

        isGeneratingRef.current =
          false;

        console.error(
          error
        );

      }

    };

  return (
    <div className="h-screen flex flex-col bg-black">

      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full p-6 space-y-6">

        {messages.map(
          (
            m,
            i
          ) => (

            <div
              key={i}
              className={
                m.role ===
                "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >

              <div
                className={`max-w-xl rounded-2xl px-5 py-4 ${
                  m.role ===
                  "user"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-white"
                }`}
              >

                {m.text}

              </div>

            </div>

          )
        )}

        {status && (

          <div className="text-center text-sm text-zinc-400 animate-pulse">

            {status ===
              "retrieving_context" &&
              "Searching resume…"}

            {status ===
              "thinking" &&
              "Thinking…"}

            {status ===
              "stream" &&
              "Generating..."}

            {status ===
              "completed" &&
              "Done"}

            {status ===
              "busy" &&
              "Already generating..."}

            {status ===
              "failed" &&
              "Failed to send"}

          </div>

        )}

      </div>

      <div className="border-t border-zinc-800 p-5">

        <div className="max-w-4xl mx-auto flex gap-3">

          <input
            value={
              question
            }
            onChange={
              (e) =>
                setQuestion(
                  e.target
                    .value
                )
            }
            onKeyDown={
              (e) =>
                e.key ===
                  "Enter" &&
                !isGenerating &&
                send()
            }
            placeholder="Ask about resume..."
            disabled={
              isGenerating
            }
            className="flex-1 bg-zinc-900 text-white rounded-xl p-4 outline-none"
          />

          <button
            onClick={
              send
            }
            disabled={
              isGenerating
            }
            className="bg-white text-black px-6 rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}
