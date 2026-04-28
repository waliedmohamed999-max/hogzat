# Labayh Frontend

واجهة Next.js الحالية لمنصة Labayh / لبية. تعمل كواجهة رئيسية للمنصة ولوحة التحكم الجديدة، مع بقاء Laravel كمصدر بيانات وواجهات API فقط.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Headless UI

## Run

```bash
npm install
npm run dev -- -p 3000
```

الرابط المحلي:

```bash
http://localhost:3000
```

## Integration

- `/` يعمل من Next.js.
- `/dashboard` هو مسار لوحة التحكم الوحيد.
- `/auth/login` و`/auth/sign-up` صفحات Next.js حديثة.
- `/blog` و`/contact-us` صفحات Next.js حديثة.
- `/api/v1/*` يمر إلى Laravel bridge/backend حسب إعدادات `next.config.ts`.

## Build

```bash
npm run build
npm run start
```

## Structure

- `app/`: routes, layouts, server pages, API proxy routes
- `components/`: shared UI, sections, auth, dashboard components
- `lib/`: API clients, platform URLs, presentation helpers

## Notes

- لا تستخدم الواجهة روابط صفحات Laravel القديمة للمستخدم.
- صور Laravel تمر عبر `normalizeAssetUrl` قبل عرضها في Next.
- أي صفحة إدارية جديدة يجب أن تعيش تحت `/dashboard`.
