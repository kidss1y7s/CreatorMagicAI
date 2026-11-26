CREATORMAGIC AI — PAYMENT PAGE UPDATE FOR DEPLOYED WORKER 4.1

WHAT IS INCLUDED
- index.html: unchanged existing website page
- style.css: unchanged existing styles
- script.js: updated existing frontend script with login, credits, manual UPI payment submission, payment history, and admin payment review UI

IMPORTANT
- This package updates the FRONTEND only. Do not replace or redeploy your Worker for this frontend update.
- The payment UI uses the deployed Worker 4.1 routes:
  GET  /api/payments/packages
  GET  /api/payments/history
  POST /api/payments/upi/submit
  GET  /api/admin/payments?status=pending
  POST /api/admin/payments/approve
  POST /api/admin/payments/reject
- Login token remains in localStorage under cm_auth_token, matching the existing frontend login system.
- The UPI ID is read from the public packages API response (fallback: tejashi@ybl).
- Customer payment submission creates a Pending payment record only after the customer enters a UTR. Credits are not granted by the customer-facing page.
- The customer must complete the actual UPI payment first, then enter the UTR.

FRONTEND DEPLOYMENT
1. Download and extract this ZIP.
2. Back up your existing website script.js.
3. Replace ONLY script.js in your existing GitHub Pages website repository with this package's script.js.
4. Do not change index.html or style.css; they are included unchanged for reference.
5. Commit and push the update using your existing GitHub Pages workflow.
6. Open the published website, refresh it, and tap Login / Credits.
7. Log in using email OTP, select Buy Credits, select a package, open your UPI app, complete payment, then submit the UTR.
8. Check Payment History; the submitted payment should show Pending.

ADMIN REVIEW
- The admin UI is shown only when logged in with kidss1y7s@gmail.com.
- Enter the ADMIN_SECRET configured in Cloudflare Worker settings when opening Admin Payment Review.
- The secret is kept in page memory only and is not embedded in script.js or saved to localStorage.
- Verify the payment in your bank/UPI app before approving. Never approve from a screenshot or customer claim alone.
- Approval calls the Worker endpoint, which adds credits on the server. Do not manually edit customer credits.

TESTING NOTES
- JavaScript syntax checked with node --check.
- The package was assembled from the saved CreatorMagic AI Version 5 frontend baseline and matched to the uploaded/deployed Worker 4.1 payment routes.
- No Worker, D1 database, customer record, or payment record was changed while preparing this frontend package.
