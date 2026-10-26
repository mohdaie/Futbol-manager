'use strict';
/* ===== newspaper.js =====
   Public news items (box 'news') get a newspaper story on top of their factual title and body:
   n.story = { outlet, occasion, headline, standfirst, img, weight }. The title and body stay as
   they were, because alerts, the managers page and the day feed read them; only the News screen
   shows the story. Each section has its own paper, and each occasion has a set of templates that
   are filled from the facts of the event. A template never adds a fact it was not given. */

const OUTLETS = {
  club: { name: 'The Local End', desk: 'Club report', motto: 'Our town. Our club. Always.', tag: c => `${c.city || 'Local'}'s football newspaper` },
  match: { name: 'The Final Whistle', desk: 'Match report', motto: 'More than a game', tag: () => 'Matches · analysis · reaction' },
  transfer: { name: 'The Transfer Record', desk: 'Transfer desk', motto: 'People move football forward', tag: () => 'Transfers · contracts · insight' },
  life: { name: 'Beyond the Touchline', desk: 'People & community', motto: 'People · community · opportunity', tag: () => 'Stories from off the pitch' },
  league: { name: 'The League Gazette', desk: 'League report', motto: 'Same rivalries. New stories.', tag: () => 'Fixtures · tables · opinion' },
};
const SECTION_NAMES = { club: 'Your club', match: 'Matches', transfer: 'Transfers', life: 'Off the pitch', league: 'League' };

// Photos in public/assets/news, by occasion. Several per occasion where they fit; the last one used is skipped.
const NEWS_IMAGES = {
  'win': ['match-header-goal', 'match-late-winner', 'club-fans-celebrate', 'match-penalty'], 'win-late': ['match-late-winner', 'club-fans-celebrate'],
  'win-brace': ['match-header-goal', 'match-late-winner', 'match-penalty'], 'win-hattrick': ['match-header-goal', 'club-fans-celebrate'],
  'win-big': ['match-late-winner', 'club-matchday-gates', 'club-fans-celebrate'], 'derby-win': ['match-derby', 'club-fans-celebrate'],
  'derby-draw': ['match-derby', 'match-draw'], 'derby-loss': ['match-derby'],
  'draw': ['match-draw', 'match-header-goal', 'match-save', 'match-manager-touchline'], 'draw-late': ['match-late-winner', 'match-penalty', 'match-draw'],
  'draw-goalless': ['club-matchday-gates', 'match-save', 'match-draw'],
  'loss': ['match-heavy-defeat', 'match-manager-touchline', 'match-save'], 'loss-late': ['match-heavy-defeat', 'match-manager-touchline'],
  'loss-heavy': ['match-heavy-defeat', 'league-relegation'], 'friendly': ['club-training', 'club-academy'],
  'signing': ['transfer-shirt', 'transfer-medical', 'club-contract', 'transfer-agent-phone'], 'signing-big': ['transfer-shirt', 'transfer-medical', 'transfer-agent-phone'],
  'signing-record': ['transfer-shirt', 'transfer-agent-phone'], 'signing-free': ['transfer-shirt', 'transfer-airport', 'club-contract'],
  'signing-abroad': ['transfer-airport', 'transfer-medical', 'transfer-agent-phone'], 'your-signing': ['transfer-shirt', 'transfer-medical', 'club-contract'],
  'sale': ['transfer-farewell', 'transfer-airport'], 'loan': ['transfer-loan', 'transfer-airport'], 'loan-return': ['transfer-loan', 'transfer-airport'],
  'loan-permanent': ['transfer-shirt', 'club-contract'], 'deadline': ['transfer-deadline', 'transfer-agent-phone'], 'window-shut': ['transfer-deadline'],
  'potm': ['league-award', 'league-trophy'], 'manager-month': ['league-award', 'match-manager-touchline'], 'sacked': ['league-sacked', 'club-boardroom'],
  'appointed': ['club-new-manager', 'club-boardroom', 'match-manager-touchline'], 'season-start': ['league-season-start', 'club-matchday-gates'],
  'playoffs': ['league-promotion', 'league-trophy'], 'retirements': ['league-retirement'],
  'youth-intake': ['club-academy', 'club-training'], 'new-contract': ['club-contract', 'club-matchday-gates'], 'released': ['transfer-farewell', 'league-retirement'],
  'takes-over': ['club-new-manager', 'match-manager-touchline'],
};


/* Templates: [headline, standfirst, need]. {x} is a fact from the event; a template whose facts are
   missing is skipped, and need lists facts a template requires without printing them (such as
   'away'). Headlines drop "the" before nicknames, as papers do: "Gunners edge Villans"; in the
   standfirst, club names come with their article ("against the Villans"). */
