import type { Category } from 'drizzle/types';

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

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(date));
}

export function getUpdatedSearchParamsString({
  initialSearchParams,
  updates,
}: {
  initialSearchParams: URLSearchParams;
  updates: Record<string, string | number | undefined>;
}) {
  const updatedSearchParams = new URLSearchParams(initialSearchParams);

  for (const [updatesKey, updatesValue] of Object.entries(updates)) {
    if (updatesValue === undefined) {
      updatedSearchParams.delete(updatesKey);
    } else {
      updatedSearchParams.set(updatesKey, String(updatesValue));
    }
  }

  return Array.from(updatedSearchParams.entries())
    .map(([key, value]) => (value ? `${key}=${encodeURIComponent(value)}` : key))
    .join('&');
}

export function getGroupedCategories(categories: Category[]) {
  const parents = categories.filter((category) => !category.parentId);
  const children = categories.filter((category) => category.parentId);
  return parents.map((parent) => ({
    ...parent,
    children: children.filter(({ parentId }) => parentId === parent.id),
  }));
}

export function prefetchImage(src: string | null) {
  if (src) {
    const img = new Image();
    img.src = src;
  }
}
