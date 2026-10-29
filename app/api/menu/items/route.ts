import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categorySlug, description, imageUrl, kind, variants, tags, dealComponents, modifierGroupNames } = body;

    if (!name || !categorySlug || !variants || variants.length === 0) {
      return NextResponse.json(
        { success: false, message: "Name, category, and at least one size variant with price are required." },
        { status: 400 }
      );
    }

    const created = mockDb.createMenuItem({
      name: name.trim(),
      categorySlug: categorySlug.trim(),
      description: description?.trim() || "",
      imageUrl: imageUrl?.trim() || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
      kind: kind === "DEAL" ? "DEAL" : "SINGLE",
      variants: variants.map((v: { name: string; price: number }) => ({
        name: v.name.trim(),
        price: Number(v.price) || 0,
      })),
      tags: Array.isArray(tags) ? tags : [],
      dealComponents: Array.isArray(dealComponents) ? dealComponents : [],
      modifierGroupNames: Array.isArray(modifierGroupNames) ? modifierGroupNames : [],
      isAvailable: true,
    });

    return NextResponse.json({
      success: true,
      item: created,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

