# Fix: Product images — not displaying + edit-mode upload doesn't persist

## UPDATE 2 (remaining: list pages show no thumbnail)

After the CORP fix, the **product detail page** and the **in-form preview** now show images. Still broken: the **public product list** and the **admin product list**, which render `product.thumbnail`.

**Verified via live API:** `GET /api/v1/products` returns `thumbnail: null` (and `price_range: {0,0}`, `total_stock: 0`) for a product whose detail payload clearly has an image with `is_thumbnail: true`. So the data is fine — the list query isn't surfacing it.

**Root cause:** [product.repository.ts `findAll`](backend/src/modules/products/product.repository.ts#L33-L52) adds `thumbnail`, `min_price`, `max_price`, `total_stock`, `variants_count`, `has_discount` via `addSelect(expr, alias)` (raw column aliases), then calls `getManyAndCount()` and reads them off the **entities** ([map at L122-151](backend/src/modules/products/product.repository.ts#L122-L151)). TypeORM does **not** map custom `addSelect` aliases onto entities — so every one of those fields is `undefined` → coerced to `null`/`0`/`false`. The new image feature simply made the missing `thumbnail` visible; `price`/`stock`/`discount` in the list are silently broken by the same mechanism. The same pattern exists in [`findRelated`](backend/src/modules/products/product.repository.ts#L204-L223).

**Fix:** read the raw aliases via `getRawAndEntities()` (raw rows are index-aligned with entities because `groupBy product.id` yields one row per product), and compute `total` via `getCount()`.

### Change 1 — `findAll` ([product.repository.ts](backend/src/modules/products/product.repository.ts#L116-L154))

Replace the `getManyAndCount()` block + `data.map(...)` with:

```ts
    qb.skip((page - 1) * limit);
    qb.take(limit);

    // The thumbnail/aggregate columns are added via addSelect with custom
    // aliases, which getMany()/getManyAndCount() do NOT map onto entities.
    // Read them from the aligned raw rows (one row per product via groupBy).
    const total = await qb.getCount();
    const { entities, raw } = await qb.getRawAndEntities();

    return {
      data: entities.map((p: any, i: number) => {
        const r: any = raw[i] ?? {};
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          short_description: p.short_description,
          category: p.category
            ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
            : null,
          brand: p.brand
            ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug, logo: p.brand.logo }
            : null,
          thumbnail: r.thumbnail ?? null,
          price_range: {
            min: parseFloat(r.min_price) || 0,
            max: parseFloat(r.max_price) || 0,
          },
          total_stock: parseInt(r.total_stock) || 0,
          variants_count: parseInt(r.variants_count) || 0,
          has_discount: r.has_discount === true || r.has_discount === "t",
          avg_rating: 0,
          reviews_count: 0,
          is_active: p.is_active,
          is_public: p.is_public,
          created_at: p.created_at,
        };
      }),
      total,
    };
```

### Change 2 — `findRelated` ([product.repository.ts](backend/src/modules/products/product.repository.ts#L208-L223))

Replace the trailing `.getMany()` with raw-aware mapping so related cards get a thumbnail:

```ts
    const { entities, raw } = await qb.getRawAndEntities();
    return entities.map((p: any, i: number) => ({
      ...p,
      thumbnail: raw[i]?.thumbnail ?? null,
    }));
```

(assign the builder chain up to `.take(limit)` to `const qb` first). The backend dev container hot-reloads, so this applies on save.

> Note: `getFilters` brand `count` has the same latent alias bug, but it's unrelated to image display — leaving it out of scope.

---

## UPDATE (the real display blocker)

Symptom narrowed: **no surface shows the image** — not the in-form preview (a plain `<img>` the browser loads directly), not the admin list, not the product page/detail. Investigation found:
- S3 is **disabled** (`backend/.env` has no `S3_BUCKET`), so disk storage + static serving are active.
- Uploaded files **do exist** on disk (`backend/uploads/` contains them, incl. the exact file from the original error) and the returned URL is correct.
- Therefore the upload pipeline works; the browser is being **blocked from rendering** the cross-origin image.

**Root cause:** [backend/src/app.ts:45](backend/src/app.ts#L45) uses `helmet(...)`, whose default **`Cross-Origin-Resource-Policy: same-origin`** header is applied to every response, including `/uploads/*`. The frontend origin (`http://localhost:3000`) embedding an image from the backend origin (`http://localhost:5000`) is a cross-origin resource load, which CORP `same-origin` blocks — so the browser refuses to display it everywhere. This is independent of `next/image` (it affects plain `<img>` too), which is why the earlier fixes didn't help.

**Fix (the key remaining change):** Set `Cross-Origin-Resource-Policy: cross-origin` for the `/uploads` static route only, so locally-served upload images can be embedded by the frontend, while keeping the default protection for all other routes.

In [backend/src/app.ts](backend/src/app.ts#L74-L77), update the static block:

```ts
// Serve local uploads in non-S3 mode. Override Helmet's default
// Cross-Origin-Resource-Policy (same-origin) so the frontend on a different
// origin (:3000) can embed these images served from the API origin (:5000).
if (!env.s3.enabled) {
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(path.resolve(env.upload.path)),
  );
}
```

The backend dev container hot-reloads (`./backend/src` is mounted), so this applies on save. The previously-applied changes below (next.config `unoptimized` in dev, docker mount, update-persist images) remain valid and complementary.

---

## Context

The app runs in Docker (`docker-compose.dev.yml`). After adding a product with an uploaded image, two problems remain:

1. **Image does not display** on the product list/detail pages.
2. **Image upload "doesn't exist" / doesn't work on the update (edit) product page** — uploaded images are not saved when editing.

### Root cause — Issue 1 (display)

The backend stores an **absolute** URL ([backend/src/modules/uploads/upload.routes.ts:31-33](backend/src/modules/uploads/upload.routes.ts#L31-L33)): `http://localhost:5000/uploads/<file>.jpg`.

`next/image` (used by [ProductCard.tsx:23-29](frontend/src/modules/products/components/ProductCard.tsx#L23-L29) and the product detail `ProductPageClient.tsx`) **optimizes images server-side inside the frontend container**. There, `localhost:5000` is the frontend container itself — not the backend — so the optimizer's fetch fails and the image breaks. (Plain `<img>` usages, e.g. the admin list and the edit-form preview, work because the *browser* fetches `localhost:5000`, which is port-mapped to the backend.)

Additionally, [frontend/Dockerfile.dev:12](frontend/Dockerfile.dev#L12) **copies** `next.config.ts` at build time and it is **not** volume-mounted, so a prior `remotePatterns` edit to that file never reached the running container without a rebuild.

### Root cause — Issue 2 (edit upload not persisting)

The upload widget IS present in edit mode (the create/edit page is the shared [frontend/src/app/admin/products/[id]/page.tsx](frontend/src/app/admin/products/[id]/page.tsx), Images tab renders for both). But on save in edit mode, images are silently dropped:
- [product.validator.ts:24-35](backend/src/modules/products/product.validator.ts#L24-L35) `updateProductSchema` omits `images`, so Zod strips them from the request body. (The create schema includes `images`; the update schema does not — that asymmetry is the bug.)
- [product.repository.ts:339-351](backend/src/modules/products/product.repository.ts#L339-L351) `update()` only does `Object.assign(product, dto); save()`, which ignores the `images` relation (no cascade) even if it were present.

`create()` ([product.repository.ts:304-315](backend/src/modules/products/product.repository.ts#L304-L315)) already persists images correctly — `update()` must mirror that.

## Approach

### Part A — Make images display in Docker dev (Issue 1)

**1. [frontend/next.config.ts](frontend/next.config.ts)** — disable `next/image` optimization in development so it emits a plain `<img>` whose `src` the browser fetches directly from the port-mapped backend. Keep optimization (and the existing `https`/`**` pattern) for production, where uploads are served over HTTPS (S3).

```ts
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
    ],
  },
};
```

**2. [docker-compose.dev.yml](docker-compose.dev.yml)** — mount `next.config.ts` into the frontend service so future config changes take effect on container **restart** without a full rebuild. Add to the `frontend.volumes` list:

```yaml
      - ./frontend/next.config.ts:/app/next.config.ts
```

### Part B — Persist images when editing a product (Issue 2)

**3. [backend/src/modules/products/product.validator.ts](backend/src/modules/products/product.validator.ts)** — add the same `images` array shape used in `createProductSchema` to `updateProductSchema` so images survive validation.

**4. [backend/src/modules/products/product.repository.ts](backend/src/modules/products/product.repository.ts)** — rewrite `update()` to persist images using a replace strategy inside a transaction, mirroring `create()`. Destructure `images` (and `tag_ids`, which is handled separately via `syncTags`) out before `Object.assign` so non-column props aren't assigned to the entity:

```ts
async update(id: string, dto: UpdateProductDto) {
  const product = await this.repo.findOne({ where: { id, deleted_at: null as any } });
  if (!product) throw new NotFoundError("محصول یافت نشد");

  if (dto.title && dto.title !== product.title) {
    (dto as any).slug = await this.generateUniqueSlug(dto.title, id);
  }

  const { images, tag_ids, ...scalars } = dto as any;

  await AppDataSource.transaction(async (manager) => {
    Object.assign(product, scalars);
    await manager.save(product);

    if (images !== undefined) {
      // Replace the product's images with the submitted set
      await manager.delete(ProductImage, { product_id: id });
      if (images.length) {
        const newImages = images.map((img: any, index: number) =>
          manager.create(ProductImage, {
            product_id: id,
            image_url: img.image_url,
            alt_text: img.alt_text || null,
            is_thumbnail: img.is_thumbnail ?? index === 0,
            sort_order: img.sort_order ?? index,
          }),
        );
        await manager.save(newImages);
      }
    }
  });

  return this.findById(id);
}
```

Notes:
- `ProductImage` and `AppDataSource` are already imported in the repository.
- The frontend already sends `images` in the update payload ([\[id\]/page.tsx onSubmit](frontend/src/app/admin/products/[id]/page.tsx#L211)) and loads existing images in edit mode (`loadProduct`), so no frontend change is needed for Issue 2.

## Verification

1. Apply the `app.ts` CORP fix; backend auto-reloads (`./backend/src` mounted).
2. Quick header check: `curl -I http://localhost:5000/uploads/<existing-file>.jpg` should now return `Cross-Origin-Resource-Policy: cross-origin` (was `same-origin`) and `200 OK`.
3. **Display (the reported bug):** the in-form preview, admin product list, public product list, and product detail all render the uploaded image. (Frontend container should already have the earlier `next.config.ts` `unoptimized` change; if not, restart it.)
4. **Issue 2 (persist on edit):** Edit a product → Images tab → upload/replace → Save → reload: the new image persists and shows everywhere.
5. Sanity-check create flow still works (add a new product with an image).

## Out of scope (optional follow-up)

A more robust long-term design is to store **relative** paths (`/uploads/...`) and either prepend the API host on the client or proxy `/uploads` through a Next.js rewrite. That would let `next/image` optimization work in all environments and avoid baking `localhost:5000` into stored data. Larger refactor; not needed to resolve the reported bugs.
