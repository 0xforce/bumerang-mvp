/**
 * Typed shim around zodResolver to bridge the internal type incompatibility
 * between Zod v4.3+ and @hookform/resolvers@5 (built against v4.0).
 * The resolver works correctly at runtime — this is purely a type-level fix.
 */
import { zodResolver as _zodResolver } from "@hookform/resolvers/zod"
import type { ZodType } from "zod"
import type { Resolver, FieldValues } from "react-hook-form"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodResolver<T extends FieldValues>(schema: ZodType<T, any>): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _zodResolver(schema as any) as Resolver<T>
}