const STORY_TEMPLATES = {
  'win': [
    ['{us} see off {opp}', 'A {score} win, with {scorers} on the scoresheet.'], ['{us} get the job done', '{score} against {opp}. {motm} was the pick of the players.'],
    ['Three points for {us}', '{opp} beaten {score} on a solid afternoon\'s work.'], ['{us} too good for {opp}', 'A {score} win that rarely looked in doubt.'],
    ['{scorer} the difference for {us}', 'The {score} win over {opp} keeps the momentum going.'], ['Job done for {us}', '{score} against {opp}, with {scorers} on target.'],
    ['Smiles all round for {us}', 'A {score} win over {opp}, sealed by {scorers}.'], ['{us} take the points', '{scorers} on target in a {score} win over {opp}.'],
    ['{opp} undone by {us}', '{scorers} make the difference in a {score} win.'], ['{motm} inspires {us}', 'The player of the match drives a {score} win over {opp}.'],
    ['A good day at the office', '{us} beat {opp} {score}, with {motm} the standout.'], ['{scorer} settles it', 'His goal is enough to beat {opp} {score}.'],
    ['{us} make it {wins} in a row', 'Another win, {score} against {opp}.'], ['The winning run goes on', '{us} beat {opp} {score} for {wins} wins in a row.'],
    ['{us} stay top', 'A {score} win over {opp} keeps them at the summit.', 'top'], ['Top-four push goes on', '{us} beat {opp} {score} and sit {pos}.', 'topFour'],
    ['{us} win to sit {pos}', 'A {score} win over {opp}, with {scorers} on target.'], ['Relief for {us}', 'A {score} win over {opp} ends a run of {slump} games without a win.'],
    ['The drought is over', '{us} beat {opp} {score} after {slump} games without a win.'], ['{us} march on', 'A {score} win over {opp} stretches the unbeaten run to {unbeaten} games.'],
    ['Fortress {ground}', '{opp} are beaten {score} in front of {att}.'], ['{us} delight the home crowd', '{att} see a {score} win over {opp}.', 'home'],
    ['Away-day joy for {us}', 'A {score} win on the road at {opp}.', 'away'], ['{us} win on the road', '{opp} beaten {score} on their own patch.', 'away'],
    ['{us} topple {opp}', 'A {score} win over one of the league\'s top four.', 'oppTop'], ['Survival boost for {us}', 'A {score} win over {opp} gives them hope at the bottom.', 'bottom'],
    ['{scorer} strikes again', 'His goal beats {opp} {score}, and that is {tally} for the season.'],
    ['{us} beat {opp}', 'A {score} win, with {motm} the pick of the players.'], ['{us} pick off {opp}', '{scorers} on target in a {score} win.'],
    ['{us} see it through', 'A {score} win over {opp}, with {scorers} on the scoresheet.'], ['{us} hold off {opp}', 'A {score} win, with {motm} outstanding.'],
    ['{us} beat {opp} {score}', '{scorers} on target, and {motm} the player of the match.'], ['Points in the bag for {us}', '{opp} beaten {score}.'],
    ['{motm} stars as {us} win', 'A {score} win over {opp}.'], ['{us} handle {opp}', 'A {score} win, with {scorers} on target.'],
    ['{opp} come up short', '{us} win {score}, with {scorers} on target.'],
  ],
  'win-late': [
    ['{scorer} leaves it late', 'A {minth}-minute winner settles it {score} against {opp}.'], ['Late, late show from {us}', '{scorer} strikes in the {minth} minute to beat {opp} {score}.'],
    ['{us} snatch it at the death', '{scorer} wins it {score} with almost the last kick.'], ['Late drama as {us} beat {opp}', '{scorer} strikes in the {minth} minute for a {score} win.'],
    ['{scorer} the late hero', 'A {minth}-minute goal sinks {opp} {score}.'], ['{us} keep going to the end', 'And {scorer} makes it pay in the {minth} minute: {score}.'],
    ['{us} find a way', '{scorer} wins it late, {score} against {opp}.'], ['{scorer} breaks {oppP} hearts', 'His {minth}-minute goal wins it {score}.'],
    ['Late show keeps {us} top', '{scorer} strikes in the {minth} minute: {score} against {opp}.', 'top'], ['{us} make it {wins} in a row the hard way', '{scorer} wins it in the {minth} minute against {opp}.'],
  ],
  'win-brace': [
    ['{brace} at the double', 'Two goals from {brace} as {us} beat {opp} {score}.'], ['Double delight for {brace}', '{us} ride a two-goal afternoon to a {score} win over {opp}.'],
    ['{brace} sinks {opp}', 'Two goals, three points: {us} win {score}.'], ['Two for {brace}, three points for {us}', '{opp} beaten {score}.'],
    ['{brace} does the damage', 'Two goals from {brace} as {opp} are beaten {score}.'], ['{brace} fires {us} to victory', 'A double in the {score} win over {opp}.'],
    ['{brace} bags a brace', '{us} beat {opp} {score}.'], ['{brace} takes his tally to {tally} goals', 'Two more in the {score} win over {opp}.'],
    ['{brace} double keeps {us} top', '{opp} beaten {score}.', 'top'], ['{brace} on fire as the run goes on', 'That is {wins} wins in a row for {us} after a {score} win over {opp}.'],
    ['{brace} brace ends the wait', '{us} beat {opp} {score} after {slump} games without a win.'],
  ],
  'win-hattrick': [
    ['Hat-trick hero {brace}', 'Three goals from {brace} as {us} beat {opp} {score}.'], ['{brace} takes the match ball', '{us} hit {opp} for {gf} with a hat-trick from {brace}.'],
    ['Three and easy for {brace}', 'A hat-trick in the {score} win over {opp}.'], ['{brace} hits a hat-trick', '{us} beat {opp} {score}.'],
    ['{brace} treble sinks {opp}', 'A {score} win for {us}.'], ['{brace} hat-trick takes him to {tally} goals', '{us} beat {opp} {score}.'],
  ],
  'win-big': [
    ['{us} run riot', '{opp} are swept aside {score}.'], ['Statement win for {us}', 'A {score} thrashing of {opp}, with {scorers} on target.'],
    ['{opp} put to the sword', '{us} win {score} and it could have been more.'], ['Goals galore for {us}', '{opp} beaten {score}.'],
    ['{us} in rampant form', 'A {score} win over {opp}, with {scorers} among the scorers.'], ['{opp} have no answer', '{us} win {score}.'],
    ['Ruthless {us} hit {opp} for {gf}', 'A {score} win and a statement.'], ['{us} send a message from the top', 'A {score} thrashing of {opp}.', 'top'],
    ['Goal-fest at {ground}', '{opp} hit for {gf} in front of {att}.'], ['{us} make it {wins} in a row in style', '{opp} are beaten {score}.'],
  ],
  'derby-win': [
    ['Derby day belongs to {us}', '{scorers} the heroes as {opp} are beaten {score}.'], ['Bragging rights to {us}', 'A {score} derby win over {opp} that the fans will not forget.'],
    ['{us} rule the city', 'A {score} derby win over {opp}.'], ['Derby delight for {us}', '{scorers} on target in a {score} win.'],
    ['{opp} beaten in the derby', '{us} take the bragging rights, {score}.'], ['City is ours, say {us} fans', 'A {score} derby win, with {motm} the pick of the players.'],
  ],
  'derby-draw': [
    ['Honours even in the derby', '{us} and {opp} share the points at {score}.'], ['No winner in a fierce derby', '{score} between {us} and {opp}, and nobody backed down.'],
    ['Derby ends all square', '{score} between {us} and {opp}.'], ['No bragging rights this time', '{us} and {opp} draw {score}.'], ['Derby stalemate', 'Neither side can find a winner: {score}.'],
  ],
  'derby-loss': [
    ['Derby despair for {us}', '{opp} take the bragging rights with a {score} win.'], ['{opp} win the derby', 'A {score} defeat leaves {us} with plenty to think about.'],
    ['{opp} take the derby', '{us} lose {score}.'], ['Derby pain for {us}', 'A {score} defeat to {opp}.'], ['A long week ahead for {us}', 'The derby goes to {opp}, {score}.'],
  ],
  'draw': [
    ['{us} held by {opp}', 'A {score} draw, and points shared.'], ['Stalemate with {opp}', '{us} come away with a {score} draw.'], ['A point apiece', '{us} and {opp} cannot be separated at {score}.'],
    ['Points shared with {opp}', '{us} draw {score}.'], ['{us} and {opp} cancel each other out', 'It finishes {score}.'], ['All square with {opp}', 'A {score} draw for {us}, with {scorers} on target.'],
    ['{us} settle for a point', '{score} against {opp}.'], ['Honours even', '{us} and {opp} draw {score}.'],
    ['{us} stretch unbeaten run to {unbeaten}', 'A {score} draw with {opp}.'], ['Still no win for {us}', 'A {score} draw with {opp} makes it {winless} games without a victory.'],
    ['A point on the road for {us}', 'A {score} draw at {opp}.', 'away'], ['{us} held at {ground}', '{opp} leave with a {score} draw.'],
    ['Top spot kept despite a draw', '{us} draw {score} with {opp}.', 'top'], ['{opp} hold {us}', 'A {score} draw against one of the top four.', 'oppTop'],
  ],
  'draw-late': [
    ['{scorer} rescues a point', 'A {minth}-minute equaliser earns {us} a {score} draw with {opp}.'], ['Late leveller for {us}', '{scorer} strikes in the {minth} minute: {score} with {opp}.'],
    ['{us} snatch a point', '{scorer} equalises in the {minth} minute against {opp}.'], ['{scorer} saves {us}', 'A {minth}-minute leveller: {score} with {opp}.'],
    ['Late reprieve for {us}', '{scorer} makes it {score} in the {minth} minute.'], ['{us} refuse to lose', '{scorer} strikes late to earn a {score} draw with {opp}.'],
  ],
  'draw-goalless': [
    ['Goalless against {opp}', 'Few chances and no goals for {us}.'], ['Nothing to separate them', '{us} and {opp} play out a 0-0.'],
    ['Stalemate', '{us} and {opp} play out a goalless draw.'], ['Goalless, but a point', '{us} share the spoils with {opp}.'], ['Defences on top', '{us} and {opp} draw 0-0.'],
    ['A clean sheet for {us}', 'But no goals at the other end either: 0-0 with {opp}.'], ['{us} draw a blank', '0-0 with {opp}.'], ['No way through for {us}', '{opp} hold out for a goalless draw.'],
    ['Shut-out at {ground}', '{us} and {opp} cannot find a goal.'], ['A point on the road', '{us} hold {opp} to 0-0.', 'away'],
    ['{us} keep the run going', 'A goalless draw with {opp} means {unbeaten} games unbeaten.'], ['Still searching for {us}', 'A 0-0 with {opp} makes it {winless} games without a win.'],
  ],
  'loss': [
    ['{us} beaten by {opp}', 'A {score} defeat and questions to answer.'], ['Frustration for {us}', '{opp} win {score}.'], ['{opp} too strong for {us}', 'A {score} loss on a tough day.'],
    ['{us} come unstuck', '{opp} win {score}.'], ['No way back for {us}', 'A {score} defeat to {opp}.'], ['{opp} spoil the party', '{us} lose {score}.'],
    ['{us} fall to {opp}', 'A {score} defeat, and points dropped.'], ['Off day for {us}', '{opp} take the points, {score}.'], ['{us} pay the price', 'A {score} defeat to {opp}.'],
    ['Slump goes on for {us}', 'A {score} defeat to {opp}: {winless} games without a win.'], ['{us} lose at {ground}', '{opp} win {score} in front of {att}.'],
    ['Tough trip for {us}', '{opp} win {score}.', 'away'], ['Pressure grows at the bottom', '{us} lose {score} to {opp}.', 'bottom'],
    ['{us} beaten by high-flying {opp}', 'A {score} defeat to one of the top four.', 'oppTop'], ['Top spot under threat', '{us} lose {score} to {opp}.', 'top'],
  ],
  'loss-late': [
    ['Heartbreak for {us}', '{opp} win it {score} with a {minth}-minute goal.'], ['Stung late on', 'A {minth}-minute goal gives {opp} a {score} win over {us}.'],
    ['So close for {us}', 'A {minth}-minute goal gives {opp} a {score} win.'], ['Late blow for {us}', '{opp} win it {score} in the {minth} minute.'],
    ['{us} undone at the death', 'A {minth}-minute goal settles it for {opp}, {score}.'], ['Gutting for {us}', '{opp} snatch a {score} win late on.'],
  ],
  'loss-heavy': [
    ['{us} hammered by {opp}', 'A {score} defeat that will hurt.'], ['Nightmare for {us}', '{opp} run away with it, {score}.'], ['{us} humbled', 'A {score} beating by {opp} leaves plenty to fix.'],
    ['A day to forget for {us}', '{opp} win {score}.'], ['{us} taken apart by {opp}', 'A {score} defeat.'], ['{opp} run riot against {us}', 'It finishes {score}.'],
    ['Back to the drawing board', '{us} lose {score} to {opp}.'], ['{us} ship goals at {ground}', '{opp} win {score}.'],
  ],
  'friendly': [
    ['{us} warm up against {opp}', 'A {score} result in a friendly, with minutes for the squad.'], ['Friendly outing for {us}', '{score} against {opp} as the build-up goes on.'],
    ['Run-out for {us}', 'A {score} friendly result against {opp}.'], ['{us} get minutes in the legs', '{score} against {opp} in a friendly.'], ['Pre-season test for {us}', 'A {score} result against {opp}.'],
  ],

  'signing': [
    ['{to} sign {player}', 'The {age}-year-old {pos} joins from {from} for {fee}.'], ['{player} completes {to} move', '{to} pay {from} {fee} for the {pos}.'],
    ['{to} land {player}', 'A {fee} deal brings the {age}-year-old from {from}.'], ['{player} joins {to}', 'The {pos} moves from {from} for {fee}.'],
    ['{to} add {player}', 'A {fee} signing from {from}.'], ['{player} on the move', '{to} pay {from} {fee} for the {age}-year-old.'],
    ['{to} strengthen with {player}', 'The {pos} arrives from {from} for {fee}.'], ['Done deal: {player} to {to}', '{fee} to {from} for the {pos}.'],
    ['{to} bring in {player}', 'A {fee} move from {from}.'], ['{to} bet on youth with {player}', 'The {age}-year-old {pos} joins from {from} for {fee}.', 'young'],
    ['Experience for {to}', '{player}, {age}, arrives from {from} for {fee}.', 'veteran'], ['{to} land in-form {player}', 'He has {goals} goals this season; {to} pay {from} {fee}.'],
  ],
  'signing-big': [
    ['{to} land their man', '{player} joins from {from} in a {fee} deal.'], ['Big money move for {player}', '{to} pay {fee} to sign the {pos} from {from}.'],
    ['{fee} for {player}', '{to} complete one of the deals of the window.'], ['{to} splash out on {player}', 'A {fee} deal with {from} for the {pos}.'],
    ['{player} seals big move to {to}', '{from} receive {fee}.'], ['Statement signing for {to}', '{player} joins from {from} for {fee}.'],
    ['{to} go big for {player}', '{fee} to {from} for the {age}-year-old.'], ['Major deal: {player} to {to}', 'The {pos} costs {fee}.'],
    ['{to} pay big for young {player}', 'A {fee} deal for the {age}-year-old {pos}.', 'young'], ['{to} pay {fee} for {goals}-goal {player}', 'The {pos} joins from {from}.'],
  ],
  'signing-record': [
    ['{to} break the bank for {player}', 'A {fee} deal with {from}, one of the biggest the league has seen.'], ['Blockbuster: {player} joins {to}', 'The {pos} costs {fee}.'],
    ['{player} joins the league\'s priciest', '{to} pay {from} {fee}.'], ['Huge fee as {player} joins {to}', '{fee} for the {pos}.'], ['{to} smash the market for {player}', 'A {fee} deal with {from}.'],
  ],
  'signing-free': [
    ['{to} sign {player} on a free', 'The {age}-year-old {pos} arrives without a fee.'], ['Free transfer coup for {to}', '{player} joins at no cost.'],
    ['{player} joins {to} for nothing', 'The {pos} arrives without a fee.'], ['No fee, no fuss: {player} to {to}', 'The {age}-year-old signs on a free.'],
    ['{to} snap up {player}', 'The {pos} joins on a free transfer.'], ['{player} finds a new home', '{to} sign the {age}-year-old {pos}.'],
    ['{to} add experience on a free', '{player}, {age}, joins without a fee.', 'veteran'],
  ],
  'signing-abroad': [
    ['{to} bring {player} to England', 'The {pos} arrives from {from} for {fee}.'], ['From {from} to {to}', '{player} makes the move for {fee}.'],
    ['{player} swaps {from} for {to}', 'A {fee} move for the {pos}.'], ['{to} look abroad for {player}', 'The {pos} joins from {from} for {fee}.'],
    ['{player} heads to England', '{to} pay {from} {fee}.'], ['{to} raid {country} for {player}', 'The {pos} joins from {from} for {fee}.'],
    ['From {country} to {to}', '{player} arrives from {from} for {fee}.'],
  ],
  'your-signing': [
    ['{player} signs for {to}', 'The {age}-year-old {pos} joins from {from} on a {years}-year deal.'], ['Welcome, {player}', '{to} complete the signing from {from}.'],
    ['{to} complete {player} deal', 'The {pos} arrives from {from} on a {years}-year contract.'], ['{to} welcome {player}', 'The {pos} arrives from {from} on a {years}-year deal.'],
    ['{player} is a {to} player', 'He joins from {from} for {fee}.'], ['New face at {to}', '{player} signs a {years}-year deal after leaving {from}.'],
    ['{to} sign young {player}', 'The {age}-year-old {pos} commits for {years} years.', 'young'],
  ],
  'sale': [
    ['{player} heads for {to}', '{from} accept {fee} for the {pos}.'], ['{from} cash in on {player}', 'A {fee} sale to {to}.'], ['End of an era for {player}', 'The {pos} leaves for {to} in a {fee} deal.'],
    ['{player} departs for {to}', 'The {pos} is sold for {fee}.'], ['Goodbye, {player}', 'The {pos} joins {to} for {fee}.'], ['{to} sign {player} from {from}', 'A {fee} deal.'],
    ['{from} let {player} go', 'He joins {to} for {fee}.'],
  ],
  'loan': [
    ['{player} joins {to} on loan', 'The {pos} moves from {from} for {weeks} weeks.'], ['Loan move for {player}', 'A spell at {to} for the {age}-year-old.'],
    ['{to} borrow {player}', 'The {age}-year-old joins from {from} on a {weeks}-week loan.'], ['{player} gets a loan move', '{weeks} weeks at {to} for the {pos}.'],
    ['Loan deal: {player} to {to}', 'A temporary move from {from}.'],
  ],
  'loan-return': [
    ['{player} heads back to {to}', 'The loan spell is over.'], ['Loan over for {player}', 'Back to {to} for the {pos}.'],
    ['{player} returns', 'His loan is over and he is back with {to}.'], ['Back to base for {player}', 'The loan ends and {to} welcome him back.'],
  ],
  'loan-permanent': [
    ['{to} make {player} move permanent', 'The loan becomes a {fee} transfer.'], ['{player} stays at {to} for good', 'The purchase clause is completed for {fee}.'],
    ['{player} signs for good', '{to} pay {fee} to keep the {pos}.'], ['Loan turns permanent for {player}', 'A {fee} deal with {from}.'],
  ],
  'deadline': [
    ['Deadline day: the clock is ticking', 'The window shuts at 23:00 and the phones are ringing.'], ['It\'s deadline day', 'Clubs have until 23:00 to get their business done.'],
    ['Phones ringing on deadline day', 'The window shuts at 23:00.'], ['One last push', 'Clubs have until 23:00 to finish their business.'], ['The final hours', 'It is deadline day and the window shuts at 23:00.'],
  ],
  'window-shut': [
    ['The window has slammed shut', '{deals} deals were done on deadline day.'], ['Done and dusted', 'The window closes with {deals} deals on the final day.'],
    ['Window closed', '{deals} deals got over the line on the final day.'], ['That\'s your lot', 'The window shuts after {deals} deadline-day deals.'], ['Business done', 'A final day with {deals} deals closes the window.'],
  ],

  'potm': [
    ['{player} is Player of the Month', 'The {month} award goes to the star of {club}.'], ['{month} belongs to {player}', 'Named the league\'s best after a month to remember with {club}.'],
    ['{player} takes {month} award', 'The {pos} is the league\'s Player of the Month.'], ['Award for {player}', 'The {month} Player of the Month plays for {club}.'],
    ['{player} named the best in {month}', 'Recognition for the {pos} at {club}.'], ['{player} wins monthly award', 'The {month} prize goes to {club}.'],
    ['{player} on {goals} goals and Player of the Month', 'A {month} to remember at {club}.'], ['Consistency pays for {player}', '{apps} appearances and the {month} award.'],
  ],
  'manager-month': [
    ['{club} boss wins Manager of the Month', '{pts} points in {month} earn the award.'], ['Manager of the Month for {club}', 'A {pts}-point {month} is rewarded.'],
    ['{mgr} is Manager of the Month', '{pts} points in {month} for {club}.'], ['{month} award for {mgr}', '{club} took {pts} points from the month.'],
    ['{mgr} wins the monthly prize', '{club} collect {pts} points in {month}.'], ['Top marks for {mgr}', 'A {pts}-point {month} at {club}.'],
    ['{club} boss honoured', '{mgr} wins Manager of the Month.'], ['Recognition for {mgr}', '{club} are rewarded for a {pts}-point {month}.'],
    ['{mgr} picks up {month} award', 'After {pts} points for {club}.'],
  ],
  'sacked': [
    ['{club} part company with their manager', 'The search for a successor begins.'], ['Axe falls at {club}', 'The club are looking for a new manager.'], ['{club} make a change', 'A new manager is wanted.'],
    ['{club} manager shown the door', 'The board want a new direction.'], ['Change at the top for {club}', 'The manager has gone.'], ['{club} start their search', 'A new manager is wanted.'],
  ],
  'appointed': [
    ['{club} name {mgr} as manager', 'The new man takes charge in the {league}.'], ['New era at {club}', '{mgr} is appointed.'],
    ['{club} job goes to {mgr}', 'He takes charge in the {league}.'], ['{club} turn to {mgr}', 'A new manager for the {league} club.'], ['Fresh start at {club}', '{mgr} is the new man in the dugout.'],
  ],
  'season-start': [
    ['The race starts here', '{teams} clubs. One title. A new {league} season is on its way.'], ['Here we go again', 'The {league} gets ready for {season}.'],
    ['A clean slate', 'Every {league} club starts {season} level.'], ['The wait is over', 'The {league} returns for {season}.'], ['Let the season begin', '{teams} clubs get ready for {season}.'],
  ],
  'playoffs': [['Playoff time', '{clubs} chase the final promotion place.'], ['One last shot at promotion', '{clubs} go into the playoffs.'], ['Into the playoffs', '{clubs} battle for the last promotion place.']],
  'retirements': [['Time to say goodbye', '{names} have hung up their boots.'], ['End of the road', 'Retirements across the league: {names}.'], ['Farewell to the boots', '{names} retire.']],

  'youth-intake': [
    ['A new crop arrives', '{count} youngsters join, with {star} the pick of them.'], ['The next generation', '{star} heads a group of {count} new arrivals.'],
    ['Fresh faces at the academy', '{count} youngsters arrive, led by {star}.'], ['Academy welcomes {count} newcomers', '{star} is the one to watch.'],
  ],
  'new-contract': [
    ['{player} commits his future', 'A new {years}-year deal for the {pos}.'], ['{player} signs on', 'The {pos} agrees a {years}-year contract.'],
    ['{player} extends his stay', 'A {years}-year deal for the {pos}.'], ['Good news: {player} stays', 'The {pos} signs for {years} more years.'], ['{player} puts pen to paper', 'A new {years}-year contract.'],
  ],
  'released': [['{player} leaves the club', 'His contract has been ended by mutual consent.'], ['Parting of the ways with {player}', 'The {pos} is released.'], ['{player} moves on', 'The {pos} has been released.']],
  'takes-over': [
    ['A new chapter at {club}', '{mgr} takes charge in the dugout.'], ['{mgr} is the new boss', 'Supporters welcome a fresh face in the dugout.'],
    ['Welcome, {mgr}', '{mgr} is in charge at {club}.'], ['{club} under new management', '{mgr} takes charge.'],
  ],
};

