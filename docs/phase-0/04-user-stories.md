# Document 4 — User Stories

## Format

```
As a [role]
I want to [action]
So that [benefit]
```

Stories are grouped by epic. Priority: **P0** MVP | **P1** Should | **P2** Later

---

## Epic 1: Landing & Discovery

### US-1.1 (P0)
As a **visitor**  
I want to see what InkEcho is and how to play  
So that I understand the game before joining.

### US-1.2 (P0)
As a **visitor**  
I want to create a room with one click  
So that I can start playing immediately.

### US-1.3 (P0)
As a **visitor**  
I want to join a room with a short code  
So that I can play with friends quickly.

### US-1.4 (P1)
As a **visitor**  
I want to browse public rooms  
So that I can join an open game without an invite.

### US-1.5 (P1)
As a **visitor**  
I want to toggle dark/light theme  
So that the app matches my preference.

---

## Epic 2: Authentication

### US-2.1 (P0)
As a **guest player**  
I want to enter a display name without signing up  
So that I can play with minimal friction.

### US-2.2 (P0)
As a **guest player**  
I want my session to persist on reconnect  
So that I don't lose my seat if my connection drops.

### US-2.3 (P0)
As a **registered user**  
I want to sign up with email or OAuth  
So that my progress is saved.

### US-2.4 (P0)
As a **registered user**  
I want to log in and stay logged in  
So that I don't re-authenticate every visit.

### US-2.5 (P0)
As a **registered user**  
I want to log out  
So that others can't use my account on a shared device.

### US-2.6 (P1)
As a **registered user**  
I want to update my profile name and avatar  
So that friends recognize me in rooms.

### US-2.7 (P2)
As a **guest player**  
I want to convert my guest session to an account  
So that stats from this session are preserved.

---

## Epic 3: Room Creation & Configuration

### US-3.1 (P0)
As a **host**  
I want to create a private room with a shareable link  
So that only invited friends can join.

### US-3.2 (P0)
As a **host**  
I want to create a public room  
So that strangers can join for a quick game.

### US-3.3 (P0)
As a **host**  
I want to set max players and round count  
So that the game fits our group size and time.

### US-3.4 (P0)
As a **host**  
I want to set describe and draw timer durations  
So that rounds move at our preferred pace.

### US-3.5 (P1)
As a **host**  
I want to enable a profanity filter  
So that descriptions stay family-friendly.

### US-3.6 (P1)
As a **host**  
I want to copy an invite link to clipboard  
So that sharing is effortless.

### US-3.7 (P1)
As a **host**  
I want to transfer host role to another player  
So that I can leave without closing the room.

---

## Epic 4: Lobby

### US-4.1 (P0)
As a **player**  
I want to join a room and see who is in the lobby  
So that I know the group is ready.

### US-4.2 (P0)
As a **player**  
I want to mark myself as ready  
So that the host knows I'm prepared to start.

### US-4.3 (P0)
As a **host**  
I want to start the game when enough players are ready  
So that we don't wait for AFK players.

### US-4.4 (P0)
As a **host**  
I want to kick a disruptive player  
So that the lobby stays fun.

### US-4.5 (P0)
As a **player**  
I want to leave a room  
So that I'm not stuck if I need to go.

### US-4.6 (P0)
As a **player**  
I want realtime updates when others join or leave  
So that the lobby always reflects current players.

### US-4.7 (P0)
As a **player joining mid-game**  
I want to enter as a spectator  
So that I can still watch without breaking the game.

### US-4.8 (P1)
As a **player**  
I want to see connection status of other players  
So that I know who might disconnect.

---

## Epic 5: Describe Turn

### US-5.1 (P0)
As a **player on a describe turn**  
I want to see the drawing I'm describing  
So that I can write an accurate description.

### US-5.2 (P0)
As a **player on a describe turn**  
I want to type a description with a character limit  
So that answers stay concise and fair.

### US-5.3 (P0)
As a **player on a describe turn**  
I want to see a countdown timer  
So that I know how much time I have left.

### US-5.4 (P0)
As a **player on a describe turn**  
I want to submit my description  
So that the next player can draw it.

### US-5.5 (P0)
As a **player on a describe turn**  
I want my description auto-submitted when time runs out  
So that the game doesn't stall.

### US-5.6 (P0)
As a **player waiting**  
I want to see whose turn it is  
So that I know when to pay attention.

### US-5.7 (P1)
As a **player on first describe turn**  
I want to receive a random starter prompt  
So that every chain begins with something fun.

---

## Epic 6: Draw Turn

### US-6.1 (P0)
As a **player on a draw turn**  
I want to see the text I'm drawing  
So that I know what to illustrate.

### US-6.2 (P0)
As a **player on a draw turn**  
I want a responsive drawing canvas  
So that I can sketch quickly on desktop or mobile.

