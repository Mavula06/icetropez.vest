"use client";

import { useState } from "react";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const answers: Record<string, string> = {
  Deposits:
    "To make a deposit, go to Dashboard → Deposit. Use the Icetropez.Vest company banking details shown there, make your EFT payment, and submit your payment reference. Deposits are manually verified before funds are added to your wallet.",

  "Investment Plans":
    "You can view the available investment plans from Dashboard → Investments. Each plan has its own minimum amount, duration and return rate. You must have sufficient available wallet balance to invest.",

  Withdrawals:
    "To request a withdrawal, go to Dashboard → Withdraw. The minimum withdrawal amount is R100. Your withdrawal is submitted for manual administrator approval. You can only withdraw from your available wallet balance.",

  "Banking Details":
    "The official Icetropez.Vest company banking details are displayed on the Deposit page. Always verify the banking details shown inside your account before making an EFT payment.",

  "Account & Login":
    "If you cannot log in, make sure you are using the email address registered with your Icetropez.Vest account. If the problem continues, contact support at help@icetropez.net.",

  Referrals:
    "Your referral information is available from your dashboard. Referral rewards are recorded in your wallet when the applicable referral conditions are met.",

  Security:
    "Never share your password, session information or banking login details with anyone. Icetropez.Vest support will never ask you to provide your password.",
};

const quickQuestions = [
  "Deposits",
  "Investment Plans",
  "Withdrawals",
  "Banking Details",
  "Account & Login",
  "Referrals",
  "Security",
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi! 👋 Welcome to Icetropez.Vest Support. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  function addMessage(text: string, sender: "bot" | "user") {
    setMessages((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        sender,
        text,
      },
    ]);
  }

  function askQuestion(question: string) {
    addMessage(question, "user");

    const answer =
      answers[question] ??
      "I'm not able to answer that question automatically. Please contact our support team at help@icetropez.net.";

    window.setTimeout(() => {
      addMessage(answer, "bot");
    }, 350);
  }

  function sendMessage() {
    const question = input.trim();

    if (!question) {
      return;
    }

    setInput("");
    addMessage(question, "user");

    const normalized = question.toLowerCase();

    let answer =
      "I can help with deposits, investment plans, withdrawals, banking details, account/login problems, referrals and security. If you need further assistance, please contact help@icetropez.net.";

    if (
      normalized.includes("deposit") ||
      normalized.includes("eft") ||
      normalized.includes("fund")
    ) {
      answer = answers.Deposits;
    } else if (
      normalized.includes("withdraw") ||
      normalized.includes("cash out")
    ) {
      answer = answers.Withdrawals;
    } else if (
      normalized.includes("investment") ||
      normalized.includes("plan") ||
      normalized.includes("return")
    ) {
      answer = answers["Investment Plans"];
    } else if (
      normalized.includes("bank") ||
      normalized.includes("account number") ||
      normalized.includes("branch")
    ) {
      answer = answers["Banking Details"];
    } else if (
      normalized.includes("login") ||
      normalized.includes("password") ||
      normalized.includes("sign in") ||
      normalized.includes("account")
    ) {
      answer = answers["Account & Login"];
    } else if (
      normalized.includes("referral") ||
      normalized.includes("refer")
    ) {
      answer = answers.Referrals;
    } else if (
      normalized.includes("security") ||
      normalized.includes("safe") ||
      normalized.includes("password")
    ) {
      answer = answers.Security;
    }

    window.setTimeout(() => {
      addMessage(answer, "bot");
    }, 350);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-800 px-4 py-4">
            <div>
              <p className="font-semibold text-white">
                Icetropez Support
              </p>
              <p className="text-xs text-emerald-400">
                ● Support assistant
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close support chat"
            >
              ×
            </button>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender === "user"
                    ? "ml-8 rounded-2xl rounded-br-md bg-emerald-500 px-4 py-3 text-sm text-slate-950"
                    : "mr-8 rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 text-sm leading-6 text-slate-200"
                }
              >
                {message.text}
              </div>
            ))}

            <div className="pt-2">
              <p className="mb-2 text-xs text-slate-500">
                Popular questions
              </p>

              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => askQuestion(question)}
                    className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-400"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask a question..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-800 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
              />

              <button
                type="button"
                onClick={sendMessage}
                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Send
              </button>
            </div>

            <a
              href="mailto:help@icetropez.net"
              className="mt-2 block text-center text-xs text-slate-500 hover:text-emerald-400"
            >
              Contact human support
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-slate-950 shadow-xl shadow-black/40 transition hover:scale-105 hover:bg-emerald-400"
        aria-label="Open support chat"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
