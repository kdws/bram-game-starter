# BRAM Puzzle & Gameplay Design Document

## Working title

**BRAM: The Almost Boy**

## Core design thesis

BRAM should not be “math questions inside a platformer.” It should be a real puzzle-adventure game where math is one expression of world logic.

The player is not doing worksheets to unlock doors. The player is helping Bram and Nilo repair a broken world through amount, order, timing, pattern, balance, fairness, spatial reasoning, and careful choice.

The central gameplay idea is:

> **Math is careful repair.**

The central story idea is:

> **Nilo has the power to repair. Bram has the human understanding to guide it. Together, they fix one thing at a time.**

The central player fantasy is:

> **I can make the world better by understanding what it needs.**

---

# 1. Inspirations and what to borrow

BRAM can learn from several classic puzzle and educational games without becoming a copy of any of them.

## Math Blaster

Borrow:

- Fast arcade math
- Number targets
- Projectiles / answer gates
- High-energy practice
- Replayable fluency challenges

Do not borrow:

- Pure drill feeling
- Stress-first design
- Random math disconnected from story

BRAM version:

> Nilo’s repair energy becomes arcade action. Bram guides it toward the correct amount, number, target, or timing.

## Professor Layton

Borrow:

- Charming brainteasers
- Story-framed puzzles
- Characters who ask clever questions
- Mystery and curiosity
- Optional harder puzzles

Do not borrow:

- Puzzle walls that block young players too harshly
- Gotcha riddles that feel unfair

BRAM version:

> NPCs, Owl, and broken places present puzzles as little mysteries about how the world works.

## Zelda

Borrow:

- Room-based exploration
- Locks, keys, switches, doors
- Items and abilities opening new paths
- Puzzle rooms
- Environmental problem solving
- Clear world feedback after solving

Do not borrow:

- Combat focus
- Punishing failure
- Obscure progression blockers

BRAM version:

> Each room is a repair site. Solving it changes the world visibly.

## Chip’s Challenge

Borrow:

- Grid-based logic rooms
- Discrete tile rules
- Collect all tokens before exit
- Push blocks
- Keys/doors
- Sliding floors
- Conveyors/force floors
- Patterning enemies
- Planning, undo, reset

Do not borrow:

- Brutal difficulty spikes
- Hard fail states
- Trial-and-error frustration

BRAM version:

> Grid puzzle rooms become repair rooms where Bram collects stones, routes Nilo’s energy, pushes blocks, repairs sockets, and opens exits.

## Side-scroller puzzle-platformers

Borrow:

- Traversal
- Jumping
- Climbing
- Timing
- Push/pull objects
- Environmental physics
- Character animation and comedy

BRAM version:

> Bram’s restored body parts unlock new platforming verbs, and Nilo’s energy creates repair-based traversal puzzles.

## Treasure MathStorm

Borrow:

- Cozy educational nostalgia
- Collect/return/repair loop
- Skill-based progression
- A child-friendly adventure structure

Do not borrow:

- Specific characters, name, story, art, music, or UI

BRAM version:

> Collect Life Sparks by repairing places that are borrowing pieces of Bram.

---

# 2. Design pillars

## Pillar 1: Fix one thing at a time

The game should constantly reinforce the idea that repair is concrete, local, and careful.

A broken world is too big to fix all at once. Bram and Nilo repair one bridge, one clock, one path, one market stall, one garden, one creature, one room.

This is also the educational philosophy:

> Solve one problem. Understand one rule. Make one thing better.

## Pillar 2: Just enough

Nilo is energy and potential. He wants to fix everything immediately, but he tends to overdo it.

Bram teaches:

> More is not always better. Correct is better. Just enough is better.

This turns math into care:

- A plant needs 3 drops, not 10.
- A bridge needs 8 stones, not 20.
- A clock needs 3:30, not “around then.”
- A market trade needs fairness, not maximum coins.

## Pillar 3: Experience first, symbols second

