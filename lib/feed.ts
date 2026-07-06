import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/mock-data";

export const getProjects = cache(async (): Promise<Project[]> => {
  const { data } = await supabase.from("projects").select("*");
  return (data as Project[]) ?? [];
});
