import { useState, useEffect, useRef } from "react";

export interface AgentLog {
  agent_id: string;
  agent_name: string;
  message: string;
  status: "thinking" | "typing" | "completed" | "error";
  timestamp: string;
}

export type AgentPhase = "idle" | "thinking" | "typing" | "completed";

export interface AgentPhases {
  researcher: AgentPhase;
  copywriter: AgentPhase;
  editor: AgentPhase;
}

export function useCampaignStream(campaignId: string) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [agentPhases, setAgentPhases] = useState<AgentPhases>({
    researcher: "idle",
    copywriter: "idle",
    editor: "idle",
  });

  useEffect(() => {
    if (!campaignId) return;

    const url = `http://localhost:8000/api/v1/campaign/${campaignId}/stream`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // A. System-level events
        if (data.status === "connected") {
          console.log("Assembly Line Stream Connected.");
          return;
        }

        if (data.next_step === "review") {
          setIsCompleted(true);
          setActiveAgentId(null);
          setAgentPhases({ researcher: "completed", copywriter: "completed", editor: "completed" });
          eventSource.close();
          return;
        }

        if (data.error) {
          setError(data.error);
          console.log(data.error);
          eventSource.close();
          return;
        }

        const agentId = data.agent_id as keyof AgentPhases;

        // --- Phase State Machine ---
        if (data.status === "thinking") {
          setActiveAgentId(agentId);
          setAgentPhases((prev) => {
            const next = { ...prev, [agentId]: "thinking" as AgentPhase };
            // Feedback loop: if copywriter restarts, reset editor
            if (agentId === "copywriter" && prev.copywriter === "completed") {
              next.editor = "idle";
            }
            return next;
          });
        } else if (data.status === "typing") {
          setActiveAgentId(agentId);
          setAgentPhases((prev) => ({ ...prev, [agentId]: "typing" as AgentPhase }));
        } else if (data.status === "completed") {
          setAgentPhases((prev) => ({ ...prev, [agentId]: "completed" as AgentPhase }));
          setActiveAgentId((prev) => (prev === agentId ? null : prev));
        }

        // --- Log Accumulation ---
        if (data.type === "chunk") {
          // CHUNK MODE: append text to the existing typing bubble for this agent
          setLogs((prev) => {
            const lastIdx = prev.findLastIndex(
              (l) => l.agent_id === agentId && (l.status === "typing" || l.status === "thinking")
            );
            if (lastIdx >= 0) {
              // Append the new chunk to the existing bubble
              const updated = [...prev];
              const existing = updated[lastIdx];
              // If the previous state was thinking, completely replace the placeholder with the first typed chunk
              const newText = existing.status === "thinking" 
                ? data.message 
                : existing.message + data.message;
              // Keep the bubble size manageable by trimming front
              const trimmed = newText.length > 300 ? "..." + newText.slice(-280) : newText;
              updated[lastIdx] = { ...existing, message: trimmed, status: "typing" };
              return updated;
            }
            // No existing bubble — create one
            return [...prev, { agent_id: agentId, agent_name: data.agent_name, message: data.message, status: "typing" as const, timestamp: data.timestamp }];
          });
        } else if (data.type === "cursor_off") {
          // CURSOR OFF MODE: Typewriter finished, switch status to thinking
          setLogs((prev) => {
            const lastIdx = prev.findLastIndex(
              (l) => l.agent_id === data.agent_id && l.status === "typing"
            );
            if (lastIdx >= 0) {
              const updated = [...prev];
              updated[lastIdx] = { ...updated[lastIdx], status: "thinking" as const };
              return updated;
            }
            return prev;
          });
        } else {
          // FULL MESSAGE MODE: completed events, thinking starts, etc.
          const newLog: AgentLog = data;
          setLogs((prev) => {
            // First, update any old logs for this agent to remove their persisting cursor
            const updated = prev.map((l) => 
              l.agent_id === newLog.agent_id && (l.status === "typing" || l.status === "thinking")
                ? { ...l, status: "completed" as const }
                : l
            );

            // If this is a "thinking" start and we already have a typing bubble for this agent,
            // don't duplicate — just add fresh
            const exists = updated.some(
              (l) => l.message === newLog.message && l.agent_id === newLog.agent_id && l.status === newLog.status
            );
            if (exists) return updated;
            return [...updated, newLog];
          });
        }
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      setError("Lost connection to the assembly line. It might have finished or crashed.");
      setActiveAgentId(null);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [campaignId]);

  return { logs, isCompleted, error, activeAgentId, agentPhases };
}
