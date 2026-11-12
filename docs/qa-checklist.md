# Alltech MVP – Human QA Checklist

## Build & Load
- [ ] Dev server boots without warnings
- [ ] No 404s in network tab for route navigations

## Auth & Roles
- [ ] Auth loader shows, then disappears
- [ ] Recruiter cannot open /ceo or /cfo (is redirected)
- [ ] CEO/CFO pages render charts

## Recruiter Board
- [ ] List loads with candidate rows
- [ ] Status change shows success toast and persists after reload

## Client Approvals
- [ ] Cards render with correct statuses
- [ ] Approve/Interview/Reject show success toast and persist after reload

## Knowledge Base & Assistant
- [ ] /kb renders articles, search returns results
- [ ] `?` hotkey opens Assistant overlay anywhere

## UI/UX
- [ ] Staging banner visible in non-prod
- [ ] DataTable search/sort/pagination work
- [ ] 404 page on unknown routes

## Deploy
- [ ] Vercel Preview has env vars set
- [ ] SPA routing works (browser refresh on deep link)
- [ ] No console errors in production
