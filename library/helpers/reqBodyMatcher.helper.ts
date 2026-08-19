export type BodyMatcher = (body: unknown) => boolean;

/**
 * Creates a body matcher that checks if the request body contains
 * all the specified key-value pairs — ignores any extra fields.
 *
 * @example
 * containsFilters({ is_rental: 'false', page: '1' })
 * // matches { page: '1', between: 'price,1,100', is_rental: 'false' }
 * // ignores the 'between' field since it wasn't specified
 */
export function containsFilters(expected: Record<string, string>): BodyMatcher {
  return (body: unknown) => {
    if (typeof body !== 'object' || body === null) return false;

    const b = body as Record<string, string>;

    return Object.entries(expected).every(([key, value]) => b[key] === value);
  };
}
