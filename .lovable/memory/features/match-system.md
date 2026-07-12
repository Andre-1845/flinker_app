---
name: Real Match System
description: Worker swipe creates gig_match record and notifies company via create_notification RPC
type: feature
---
- Worker swipes right → INSERT into gig_matches (worker_accepted=true, status='matched')
- Company is notified via create_notification() security definer function
- GigFeed fetches real gigs from DB (published, future, not already matched)
- Dismissed gigs tracked in localStorage to avoid re-showing
- Match score calculated via get_match_score() RPC
- notifications table with realtime enabled for instant delivery
- SwipeableGigCard accepts GigData interface (id, title, company_name, etc.)
