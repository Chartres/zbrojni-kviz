# Offer to 10 instructors and clubs — drafts for Pavol (test C)

Drafts only. **Nothing here has been sent.** Pavol picks the 10 recipients, fills in the names
outside this public repo, and sends the messages himself.

## What is offered

Free, no accounts: an instructor opens `https://zbrojnikviz.dravec.org/instruktor/`, creates a
class code, and gives learners a link. Learners practise in the app and press "Poslat
instruktorovi"; the instructor sees, on their own phone, each learner's readiness per part of the
test, the estimated chance to pass (26/30 and 28/30) and recent mock exams. The summaries travel
in the link itself and stay on the instructor's device; we see only that a class was made and how
many summaries were sent (anonymous counts).

## Recipients and tracking

Each recipient gets their own link with a `ref`, so the classes they create can be counted. Keep
the filled-in list (names, contacts) **outside this repo**.

| ref | kind | link to put in the message |
|---|---|---|
| k01 | individual instructor | https://zbrojnikviz.dravec.org/instruktor/?ref=k01 |
| k02 | individual instructor | https://zbrojnikviz.dravec.org/instruktor/?ref=k02 |
| k03 | individual instructor | https://zbrojnikviz.dravec.org/instruktor/?ref=k03 |
| k04 | individual instructor | https://zbrojnikviz.dravec.org/instruktor/?ref=k04 |
| k05 | shooting club (SSK / sport club) | https://zbrojnikviz.dravec.org/instruktor/?ref=k05 |
| k06 | shooting club | https://zbrojnikviz.dravec.org/instruktor/?ref=k06 |
| k07 | shooting club | https://zbrojnikviz.dravec.org/instruktor/?ref=k07 |
| k08 | range running licence courses | https://zbrojnikviz.dravec.org/instruktor/?ref=k08 |
| k09 | range running licence courses | https://zbrojnikviz.dravec.org/instruktor/?ref=k09 |
| k10 | range running licence courses | https://zbrojnikviz.dravec.org/instruktor/?ref=k10 |

Which message: `offer-instructor.md` for a person, `offer-club.md` for a club or range, and
`offer-short.md` where only a short message fits (a contact form, a social-media message).

## How the test is read (stop rule, PRD §5.4)

- Start: the day Pavol sends the offers. End: 14 days later.
- A recipient "brings" a learner when one of their classes (`key_action` `class_create` with their
  `ref`) gets a distinct learner joining (`class_join`) or sending (`class_send`) under its code.
- **Stop** if fewer than 2 of the 10 bring 5 or more learners within the 14 days.
- Note: events from a class the instructor took over on a second device carry no `ref`; count
  them by class code.
