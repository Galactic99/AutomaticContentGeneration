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
  const [lastAgentMessage, setLastAgentMessage] = useState<Record<string, string>>({
    researcher: "Waiting for start...",
    copywriter: "Awaiting research...",
    editor: "Awaiting drafts...",
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
        const isMainAgent = ["researcher", "copywriter", "editor"].includes(data.agent_id);

        // --- Phase State Machine ---
        if (isMainAgent) {
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
            if (data.message) {
              setLastAgentMessage(prev => ({ ...prev, [agentId]: data.message }));
            }
          }
        }

        // --- Log Accumulation ---
        if (data.type === "chunk") {
          // CHUNK MODE: Only update the very last log if it's for this agent and is in an active state
          setLogs((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (last.agent_id === agentId && (last.status === "typing" || last.status === "thinking")) {
              const updated = [...prev];
              const newText = last.status === "thinking" ? data.message : last.message + data.message;
              updated[prev.length - 1] = { ...last, message: newText, status: "typing" };
              
              // LIVE SIDEBAR UPDATE: Only for main agents
              if (isMainAgent) {
                  setLastAgentMessage(lp => ({ 
                    ...lp, 
                    [agentId]: newText.length > 60 ? "..." + newText.slice(-57) : newText 
                  }));
              }
              
              return updated;
            }
            return prev;
          });
        } else if (data.type === "cursor_off") {
          const agentId_off = data.agent_id as keyof AgentPhases;
          setAgentPhases((prev) => ({ ...prev, [agentId_off]: "thinking" as AgentPhase }));
          setLogs((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (last.agent_id === data.agent_id && last.status === "typing") {
              const updated = [...prev];
              updated[prev.length - 1] = { ...last, status: "thinking" as const };
              return updated;
            }
            return prev;
          });
        } else {
          // FULL MESSAGE MODE: Append as a fresh new bubble
          const newLog: AgentLog = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
          };
          setLogs((prev) => {
            // GLOBAL SYNC: When a new log arrives, mark ALL previous messages as completed 
            // to clear any old pulses or indicators from ANY agent.
            const updated = prev.map((l) => ({ ...l, status: "completed" as const }));
            return [...updated, newLog];
          });
          
          if (isMainAgent && newLog.agent_id) {
            setLastAgentMessage(prev => ({ ...prev, [newLog.agent_id]: newLog.message }));
          }
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

  return { logs, isCompleted, error, activeAgentId, agentPhases, lastAgentMessage };
}
