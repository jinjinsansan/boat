import { NextResponse } from "next/server";
import {
  runBoatEngine,
  type BoatParticipantInput,
  type BoatRaceContext,
} from "@/lib/boatEngine";

export const runtime = "nodejs";

interface EngineRequestBody {
  raceId?: string;
  raceDate?: string;
  venue?: string;
  grade?: string;
  weather?: string;
  waterCondition?: string;
  participants?: BoatParticipantInput[];
}

function isParticipant(value: unknown): value is BoatParticipantInput {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" ||
    typeof candidate.registerNumber === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EngineRequestBody;
    console.log("[boat-dlogic] request body", body);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (!body.raceId || typeof body.raceId !== "string") {
      return NextResponse.json(
        { error: "raceId is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { error: "participants must be a non-empty array" },
        { status: 400 },
      );
    }

    const participants = body.participants.filter(isParticipant);
    if (participants.length === 0) {
      return NextResponse.json(
        { error: "participants must include at least one valid entry" },
        { status: 400 },
      );
    }

    const context: BoatRaceContext = {
      raceId: body.raceId,
      raceDate: body.raceDate,
      venue: body.venue,
      grade: body.grade,
      weather: body.weather,
      waterCondition: body.waterCondition,
    };

    const response = await runBoatEngine({
      context,
      participants,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[boat-dlogic] Engine error", error);
    return NextResponse.json(
      { error: "Failed to execute boat engine", details: `${error}` },
      { status: 500 },
    );
  }
}
