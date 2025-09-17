import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import TribePageClient from "./TribePageClient";

interface TribePageProps {
  params: {
    id: string;
  };
}

export default async function TribePage({ params }: TribePageProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch tribe data
  const { data: tribe } = await supabase
    .from('tribes')
    .select('*')
    .eq('id', params.id)
    .single();

  // Fetch tribe members count
  const { count: memberCount } = await supabase
    .from('tribe_members')
    .select('*', { count: 'exact' })
    .eq('tribe_id', params.id);

  // Fetch tribe playlists
  const { data: playlists } = await supabase
    .from('playlists')
    .select('*')
    .eq('tribe_id', params.id)
    .order('created_at', { ascending: false });

  if (!tribe) {
    return <div>Tribe not found</div>;
  }

  return (
    <TribePageClient 
      tribe={tribe} 
      memberCount={memberCount || 0}
      playlists={playlists || []}
    />
  );
}