### US-6.3 (P0)
As a **player on a draw turn**  
I want brush size, color, and eraser tools  
So that I can express the idea clearly.

### US-6.4 (P0)
As a **player on a draw turn**  
I want undo and redo  
So that I can fix mistakes.

### US-6.5 (P0)
As a **player on a draw turn**  
I want to submit my drawing  
So that the chain continues.

### US-6.6 (P0)
As a **mobile player**  
I want touch drawing with palm rejection  
So that drawing feels natural on a phone.

### US-6.7 (P1)
As a **player on a draw turn**  
I want my draft saved locally  
So that a accidental refresh doesn't wipe my work.

### US-6.8 (P1)
As a **player with a stylus**  
I want pressure-sensitive strokes  
So that drawing feels more natural.

---

## Epic 7: Game Flow & Reveal

### US-7.1 (P0)
As a **player**  
I want the game to advance automatically after each submit  
So that I don't wait for manual host intervention.

### US-7.2 (P0)
As a **player**  
I want disconnected players skipped after a grace period  
So that one bad connection doesn't kill the game.

### US-7.3 (P0)
As a **player**  
I want to watch the full chain revealed at the end  
So that we can laugh at how the prompt evolved.

### US-7.4 (P0)
As a **host**  
I want to return to the lobby for a rematch  
So that we can play again without re-creating the room.

### US-7.5 (P1)
As a **player**  
I want to vote for the funniest chain  
So that we have a winner each round set.

### US-7.6 (P1)
As a **host**  
I want to pause the game  
So that we can take a break mid-round.

### US-7.7 (P2)
As a **player**  
I want to share a link to the reveal summary  
So that I can post it to social media.

---

## Epic 8: Spectator

### US-8.1 (P0)
As a **spectator**  
I want to watch the game progress in realtime  
So that I can enjoy without playing.

### US-8.2 (P0)
As a **spectator**  
I want to see the reveal with players  
So that I don't miss the payoff.

### US-8.3 (P1)
As a **spectator**  
I want to see how many others are watching  
So that the room feels alive.

---

## Epic 9: Reconnect & Resilience

### US-9.1 (P0)
As a **player**  
I want to reconnect after a network drop  
So that I rejoin the same room and role.

### US-9.2 (P0)
As a **player reconnecting mid-turn**  
I want to see my remaining time and restored state  
So that I can continue my turn fairly.

### US-9.3 (P0)
As a **player**  
I want a clear "reconnecting…" indicator  
So that I know the app is working.

### US-9.4 (P1)
As a **player**  
I want the tab title to alert me on my turn  
So that I notice when multitasking.

---

## Epic 10: Profile & History

### US-10.1 (P1)
As a **registered user**  
I want to view my game history  
So that I can revisit past sessions.

### US-10.2 (P1)
As a **registered user**  
I want to see stats like games played and wins  
So that I can track my progress.

### US-10.3 (P2)
As a **registered user**  
I want to earn achievements and badges  
So that I have goals beyond single sessions.

### US-10.4 (P2)
As a **registered user**  
I want to view a specific past chain replay  
So that I can relive funny moments.

---

## Epic 11: Admin & Moderation

### US-11.1 (P1)
As a **player**  
I want to report offensive content  
So that moderators can take action.

### US-11.2 (P1)
As an **admin**  
I want to review reported content  
So that I can ban abusive users.

### US-11.3 (P1)
As an **admin**  
I want to temporarily or permanently ban users  
So that repeat offenders are removed.

### US-11.4 (P2)
As an **admin**  
I want an analytics dashboard  
So that I can monitor growth and retention.

---

## Epic 12: System & Developer

### US-12.1 (P0)
As a **developer**  
I want structured logs with correlation IDs  
So that I can debug production issues.

### US-12.2 (P0)
As a **developer**  
I want errors captured in Sentry  
So that regressions are caught quickly.

### US-12.3 (P0)
As a **player**  
I want friendly error messages  
So that failures don't feel broken.

---

## Story Map Summary

| Epic | P0 Stories | P1 Stories | P2 Stories |
|------|------------|------------|------------|
| Landing | 3 | 2 | 0 |
| Auth | 4 | 1 | 1 |
| Rooms | 4 | 3 | 0 |
| Lobby | 6 | 1 | 0 |
| Describe | 5 | 1 | 0 |
| Draw | 5 | 2 | 0 |
| Game/Reveal | 4 | 2 | 1 |
| Spectator | 2 | 1 | 0 |
| Reconnect | 3 | 1 | 0 |
| Profile | 0 | 2 | 2 |
| Admin | 0 | 3 | 1 |
| System | 3 | 0 | 0 |
| **Total** | **39** | **19** | **5** |
