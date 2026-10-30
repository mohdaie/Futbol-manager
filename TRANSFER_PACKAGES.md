# Transfer packages

Paid-player meetings and incoming sale offers expose payment schedules, an optional player exchange with a valuation, a sell-on percentage and a fixed-price buy-back right. Free agents have no selling club; agent fees and signing bonuses still apply upfront.

These negotiation thresholds are **game design rules**, not verified FIFA, Premier League or EFL regulations. Attempts to retrieve FIFA and Premier League material on 23 October 2026 failed at the environment's network proxy (CONNECT 403). No claim of current regulatory verification is made.

| Cash fee | Maximum annual deferred payments | Minimum upfront |
| --- | ---: | ---: |
| Below £1m | 1 | 75% |
| £1m–below £5m | 2 | 50% |
| £5m–below £20m | 2 | 40% |
| £20m or more | 3 | 25% |

A seller with a negative bank balance requires at least 75% upfront and no more than one deferred year. The buyer's outstanding commitments and bank balance can cause an agent to reject payment risk. The selling club discounts deferred cash when judging its offer, so an acceptable schedule does not guarantee acceptance of the price. Rejections explain the issue and let the manager resubmit the package.

An exchange is additional non-cash consideration, not money credited to the buying club's bank or transfer budget. The clubs check valuation (60–120% of the market estimate), squad suitability, capacity and wages. The exchange player's agent can refuse a move to a smaller club; medical checks still apply. The receiving club pays that player's agent fee upfront and offers at least his existing wage or its normal wage for him. Both player moves happen together after validation. A one-for-one exchange is supported between two full 36-player Championship squads.

Sell-on clauses pay a percentage of the **next total sale package**, including an agreed exchange valuation. The payout comes from the selling club when the next permanent transfer completes, even if its cash receipts are deferred. The old clause is consumed; any newly agreed clause names the new former club. Free release ends the old right. The manager may offer up to 50%; an AI buyer will not accept more than 20% when buying from the manager.

A buy-back right names the former club, current holder, fixed price and a one-, two- or three-year expiry. Its agreed price must be at least 125% of market value and 110% of the package; an AI buyer buying from the manager requires at least 150% of market value. Once accepted, the original fixed price is used on activation, even if the player's market value subsequently changes. The holder cannot demand a different club fee, but the player can refuse personal terms or fail a medical, and the usual transfer window and squad capacity still apply. Rights end after expiry or a move to a third club. Managers can activate their rights through the player's profile or Finance; computer clubs can activate their rights when bidding.

## Cash and budgets

Only upfront cash, signing bonuses and agent fees leave the bank at completion. The entire guaranteed cash purchase fee is reserved from transfer budget once; instalments spread bank payments rather than creating extra spending power. Future annual amounts sum exactly to the unpaid fee, with integer rounding corrected in the final payment.

Finance shows outstanding payments owed, amounts due to the club, payments within the next 12 months, scheduled dates and counterparties. Its income/expenditure ledger is a cash ledger. A board-set share of sale cash becomes available in transfer budget when received (`saleReinvest()`: 30% in debt, 40% tight, 50% stable, 65% healthy, 80% wealthy by balance against a year's wage bill; +5 points at board confidence 75+, −10 below 30). From Finance → Sale reinvestment you can ask the board for +10 or +20 more points for the rest of the season (`askBoardReinvest()`): the odds rise with board confidence and the finances, the bigger ask is harder, a refusal can still meet you halfway, a doubting board (confidence under 45) loses 2 points of confidence when it refuses, the agreement is suspended while the club is in debt, and you can ask once every 8 weeks (at most +20 a season). Future payments do not charge a purchase budget a second time. The new-season budget also accounts for the coming year's outstanding obligations.

Payments retain their debtor and creditor club IDs when a manager changes jobs, when a player is sold again or retires, and across save/reload. Legacy season-end instalments retain their original due seasons and acquire a fixed debtor during migration. Mature payments are removed exactly once; future obligations remain until due. Contingent sell-on and buy-back rights appear separately from guaranteed instalment totals.

## Validation

`tests/transfer-packages.cjs` runs actual negotiation stages for Premier League and Championship purchases, sales and buy-backs, checks instalment settlement over future game years, full-squad exchanges, club/agent refusal, stale or changed terms, duplicate completion/payment prevention, legacy debtor migration, durable save/reload and the mobile controls. It also covers manager-name preservation during new-career choices and the tactics First XI list. Run with Playwright and Chromium available:

```sh
NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/transfer-packages.cjs
```