// How prominent a story is on the front page. Your club's news always counts for more.
const STORY_WEIGHT = { 'signing-record': 70, 'sacked': 60, 'derby-win': 60, 'derby-loss': 55, 'win-hattrick': 55, 'window-shut': 50, 'deadline': 45, 'season-start': 45, 'playoffs': 45,
  'win-late': 50, 'win-big': 50, 'loss-heavy': 50, 'your-signing': 50, 'signing-big': 45, 'sale': 45, 'appointed': 40, 'takes-over': 55, 'potm': 35, 'manager-month': 35,
  'win-brace': 45, 'loss-late': 45, 'draw-late': 45, 'derby-draw': 45, 'win': 40, 'draw': 30, 'loss': 35, 'draw-goalless': 25, 'friendly': 10,
  'signing': 30, 'signing-abroad': 32, 'signing-free': 22, 'loan': 18, 'loan-return': 12, 'loan-permanent': 25, 'retirements': 20, 'youth-intake': 30, 'new-contract': 25, 'released': 20 };

const fillStory = (t, V) => t.replace(/\{(\w+)\}/g, (_, k) => V[k] ?? '');
const has = (V, k) => V[k] != null && V[k] !== '';
// Facts that only exist in some situations (a run, a table position, an away day). A template that
// uses one fits that moment better than a generic one, so it is picked first when it applies.
const SITUATION = new Set(['wins', 'unbeaten', 'winless', 'slump', 'pos', 'top', 'topFour', 'bottom', 'ground', 'att', 'away', 'home', 'tally', 'oppTop',
  'young', 'veteran', 'country', 'goals', 'mgr', 'apps', 'big']);
