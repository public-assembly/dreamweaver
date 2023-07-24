import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTransactions() {
    const transactions = await prisma.transaction.findMany();
    return transactions;
  }
  