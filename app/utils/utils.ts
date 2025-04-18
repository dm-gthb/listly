export function invariantResponse(
  condition: any,
  message?: string | (() => string),
  responseInit?: ResponseInit,
): asserts condition {
  if (!condition) {
    throw new Response(
      typeof message === 'function' ? message() : message || 'Invariant failed',
      { status: 400, ...responseInit },
    );
  }
}
