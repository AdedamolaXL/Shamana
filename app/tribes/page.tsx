import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import TribesClient from "./components/TribesClient";

export const revalidate = 0;

const TribesPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  return (
    <TribesClient session={session} />
  );
};

export default TribesPage;