Bad:

> Solve 7 + 5 to continue.

Better:

> The bridge needs 12 stones. You have 7. How many more?

Best:

> Bram physically sees 7 stones placed in a 12-socket bridge. The player adds 5 stones. Then the equation appears afterward: 7 + 5 = 12.

The child should experience the repair before seeing the abstract math.

## Pillar 4: Mistakes are playful

Failure is not shame.

Bram is a skeleton. Mistakes can be funny:

- He falls apart and reassembles.
- His skull rolls, then pops back on.
- Nilo apologizes for overcharging.
- Owl calmly comments.
- The broken object coughs out sparks.

The player should think:

> “Oops, try again.”

Not:

> “I’m bad at math.”

## Pillar 5: Real game first

The game should be fun even before the parent thinks about curriculum.

Moment-to-moment play should include:

- jumping
- skating
- pushing blocks
- ringing bells
- lighting lanterns
- finding secrets
- talking to odd creatures
- collecting shells
- unlocking shortcuts
- watching the world repair itself

Math should improve the toy, not replace the toy.

---

# 3. The expanded meaning of “math” in BRAM

BRAM should treat math broadly.

Math includes:

- amount
- order
- timing
- pattern
- balance
- fairness
- space
- sequence
- logic
- measurement
- cause and effect
- prediction
- constraints

This allows the game to include arithmetic, but not be trapped by arithmetic.

Examples:

- Addition repairs groups.
- Subtraction clears what does not belong.
- Number lines become paths.
- Time helps moments happen in order.
- Money teaches fairness and value.
- Patterns teach noticing.
- Measurement makes bridges fit.
- Logic teaches what must happen next.
- Grid puzzles teach planning and constraints.

---

# 4. Core gameplay modes

BRAM should have multiple modes that all serve the same repair fantasy.

## Mode 1: Side-scroller exploration

Perspective:

- Side-scrolling platform-adventure

Purpose:

- Traverse the world
- Talk to characters
- Find broken places
- Jump, climb, push, carry, skate
- Discover repair puzzles
- Collect Life Sparks

Tone:

- Cozy, tactile, characterful

Example activities:

- Push a crate to reach a ledge
- Pull a lever to open a gate
- Jump across number-line platforms
- Carry stones to a bridge
- Use Nilo energy to power a lift
- Squeeze through a gap by falling apart

## Mode 2: Rattle Run

Perspective:

- Fast side-scrolling/downhill skateboarding

Purpose:

- Arcade math fluency
- High-energy practice
- Replayable challenges
- Movement comedy

Examples:

- Choose the correct answer ramp
- Collect exactly enough sparks
- Shoot repair energy at the correct number
- Land tricks by solving quick problems
- Avoid too much energy

Educational value:

- automaticity
- number bonds
- addition/subtraction fluency
- quick recognition

## Mode 3: Clocktower / focused learning minigames

Perspective:

- Focused interactive object scenes

Purpose:

- Teach difficult conceptual skills slowly
- Allow free exploration before scoring
- Scaffold errors

Examples:

- Analog/digital clock widget
- Coin counting
- Place value machine
- Pattern mirror
- Measurement bridge tool

Educational value:

- conceptual understanding
- manipulation
- visual feedback

## Mode 4: Grid puzzle rooms

Perspective:

- Top-down, tile-based, Chip’s Challenge / Zelda / Sokoban-inspired rooms

Purpose:

- Planning
- Spatial logic
- Sequencing
- Constraint reasoning
- Puzzle variety

Examples:

- Collect repair stones
- Push blocks
- Open gates
- Use keys
- Slide on moonstone floors
- Ride conveyors/currents
- Predict moving creatures
- Repair sockets before exiting

Educational value:

- spatial reasoning
- logic
- cause/effect
- ordered planning
- debugging mistakes

## Mode 5: Layton-style brainteasers

Perspective:

- Story prompt / parchment puzzle / NPC dialogue

