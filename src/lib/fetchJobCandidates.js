import { supabase } from "../lib/supabase";

export const fetchJobCandidates = async (jobId) => {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("job_id", jobId);

  if (error) throw error;
  return data;
};

export async function updateCandidateStatus(relationId, status) {
  const { error } = await supabase
    .from('job_candidates')
    .update({ status })
    .eq('id', relationId);

  if (error) throw error;
}