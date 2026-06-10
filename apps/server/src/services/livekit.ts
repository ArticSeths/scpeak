import { AccessToken } from "livekit-server-sdk";

interface TokenOptions {
  canPublish?: boolean;
}

export async function generateLiveKitToken(
  userId: string,
  username: string,
  roomName: string,
  options?: TokenOptions
): Promise<string> {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: userId,
      name: username,
    }
  );

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: options?.canPublish ?? true,
    canSubscribe: true,
  });

  return await token.toJwt();
}