const varsOf = t => [...(t[0] + ' ' + t[1]).matchAll(/\{(\w+)\}/g)].map(m => m[1]).concat([].concat(t[2] || []));
function storyTemplate(occasion, V, salt) {
  // A template is [headline, standfirst, need]; need lists facts it requires without printing them.
  const set = (STORY_TEMPLATES[occasion] || []).filter(t => varsOf(t).every(k => has(V, k)));
  if (!set.length) return null;
  G.storyRecent ||= [];
  const fresh = set.filter(t => !G.storyRecent.includes(occasion + ':' + t[0]));
  let pool = fresh.length ? fresh : set;
  const fitting = pool.filter(t => varsOf(t).some(k => SITUATION.has(k)));
  if (fitting.length && hash01(salt + 'sp') < 0.65) pool = fitting;
  const t = pool[Math.floor(hash01(salt + 'st') * pool.length)];
  G.storyRecent.unshift(occasion + ':' + t[0]); G.storyRecent.length = Math.min(G.storyRecent.length, 60);
  return t;
}
const NUM_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const numWord = n => NUM_WORDS[n] || String(n);
function storyImage(occasion, salt) {
  const list = NEWS_IMAGES[occasion] || [];
  if (!list.length) return null;
  const options = list.length > 1 ? list.filter(x => x !== G.storyLastImg) : list;
  return G.storyLastImg = options[Math.floor(hash01(salt + 'im') * options.length)];
}
// Attach a story to the news item just added. section: club|match|transfer|life|league.
function makeStory(n, section, occasion, V, opts = {}) {
  if (!n || n.box !== 'news') return;
  const t = storyTemplate(occasion, V, n.id);
  if (!t) return;
  const mine = (opts.clubs || []).includes(G.club), stand = fillStory(t[1], { ...V, ...(opts.prose || {}) });
  n.story = {
    // Headlines drop "the" before nicknames; the standfirst is a sentence, so it keeps it ("from the Seagulls").
    outlet: section, occasion, headline: fillStory(t[0], V), standfirst: stand[0].toUpperCase() + stand.slice(1), img: storyImage(occasion, n.id),
    weight: (STORY_WEIGHT[occasion] || 20) + (mine ? 25 : 0) + Math.min(20, (opts.fee || 0) / 4e6), clubs: opts.clubs || [], tint: opts.tint || (opts.clubs || [])[0] || null,
    ...(opts.score ? { score: opts.score } : {}),
  };
}
// Headline-style club name: no "the". Surnames for players.
const hClub = id => G.clubs[id]?.name || 'Free agents';
const surname = p => p?.ln || '';

