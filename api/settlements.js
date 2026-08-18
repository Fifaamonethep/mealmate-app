// Server-side implementation of the Two-Pointer Greedy Algorithm
// This ensures that the math is done securely on the backend.

export default function handler(req, res) {
  // Add CORS headers for Vercel if needed, though index.js might handle it if routed through there.
  // Actually, Vercel maps /api/* to individual serverless functions if exported this way.
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { expenses } = req.body;

  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty expenses array provided.' });
  }

  try {
    let totalPaid = 0;
    let totalCost = 0;

    const creditors = [];
    const debtors = [];

    // Step 1: Calculate Net Balance
    for (const exp of expenses) {
      totalPaid += exp.paid;
      totalCost += exp.actualCost;

      const net = exp.paid - exp.actualCost;

      if (net > 1e-9) {
        creditors.push({ userId: exp.userId, balance: net });
      } else if (net < -1e-9) {
        debtors.push({ userId: exp.userId, balance: Math.abs(net) });
      }
    }

    if (Math.abs(totalPaid - totalCost) > 1e-9) {
      return res.status(400).json({ error: "Total paid does not match total actual cost." });
    }

    // Sort descending
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);

    const transactions = [];
    let i = 0; 
    let j = 0; 

    // Two-pointer matching
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settlementAmount = Math.min(debtor.balance, creditor.balance);
      const roundedAmount = Math.round(settlementAmount * 100) / 100;

      if (roundedAmount > 0) {
        transactions.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: roundedAmount,
        });
      }

      debtor.balance -= settlementAmount;
      creditor.balance -= settlementAmount;

      if (debtor.balance < 1e-9) i++;
      if (creditor.balance < 1e-9) j++;
    }

    // Return the calculated transactions
    return res.status(200).json({ transactions });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error calculating settlements.' });
  }
}
