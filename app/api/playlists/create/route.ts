import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { uploadToIPFS } from '@/lib/ipfs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Playlist creation API called');
    const supabase = createRouteHandlerClient({ cookies });
    const { name, description } = await request.json();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Creating playlist for user:', session.user.id);
    
    // Create the playlist
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: session.user.id,
        name,
        description: description || null
      })
      .select()
      .single();

    if (error) {
      console.error('Playlist creation error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Playlist created with ID:', data.id);
    console.log('Calling NFT mint API...');

    const tokenId = process.env.HEDERA_NFT_TOKEN_ID;
if (!tokenId) {
  console.error('HEDERA_NFT_TOKEN_ID is not set');
  // Continue without NFT rather than failing completely
  return NextResponse.json(data);
}
    
  const playlistMetadata = {
  name,
  description: description || `A playlist created by ${session.user.email}`,
  image: "", 
  attributes: [
    { trait_type: "Creator", value: session.user.id },
    { trait_type: "Playlist Type", value: "User Created" },
    { trait_type: "Song Count", value: 0 },
  ],
  };
    
    const ipfsHash = await uploadToIPFS(playlistMetadata);
const metadataUri = `ipfs://${ipfsHash}`; 

    // Mint NFT for the playlist
  const nftResponse = await fetch(new URL("/api/nft/mint", request.url).toString(), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: session.user.id,
    tokenId: tokenId,
    metadata: metadataUri, // 👈 just the URI
  }),
});

    console.log('NFT API response status:', nftResponse.status);
    
    const nftData = await nftResponse.json();
    console.log('NFT API response data:', nftData);

    if (!nftData.success) {
      console.error('NFT minting failed:', nftData.error);
      // Continue without NFT rather than failing completely
      return NextResponse.json(data);
    }

    // Update playlist with NFT information
    const { error: updateError } = await supabase
      .from('playlists')
      .update({
        nft_token_id: nftData.tokenId,
        nft_serial_number: nftData.serialNumber,
        nft_metadata_uri: nftData.metadataUri
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Failed to update playlist with NFT info:', updateError);
    }

    console.log('Playlist created with NFT successfully');
    return NextResponse.json({
      ...data,
      nft_token_id: nftData.tokenId,
      nft_serial_number: nftData.serialNumber,
      nft_metadata_uri: nftData.metadataUri
    });
  } catch (error) {
    console.error('Playlist creation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}