Purpose:

- Clever optional or semi-required puzzle moments
- Story charm
- Mystery
- Lateral thinking

Examples:

- Bell timing puzzle
- Lantern truth puzzle
- Missing step puzzle
- Pattern riddle
- Fair trade question

Educational value:

- logic
- language
- reasoning
- pattern recognition

## Mode 6: Repair rituals

Perspective:

- Chapter finale, mixed mechanics

Purpose:

- Conclude each chapter
- Combine learned skills
- Visibly repair a whole system
- Return one part of Bram

Examples:

- Reconnect Rattlewood bridges
- Restore Hollow Hills paths
- Retune Clocktower bells
- Rebalance Moonlit Market

Educational value:

- synthesis
- mastery demonstration

---

# 5. Bram and Nilo as a gameplay pair

## Nilo

Nilo is:

- energy
- electricity
- potential
- urgency
- repair power
- unable to touch directly
- unable to regulate himself at first

Nilo can:

- energize machines
- light dark areas
- reveal cracks
- become a repair beam
- flow through wires, water, crystals, and clockwork
- show visions of broken systems

Nilo cannot:

- touch physical objects without Bram
- know how much energy is enough
- understand weight, distance, pain, timing, or fairness at first
- resist trying to fix everything immediately

## Bram

Bram is:

- touch
- judgment
- care
- groundedness
- physical understanding
- a mentor to Nilo

Bram teaches:

- just enough
- wait
- one thing at a time
- touch gently
- ask what helps

## Pair mechanic

The player often controls Bram’s physical action while guiding Nilo’s energy.

Examples:

- Bram places the clock numbers; Nilo powers the clock.
- Bram pushes the stone; Nilo glows the socket.
- Bram chooses the energy amount; Nilo supplies it.
- Bram aims the beam; Nilo becomes the beam.
- Bram stands on a grounding plate; Nilo flows through a circuit.

The formula:

> **Nilo = power. Bram = touch and judgment. Math = just enough.**

---

# 6. Ability progression through Bram’s restoration

Each restored body part should unlock new story meaning and new gameplay verbs.

## Skeleton-only beginning

Abilities:

- walk
- jump
- push small objects
- fall apart safely
- reassemble
- briefly channel Nilo energy

Funny traits:

- rattles near secrets
- bones scatter on mistakes
- skull expressions carry emotion
- can squeeze through some narrow spaces after collapsing

## Hands restored

Theme:

> Hands are for helping.

New abilities:

- carry objects
- grab ledges
- pull levers
- hold Nilo energy longer
- pick up puzzle pieces
- place stones/tiles/keys

Puzzle impact:

- more object manipulation
- bridge repair
- push/pull rooms
- carrying puzzles

## Feet restored

Theme:

> Feet are for finding the way.

New abilities:

- dash
- better jump
- improved skate control
- balance on rails
- wall kick, if desired

Puzzle impact:

- number-line movement
- downhill trails
- timing and path puzzles

## Eyes restored

Theme:

> Eyes are for noticing what matters.

New abilities:

- reveal hidden paths
- inspect objects
- see patterns
- preview puzzle consequences
- see ghost target positions

Puzzle impact:

- visual logic
- place value
- hidden pattern rooms

## Voice restored

Theme:

> A voice is for meaning.

New abilities:

- call NPCs
- ring bells
- speak names
- ask Nilo to wait / pulse / follow
- trigger sound/time puzzles

Puzzle impact:

- clocks
- timing
- sequencing
- dialogue logic

## Heart restored

Theme:

> A heart is for caring what others need.

New abilities:

- calm overcharged things
- help NPCs trust Bram
- complete fair trades
- share energy safely
- resist Nilo overload

Puzzle impact:

- money
- fairness
- sharing
- multi-step word problems

---

# 7. Puzzle category library

## A. Math Blaster-style arcade puzzles

### Number Spark Shooting

