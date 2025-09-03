// app/api/pinata-jwt/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Generating Pinata JWT...');
    
    if (!process.env.PINATA_JWT) {
      console.error('PINATA_JWT environment variable is not set');
      return NextResponse.json(
        { error: 'PINATA_JWT environment variable is not set' },
        { status: 500 }
      );
    }

    const keyRestrictions = {
      keyName: 'Signed Upload JWT',
      maxUses: 2,
      permissions: {
        endpoints: {
          data: {
            pinList: false,
            userPinnedDataTotal: false
          },
          pinning: {
            pinFileToIPFS: true,
            pinJSONToIPFS: false,
            pinJobs: false,
            unpin: false,
            userPinPolicy: false
          }
        }
      }
    };

    console.log('Making request to Pinata API...');
    const response = await fetch('https://api.pinata.cloud/users/generateApiKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify(keyRestrictions)
    });

    console.log('Pinata API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API error:', errorText);
      
      // Check if it's an authorization issue
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Invalid or expired Pinata JWT. Please check your API key permissions.' },
          { status: 401 }
        );
      }
      
      throw new Error(`Failed to generate JWT: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Pinata API response:', data);
    
    if (!data.JWT) {
      throw new Error('No JWT returned from Pinata API');
    }
    
    return NextResponse.json({ jwt: data.JWT });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}