/* ---------- occasions from events ---------- */
function storyMatch(n, fx, S, O, motm) {
  const us = G.club, opp = O.cid, gf = S.st.g, ga = O.st.g, me = G.clubs[us], them = G.clubs[opp];
  const derby = !fx.fr && !!me.city && me.city === them?.city;
  const tally = {}; S.goals.forEach(g => { tally[g.pid] = (tally[g.pid] || 0) + 1; });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const lastOurs = S.goals[S.goals.length - 1], lastTheirs = O.goals[O.goals.length - 1];
  const scorers = [...new Set(S.goals.map(g => surname(G.players[g.pid])))];
  const V = { us: hClub(us), opp: hClub(opp), oppP: possessive(hClub(opp)), score: `${Math.max(gf, ga)}-${Math.min(gf, ga)}`, gf, motm: motm ? fullName(G.players[motm]) : null,
    scorers: scorers.length ? scorers.slice(0, -1).join(', ') + (scorers.length > 1 ? ' and ' : '') + scorers[scorers.length - 1] : null };
  let occ;
  if (fx.fr) occ = 'friendly';
  else if (gf > ga) {
    if (derby) occ = 'derby-win';
    else if (top && top[1] >= 3) { occ = 'win-hattrick'; V.brace = surname(G.players[top[0]]); }
    else if (gf - ga === 1 && lastOurs?.min >= 85) { occ = 'win-late'; V.scorer = surname(G.players[lastOurs.pid]); V.min = lastOurs.min; }
    else if (gf - ga >= 3) occ = 'win-big';
    else if (top && top[1] === 2) { occ = 'win-brace'; V.brace = surname(G.players[top[0]]); }
    else { occ = 'win'; if (scorers.length === 1) V.scorer = surname(G.players[S.goals[0].pid]); }
  } else if (gf === ga) {
    if (derby) occ = 'derby-draw';
    else if (!gf) occ = 'draw-goalless';
    else if (lastOurs && lastOurs.min >= 85 && (!lastTheirs || lastTheirs.min < lastOurs.min)) { occ = 'draw-late'; V.scorer = surname(G.players[lastOurs.pid]); V.min = lastOurs.min; }
    else occ = 'draw';
  } else if (derby) occ = 'derby-loss';
  else if (ga - gf >= 3) occ = 'loss-heavy';
  else if (ga - gf === 1 && lastTheirs?.min >= 85) { occ = 'loss-late'; V.min = lastTheirs.min; }
  else occ = 'loss';
  if (V.min) V.minth = ordinal(V.min);
  const home = fx.h === us;
  Object.assign(V, matchSituation(fx, us, opp, occ, home, top));
  makeStory(n, 'match', occ, V, { clubs: [us, opp], tint: us, prose: { us: theClub(us), opp: theClub(opp) }, score: { h: home ? us : opp, a: home ? opp : us, hg: home ? gf : ga, ag: home ? ga : gf } });
}
// Runs, table position, venue and crowd: the facts that make one result different from another.
function matchSituation(fx, us, opp, occ, home, top) {
  const X = {};
  if (home && !fx.neutral) { X.home = '1'; if (G.clubs[us].ground) X.ground = G.clubs[us].ground; } else X.away = '1';
  if (fx.att >= 1000) X.att = fx.att.toLocaleString('en-GB');
  if (top) { const sc = G.players[top[0]]; if (sc?.st?.g >= 5) X.tally = sc.st.g; }
  if (fx.fr) return X;
  const tbl = leagueTable(leagueOf(us)), row = tbl.find(r => r.id === us), orow = tbl.find(r => r.id === opp);
  if (!row) return X;
  const form = row.form, tail = test => { let k = 0; for (let i = form.length - 1; i >= 0 && test(form[i]); i--) k++; return k; };
  const won = form[form.length - 1] === 'W', pos = tbl.indexOf(row) + 1;
  const wins = tail(r => r === 'W'), unbeaten = tail(r => r !== 'L'), winless = tail(r => r !== 'W');
  if (wins >= 3) X.wins = numWord(wins);
  if (!/loss/.test(occ) && unbeaten >= 5) X.unbeaten = numWord(unbeaten);
  if (!won && winless >= 3) X.winless = numWord(winless);
  if (won) { let k = 0; for (let i = form.length - 2; i >= 0 && form[i] !== 'W'; i--) k++; if (k >= 3) X.slump = numWord(k); }
  if (row.p >= 5) { X.pos = pos === 1 ? 'top' : ordinal(pos); if (pos === 1) X.top = '1'; else if (pos <= 4) X.topFour = '1'; if (pos > tbl.length - 3) X.bottom = '1'; }
  if (orow && row.p >= 5 && tbl.indexOf(orow) < 4) X.oppTop = '1';
  return X;
}
function storyTransfer(n, kind, p, fromId, toId, fee, extra = {}) {
  const from = G.clubs[fromId], V = { player: fullName(p), to: hClub(toId), from: from?.fa ? 'free agency' : hClub(fromId), fee: fee ? money(fee) : null,
    age: p.age, pos: (POS_NAME[p.pos] || p.pos).toLowerCase(), ...extra };
  if (p.age <= 21) V.young = '1'; else if (p.age >= 31) V.veteran = '1';
  if (from?.foreign && !from.fa) V.country = natName(from.nat);
  if (p.st?.g >= 5) V.goals = p.st.g;
  if (fee >= 40e6) V.big = '1';
  let occ = kind;
  if (kind === 'signing') occ = !fee ? 'signing-free' : fee >= 60e6 ? 'signing-record' : fee >= 25e6 ? 'signing-big' : from?.foreign ? 'signing-abroad' : 'signing';
  makeStory(n, 'transfer', occ, V, { clubs: [toId, fromId], tint: toId, fee, prose: { to: theClub(toId), from: from?.fa ? 'free agency' : theClub(fromId) } });
}
// Simple stories whose facts are passed straight in.
function storySimple(n, section, occasion, V, clubs = []) { makeStory(n, section, occasion, V, { clubs, tint: clubs[0], prose: clubs[0] && V.club ? { club: theClub(clubs[0]) } : {} }); }
