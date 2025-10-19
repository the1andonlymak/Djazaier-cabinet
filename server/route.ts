import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function GET() {
  try {
    const cases = await prisma.cases.findMany({
      orderBy: { id: "asc" },
    });
    return Response.json({ cases });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Unable to load cases" }, { status: 500 });
  }
}