Nilo charges a repair beam. Bram aims it at the correct target.

Example:

- Bridge needs 13 stones.
- It has 8.
- Targets appear: 4, 5, 6.
- Hit 5.

### Falling Number Meteors

Targets fall from the sky. Player catches numbers that make a goal.

Example:

Target: 10.

Catch:

- 4 + 6
- 7 + 3
- 8 + 2

Avoid totals that exceed 10.

### Energy Meter

Hold a button to charge Nilo’s energy. Release at exactly the needed amount.

Example:

- Plant needs 3 energy.
- Too little: remains wilted.
- Too much: overgrows and sneezes sparks.
- Just enough: blooms.

### Skate Trick Gates

Downhill Rattle Run.

Example:

- Prompt: 7 + 5 = ?
- Ramps: 11, 12, 13
- Choose 12 to land the trick.

## B. Zelda-style room puzzles

### Push Block Sum Room

A gate needs total 12.

Blocks:

- 3
- 4
- 5
- 7
- 8

Possible solutions:

- 5 + 7
- 4 + 8
- 3 + 4 + 5

### Balance Scale Room

Two platforms must balance.

Left side has 9.

Right blocks:

- 2
- 3
- 4
- 5
- 6

Solutions:

- 4 + 5
- 3 + 6

### Switch Sequence Room

Ring bells in the correct order.

Example:

- 2 → 4 → 8
- small → medium → large

### Clock Door Room

Door opens when clocks agree.

Actions:

- set analog clock
- match digital display
- ring bell
- open gate

### Light Beam / Mirror Pattern

Rotate mirrors to route Nilo energy.

Example:

- Beam strength starts at 10.
- Mirror subtracts 3.
- Gate needs 7.

## C. Professor Layton-style brainteasers

### The Three Bells

Three bells ring every 2, 3, and 6 minutes. If they ring together now, when do they ring together again?

Answer: 6 minutes.

Use timelines for younger kids.

### The Honest Lantern

One lantern always lies on cloudy nights. Another says tonight is cloudy. Which lantern can Bram trust?

Use sparingly and scaffold heavily.

### Missing Step

Bridge stones:

2, 4, 6, __, 10

Answer: 8.

### Too-Helpful Vine

A vine grows 2 tiles per bell ring. It needs to reach 8 tiles, not longer. How many rings?

Answer: 4.

Nilo wants to ring many times; Bram teaches just enough.

## D. Side-scroller environmental puzzles

### Number-Line Platforms

Platforms labeled:

0, 2, 4, 6, 8, 10

Prompt:

> Start at 4. Jump forward 3 twos.

Destination: 10.

### Moving Platform Timing

Set a bell or clock interval so moving platforms sync.

### Crate + Jump Puzzle

A lift rises by the value of crates placed on it.

Need height 8.

Crates:

- 3
- 5
- 6

Solution: 3 + 5.

### Wind / Current Puzzle

Nilo’s energy pushes Bram.

Too little: Bram does not cross.

Too much: Bram blows past the ledge.

Just enough: Bram lands.

### Bridge Repair

Gap length 8.

Planks:

- 2
- 3
- 5
- 6

Solutions:

- 3 + 5
- 2 + 6

## E. Chip’s Challenge-style grid puzzles

### Collect Repair Tokens

Collect all required tokens before exit opens.

Tokens vary by chapter:

- Bridge Stones
- Path Sparks
- Mirror Shards
- Bell Notes
- Fair Coins

### Keys and Doors

BRAM equivalents:

- Brass Key
- Moon Key
- Number Key
- Clock Gear
- Heart Token

Math twist:

A door may need a total, not a single key.

Example:

Gate says 10.

Keys are 3, 4, 6, 7.

Use 3 + 7 or 4 + 6.

### Push Blocks

Objects:

- stone blocks
- crates
- bridge stones
- clock gears
- market weights
- lantern batteries

Rules:

