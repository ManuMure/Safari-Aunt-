import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";

const NewsletterSchema = z.object({
  email: z.string().email("Invalid email"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = NewsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert rather than reject duplicates — someone resubscribing
    // shouldn't see an error, they should just get a success state.
    await NewsletterSubscriber.findOneAndUpdate(
      { email: parsed.data.email },
      { email: parsed.data.email },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Newsletter signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}