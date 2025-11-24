// Utility function to merge CSS class names.
// It filters out falsy values (undefined, false, null) and joins the remaining class names with a space.
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ")
}