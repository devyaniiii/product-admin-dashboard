# Product Admin Dashboard

A small admin dashboard to log in and manage products, built against the
free [DummyJSON](https://dummyjson.com) API.

**Live demo:** https://product-admin-dashboard-flax.vercel.app
**Repo:** https://github.com/devyaniiii/product-admin-dashboard

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Axios (all API calls)
- No React Query / SWR / table or pagination libraries — pagination,
  search, filtering, and sorting logic is hand-written.

## Setup

```bash
git clone <your-repo-url>
cd product-admin-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

**Login credentials** (DummyJSON's test user):
- Username: `emilys`
- Password: `emilyspass`

## What's Finished

- [x] Login with DummyJSON `/auth/login`, inline error messages for wrong credentials, double-submit protection
- [x] Protected routes — `/products/*` redirects to `/login` if not authenticated
- [x] Logout button
- [x] Product list: image, title, category, price, rating, stock — table on desktop, cards on mobile
- [x] Pagination: page numbers, Previous/Next, page size (10/20/50), "Showing X–Y of Z" text
- [x] Search with debounce (400ms) and race-condition protection (stale responses are discarded, verified with `&delay=2000`)
- [x] Category filter (`/products/categories`) and sort by price/rating/title
- [x] All of page/search/filter/sort state kept in the URL — refresh/share-safe
- [x] Product details page (`/products/[id]`) with image gallery, description, price, reviews
- [x] Custom 404 page for invalid/nonexistent product ids
- [x] Add/Edit product form with client-side validation
- [x] Delete with confirmation dialog
- [x] Loading, empty, and error (with Retry) states across all data-fetching pages
- [x] Invalid URL query values (`?page=abc`, `?page=999`) handled gracefully
- [x] One shared Axios instance (`lib/axios.ts`) — attaches the auth token to every request via a request interceptor, handles 401s centrally via a response interceptor

## Project Structure

### One problem I faced and how I fixed it
The delete dialog not showing for products with no reviews, because it was accidentally nested inside the reviews' conditional block.
and i fixed it by moving it outside that block so it always renders