- Bram pushes one block at a time.
- Blocks cannot pass through walls.
- Blocks can sit on plates.
- Some blocks have numbers or weights.

### Sliding Tiles / Ice

BRAM versions:

- wet seaside stones
- slick moonstone
- frozen clock-glass
- polished market tiles
- moss slides

Skills:

- count tiles
- plan stopping points
- estimate movement
- use blockers intentionally

### Force Floors / Conveyors

BRAM versions:

- wind tiles
- tide currents
- Nilo energy streams
- clockwork belts
- mushroom bounce paths

Skills:

- prediction
- sequencing
- cause and effect

### Toggle Switches

BRAM versions:

- lantern switches
- bell plates
- vine toggles
- tide levers
- clock hands

Puzzle pattern:

- one switch opens one door and closes another
- toggles bridge orientation
- reverses current direction
- changes even/odd gates

### Soft Hazards

No death.

Hazards:

- puddles that make Bram slip
- thorn vines that bounce him back
- overcharged tiles that scatter bones
- sleepy fog that returns him to start
- tide pools needing shell shoes
- static sparks that rattle him apart

### Moving Creatures

Puzzle actors, not enemies.

Examples:

- Pebble crabs move left-right.
- Lantern moths follow light.
- Rattle sprites copy Bram’s last move.
- Clock frogs jump every 3 beats.
- Moss imps push blocks randomly unless calmed.

Skills:

- pattern prediction
- turn counting
- timing
- luring creatures onto switches

---

# 8. Grid puzzle system details

## Design goal

Grid puzzle rooms provide BRAM with slow, thoughtful logic gameplay.

They are inspired by Chip’s Challenge, Zelda puzzle rooms, and Sokoban, but adapted to BRAM’s repair theme.

## Why turn-based

Grid puzzle rooms should be turn-based or semi-turn-based.

Each Bram move is one step. Then the room updates:

- creatures move
- conveyors push
- timers tick
- switches toggle
- gates update

This supports reasoning, undo, and hints.

## Required quality-of-life features

- Unlimited undo
- Reset room button
- No lives
- Soft failure
- Generous hints
- Small beginner rooms
- One new mechanic per room
- Optional hard rooms clearly marked

Undo is essential. A child should never be trapped by one bad block push.

## ASCII map format concept

Example:

```text
##########
#B..s...E#
#..##....#
#..3.P10.#
#..7.....#
##########
```

Legend:

```text
# wall
. floor
B Bram start
E exit
s repair stone / spark
3 number stone value 3
7 number stone value 7
P10 plate/gate requiring total 10
```

## First demo grid puzzle: Broken Bridge Room

Goal:

- Collect 4 repair stones.
- Step on or repair 4 bridge sockets.
- Exit opens after all sockets are repaired.

Mechanics:

- Grid movement
- Stone collection
- Socket repair
- Push block, if included
- Undo
- Reset

Success beat:

Nilo:

> “It stayed.”

Bram:

> “Just enough.”

---

# 9. Chapter structure and puzzle themes

## Hub: Bram’s Coastal House

The house becomes the emotional hub.

At first:

- broken clock
- fading photo
- moonlit kitchen
- unstable ocean path
- Nilo learning physical reality
- Owl at the window

As chapters are repaired:

- clock works
- plant grows
- photo restores
- kitchen warms
- ocean path stabilizes
- Nilo learns to sit, eat, wait, rest
- skateboard gains charms

## Chapter 1: Rattlewood — Hands

Story problem:

Rattlewood cannot hold itself together.

Examples:

- bridges drop stones
- doors lose handles
- creatures drop things
- lantern moths cannot hold light

Math focus:

- counting
- addition
- number bonds
- missing addends
- equality basics

Gameplay focus:

- carrying
- placing
- bridge repair
- push-block sums
- first Rattle Run

Restoration line:

> The forest remembered how to hold. Bram remembered his hands.

## Chapter 2: Hollow Hills — Feet

Story problem:

