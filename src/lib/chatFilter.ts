// Chat filter to prevent off-platform payment negotiations

const BLOCKED_PATTERNS = [
  // Phone numbers (BR format)
  /\b\d{2}\s?\d{4,5}[-\s]?\d{4}\b/,
  /\(\d{2}\)\s?\d{4,5}[-\s]?\d{4}/,
  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  // Keywords
  /whatsapp/i,
  /wpp/i,
  /zap/i,
  /por\s+fora/i,
  /pix\s+direto/i,
  /paga\s+direto/i,
  /fora\s+da\s+plataforma/i,
  /fora\s+do\s+app/i,
  /meu\s+n[uú]mero/i,
  /meu\s+tel/i,
  /liga\s+pra\s+mim/i,
  /me\s+chama\s+no/i,
];

export const containsBlockedContent = (message: string): boolean => {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(message));
};

export const getFilterWarning = (): string => {
  return "⚠️ Mensagem bloqueada: Para sua segurança, não é permitido compartilhar dados de contato ou negociar pagamentos fora da plataforma.";
};

export const maskContactInfo = (text: string): string => {
  let masked = text;
  // Mask phone numbers
  masked = masked.replace(/\b\d{2}\s?\d{4,5}[-\s]?\d{4}\b/g, "***-****");
  masked = masked.replace(/\(\d{2}\)\s?\d{4,5}[-\s]?\d{4}/g, "(XX) ***-****");
  // Mask emails
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "***@***.***");
  return masked;
};
