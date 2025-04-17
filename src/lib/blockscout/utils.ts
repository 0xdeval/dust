export function formatBalance(value: bigint, decimals: number): number {
  if (decimals < 0 || decimals > 30) {
    throw new Error("Invalid decimals value: must be between 0 and 30");
  }
  if (value < BigInt(0)) {
    throw new Error("Invalid value: must be non-negative");
  }

  if (decimals === 0 || value === BigInt(0)) {
    return Number(value);
  }

  try {
    let divisor = BigInt(1);
    for (let i = 0; i < decimals; i++) {
      divisor *= BigInt(10);
    }

    const integerPart = value / divisor;
    const fractionalPart = value % divisor;

    const fullNumber = Number(integerPart) + Number(fractionalPart) / Number(divisor);

    return fullNumber;
  } catch (error) {
    console.error("Error formatting balance:", error);
    return 0;
  }
}