Paths vanish, loop, or lead nowhere.

Math focus:

- subtraction
- number lines
- skip counting
- distance

Gameplay focus:

- skateboard
- movement puzzles
- path repair
- sliding/force floor logic

Restoration line:

> The hills remembered where they were going. Bram remembered his feet.

## Chapter 3: Glass Garden — Eyes

Story problem:

The garden cannot see itself clearly.

Math focus:

- patterns
- place value
- comparing numbers
- visual logic
- shapes

Gameplay focus:

- mirrors
- hidden paths
- pattern locks
- inspection

Restoration line:

> The garden remembered how to see. Bram remembered his eyes.

## Chapter 4: Clocktower Marsh — Voice

Story problem:

Bells are silent, clocks disagree, words come out at the wrong time.

Math focus:

- analog clocks
- digital clocks
- o’clock
- half-hour
- quarter-hour
- five-minute intervals
- sequencing

Gameplay focus:

- clock widget
- bell timing
- clockwork rooms
- timed platforms

Restoration line:

> The bells remembered when to ring. Bram remembered his voice.

## Chapter 5: Moonlit Market — Heart

Story problem:

The market has forgotten fairness.

Math focus:

- coins
- money
- fair trades
- sharing
- multi-step problems
- early multiplication/division

Gameplay focus:

- exact change
- balance scales
- trade puzzles
- fairness choices

Restoration line:

> The market remembered what was fair. Bram remembered his heart.

## Finale: Observatory of Almost

Story problem:

Nilo wants to repair everything all at once.

Bram teaches the final lesson:

> Not all of you. One thing.

Gameplay focus:

- mixed puzzle review
- repair sequence
- no boss fight
- careful stabilization of systems

Ending idea:

The world gives Bram’s sparks back because it no longer needs to borrow them.

---

# 10. Sample complete chapter: Rattlewood Hands

## Story problem

Rattlewood cannot hold itself together.

- bridges are missing stones
- doors cannot keep handles
- creatures carry too much
- lanterns drop their light

Nilo wants to flood the forest with energy.

Bram teaches:

> One branch. One bridge. One thing.

## Puzzle 1: Lantern Moth Number Bonds

A moth needs 10 glowberries. It has 6.

Player finds 4.

Skill:

- missing addend
- number bonds to 10

## Puzzle 2: Broken Bridge Stones

Bridge needs 12 stones.

Piles:

- 5
- 7
- 8
- 4
- 3

Player chooses piles totaling 12.

Skills:

- addition combinations
- multiple solutions

## Puzzle 3: Balance Gate

Two plates must equal each other.

Skills:

- equality
- decomposition

## Puzzle 4: Rattle Run

Bram skates down a forest trail.

Challenges:

- answer ramps
- collect exact sparks
- land tricks

Skills:

- addition/subtraction fluency

## Chapter repair ritual

The forest bridge network reconnects.

Bram’s hand-sparks return.

Line:

> The forest remembered how to hold. Bram remembered his hands.

---

# 11. Hints and scaffolding

Every puzzle should support three levels of hints.

## Hint level 1: Nilo notices

Nilo points to something without solving it.

Example:

> “The bridge still has gaps.”

## Hint level 2: Bram explains

Bram gives practical guidance.

Example:

> “We have 7 stones. The bridge needs 12. We need more.”

## Hint level 3: Owl scaffolds

Owl gives a structured strategy.

Example:

> “Try counting up from 7: 8, 9, 10, 11, 12. That is five more.”

Hints should not immediately reveal the answer unless accessibility mode or parent settings allow it.

---

# 12. Rewards

BRAM should avoid manipulative reward economies.

Good rewards:

- visible world repair
- Life Sparks
- restored body parts
- shell collection
- skateboard stickers
- jacket patches
- house decorations
- Nilo glow colors
- lore pages
- optional puzzle stamps

Avoid:

