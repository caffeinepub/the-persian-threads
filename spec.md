# The Persian Threads

## Current State
Full-stack app with React frontend and Motoko backend. Products have id, name, description, price, category but no image field. No admin panel to manage products.

## Requested Changes (Diff)

### Add
- image field (Text) to Product type in backend
- updateProduct, deleteProduct, getAllProducts methods in backend
- Contact info storage (phone, email, address) in backend
- Admin panel at /admin in frontend with product CRUD and contact info management

### Modify
- useProducts to use getAllProducts and use backend-stored image
- Product enrichment to use backend image field

### Remove
- Hardcoded PRODUCT_IMAGES map

## Implementation Plan
1. Update main.mo with image field, CRUD methods, contact info storage
2. Update backend.d.ts
3. Update useQueries.ts with new mutation hooks
4. Add AdminPanel.tsx component
5. Add /admin route in App.tsx
