// utils/slugify.ts
export function generateSlug(title: string) {
  return title
    .trim()
    .replace(/\s+/g, '-') // فاصله‌ها رو با خط تیره جایگزین می‌کنه
    .replace(/[?&/\\#,+()$~%.'":*?<>{}!@^_=]/g, ''); // کاراکترهای غیرمجاز رو حذف می‌کنه
}
