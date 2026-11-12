
import { supabase } from "../lib/supabase";

export const fetchClientJobs = async (clientId) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", clientId);

  if (error) throw error;
  return data;
};
