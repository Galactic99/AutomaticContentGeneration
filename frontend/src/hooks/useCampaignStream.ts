import { useState, useEffect } from "react";

export interface AgentLog {
  agent_id: string;
  agent_name: string;
  message: string;
  status: "thinking" | "typing" | "completed" | "error";
  timestamp: string;
}

export function useCampaignStream(campaignId: string) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    // 1. Initialize EventSource for SSE
    const url = `http://localhost:8000/api/v1/campaign/${campaignId}/stream`;
    const eventSource = new EventSource(url);

    // 2. Handle Incoming Messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // A. Handle Status Events (connected / completed / error)
        if (data.status === "connected") {
            console.log("Assembly Line Stream Connected.");
            return;
        }

        if (data.next_step === "review") {
          setIsCompleted(true);
          setActiveAgentId(null);
          eventSource.close();
          return;
        }

        if (data.error) {
            setError(data.error);
            eventSource.close();
            return;
        }

        // B. Handle Agent Logs
        const newLog: AgentLog = data;
        setLogs((prev) => {
            // Check for duplicates (Simple protection for re-renders)
            const exists = prev.some(l => l.message === newLog.message && l.timestamp === newLog.timestamp);
            if (exists) return prev;
            return [...prev, newLog];
        });
        
        // C. Update Active Persona tracking
        if (newLog.status === "thinking" || newLog.status === "typing") {
            setActiveAgentId(newLog.agent_id);
        } else if (newLog.status === "completed") {
            setActiveAgentId((prevId) => prevId === newLog.agent_id ? null : prevId);
        }

      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    // 3. Handle Connection Errors
    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      setError("Lost connection to the assembly line. It might have finished or crashed.");
      setActiveAgentId(null);
      eventSource.close();
    };

    // 4. Cleanup on Unmount
    return () => {
      eventSource.close();
    };
  }, [campaignId]);

  return { logs, isCompleted, error, activeAgentId };
}
