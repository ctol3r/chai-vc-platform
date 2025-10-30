export function isValidNPI(npi: string): boolean {
  if (!/^[12]\d{9}$/.test(npi)) return false;

  const payload = "80840" + npi.slice(0, 9);
  let sum = 0;

  for (let index = 0; index < payload.length; index += 1) {
    let digit = parseInt(payload[payload.length - 1 - index], 10);

    if (Number.isNaN(digit)) {
      return false;
    }

    if (index % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(npi[9]);
}

