/**
 * API Configuration for Autonomous Content Factory
 * Dynamically switches based on the NEXT_PUBLIC_API_URL environment variable.
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  UPLOAD: (campaignId: string) => `${API_BASE_URL}/campaign/upload?campaign_id=${campaignId}`,
  STREAM: (campaignId: string) => `${API_BASE_URL}/campaign/${campaignId}/stream`,
  RESULTS: (campaignId: string) => `${API_BASE_URL}/campaign/${campaignId}/results`,
  REFINE: (campaignId: string) => `${API_BASE_URL}/campaign/${campaignId}/refine`,
  APPROVE: (campaignId: string) => `${API_BASE_URL}/campaign/${campaignId}/approve`,
};