- loot boxes
- gambling-like randomness
- ads
- streak anxiety
- manipulative daily pressure
- pay-to-skip

---

# 13. Difficulty philosophy

## Required path

- gentle
- scaffolded
- retry-friendly
- no hard fail
- no lives
- age-appropriate

## Optional puzzles

- can be harder
- clearly marked
- reward cosmetics/lore
- never block main story completion

## Adaptive layer

Track skill mastery by type:

- addition
- subtraction
- number bonds
- time
- money
- patterns
- grid planning
- equality
- place value

But do not let adaptation destroy hand-authored puzzle design.

Use mastery to choose practice content, hints, optional challenge rooms, and Rattle Run difficulty.

---

# 14. Implementation recommendation

The next systems to build should be reusable.

## Puzzle System v0.1

Create puzzle definitions with:

- id
- title
- kind
- chapter
- skill IDs
- difficulty
- prompt
- success text
- hints
- repair theme
- reward type

Puzzle kinds:

- arcade_math
- room_puzzle
- brainteaser
- side_scroller_environmental
- grid_logic
- repair_ritual

## Grid Puzzle Rooms v0.1

Create:

- grid types
- ASCII map loader
- movement engine
- push blocks
- collectibles
- repair sockets
- exit logic
- undo/reset
- hints

First scene:

**Puzzle Lab: Broken Bridge Grid Room**

Acceptance:

- tile movement
- collect stones
- repair sockets
- exit opens
- undo/reset work
- typecheck/build pass

---

# 15. Claude-ready implementation prompt

```text
Next milestone: Puzzle System + Grid Puzzle Rooms v0.1 for BRAM.

Goal:
Create a reusable foundation for Zelda/Layton/Chip’s Challenge-style repair puzzles.

Core concept:
Every puzzle is a repair. The puzzle should have:
- problem state
- player interaction
- hint levels
- success repair effect
- optional mastery skill IDs
- optional reward

Create:
src/game/puzzles/PuzzleTypes.ts
src/game/grid/GridTypes.ts
src/game/grid/GridPuzzleEngine.ts
src/scenes/GridPuzzleLabScene.ts
docs/PUZZLE_DESIGN_SYSTEM.md
docs/GRID_PUZZLE_SYSTEM.md

Puzzle categories:
1. Arcade math / Math Blaster-style
2. Room puzzles / Zelda-style
3. Brainteasers / Professor Layton-style
4. Side-scroller environmental puzzles
5. Grid logic / Chip’s Challenge-style
6. Repair rituals / chapter finales

Grid system requirements:
- ASCII map format
- wall, floor, start, exit
- repair stones / sparks
- repair sockets
- push blocks
- switches
- gates
- number stones / plates, if simple
- discrete tile movement
- arrow keys / WASD
- undo with U
- reset with R
- no lives, no death
- gentle invalid-move bump
- procedural cozy visuals for now

First playable demo:
Broken Bridge Grid Room

Goal:
- Collect 4 repair stones
- Repair 4 bridge sockets
- Exit opens when all sockets are repaired

Success beat:
Nilo: “It stayed.”
Bram: “Just enough.”

Menu:
Add button: “Puzzle Lab: Grid Repair Room”

Acceptance criteria:
- npm run typecheck passes
- npm run build passes
- Grid puzzle lab loads from menu
- Player moves tile-by-tile
- Push block works if included
- Collect stones works
- Repair sockets works
- Exit opens after repair goal
- Undo and reset work
```

---

# 16. Final summary

BRAM’s gameplay identity should be:

> A cozy repair adventure where math is how you care for the world.

The game should combine:

- Math Blaster energy
- Professor Layton cleverness
- Zelda exploration
- Chip’s Challenge grid logic
- side-scroller traversal
- Treasure MathStorm nostalgia

But the glue is always Bram and Nilo:

> **Nilo asks: “What’s next?”**  
> **Bram teaches: “Just enough.”**  
> **The game answers: “Fix one thing at a time.”**

