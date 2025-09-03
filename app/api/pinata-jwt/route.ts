import { NextResponse } from 'next/server';

export async function POST() {
  try {
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

    const response = await fetch('https://api.pinata.cloud/users/generateApiKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify(keyRestrictions)
    });

    if (!response.ok) {
      throw new Error('Failed to generate JWT');
    }

    const data = await response.json();
    return NextResponse.json({ jwt: data.JWT });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}