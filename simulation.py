import random
from collections import Counter, defaultdict

# -------------------------
# CONFIG
# -------------------------

MAX_ROUNDS = 8

PURE_THRESHOLD = 0.25
BACKFIRE_THRESHOLD = 0.5

# Infection tuning: gentler, and only for 6+ players (handled in loop)
INFECTION_START = 1
INFECTION_END = 3
MAX_EXTRA_INFECTED = 1
INFECT_TAINTED = 0.08
INFECT_BACKFIRE = 0.25

PURGING_START = 4
PURGING_CHANCE = 0.25

EXORCIST_MIN_ROUND = 3
EXORCIST_SUSPICION_THRESHOLD = 2.0

GAMES_PER_COUNT = 1000

# Ingredient value buckets
SAFE = [-0.15, -0.10]
NEUTRAL = [0.05, 0.06, 0.08]
CORRUPT = [0.12, 0.14, 0.18, 0.30]

HIGH_CORRUPT_THRESHOLD = 0.14


# -------------------------
# ROLE DISTRIBUTION (aligned with design)
# -------------------------

def assign_roles(n):
    tables = {
        3: ["COVEN", "COVEN", "HOLLOW"],
        4: ["COVEN", "COVEN", "COVEN", "HOLLOW"],
        5: ["COVEN", "COVEN", "COVEN", "HOLLOW", "HOLLOW"],
        6: ["COVEN", "COVEN", "COVEN", "COVEN", "HOLLOW", "HOLLOW"],
        7: ["COVEN", "COVEN", "COVEN", "COVEN", "HOLLOW", "HOLLOW", "HOLLOW"],
        8: ["COVEN", "COVEN", "COVEN", "COVEN", "COVEN", "HOLLOW", "HOLLOW", "HOLLOW"],
        9: ["COVEN", "COVEN", "COVEN", "COVEN", "COVEN", "HOLLOW", "HOLLOW", "HOLLOW", "HOLLOW"],
    }

    roles = tables[n][:]
    random.shuffle(roles)
    return roles


# -------------------------
# HELPERS
# -------------------------

def choose_performer(alive_ids):
    return random.choice(alive_ids)


def choose_ingredient(alignment, last_used=None):
    """Choose ingredient with cooldown constraint."""
    if alignment == "HOLLOW":
        pool = SAFE + NEUTRAL + CORRUPT + CORRUPT + CORRUPT
    else:
        pool = SAFE + SAFE + SAFE + NEUTRAL + CORRUPT
    
    # Filter out the last used ingredient (cooldown)
    if last_used is not None:
        pool = [val for val in pool if val != last_used]
    
    # If pool is empty (shouldn't happen), allow reuse
    if not pool:
        pool = [last_used] if last_used is not None else SAFE
    
    return random.choice(pool)


def compute_outcome(vals):
    s = sum(max(v, 0) for v in vals)
    denom = len(vals) * 0.3
    idx = max(0, min(1, s / denom))

    if idx < PURE_THRESHOLD:
        return "PURE", idx
    if idx < BACKFIRE_THRESHOLD:
        return "TAINTED", idx
    return "BACKFIRED", idx


def council_vote(alive_ids, players, suspicion):
    votes = []
    for voter in alive_ids:
        align = players[voter]["alignment"]
        others = [pid for pid in alive_ids if pid != voter]
        if not others:
            continue

        if align == "COVEN":
            target = max(others, key=lambda pid: suspicion[pid])
        else:
            coven_candidates = [pid for pid in others if players[pid]["alignment"] == "COVEN"]
            if coven_candidates:
                target = min(coven_candidates, key=lambda pid: suspicion[pid])
            else:
                target = random.choice(others)

        votes.append(target)

    if not votes:
        return random.choice(alive_ids)

    counter = Counter(votes)
    top_count = counter.most_common(1)[0][1]
    top_candidates = [pid for pid, count in counter.items() if count == top_count]
    return random.choice(top_candidates)


def maybe_exorcist_action(players, suspicion, exorcist_idx, exorcist_used, round_num, n):
    if exorcist_idx is None or exorcist_used or n < 7 or round_num < EXORCIST_MIN_ROUND:
        return players, exorcist_used, False, False, False

    if not players[exorcist_idx]["alive"]:
        return players, exorcist_used, False, False, False

    alive_ids = [i for i, p in enumerate(players) if p["alive"] and i != exorcist_idx]
    if not alive_ids:
        return players, exorcist_used, False, False, False

    target = max(alive_ids, key=lambda pid: suspicion[pid])
    if suspicion[target] < EXORCIST_SUSPICION_THRESHOLD:
        return players, exorcist_used, False, False, False

    attempted = True
    if players[target]["alignment"] == "HOLLOW":
        new_players = []
        for idx, player in enumerate(players):
            if idx == target:
                new_players.append({**player, "alignment": "COVEN", "infected": False, "cleansed": True})
            else:
                new_players.append(player)
        return new_players, True, attempted, True, False

    new_players = []
    for idx, player in enumerate(players):
        if idx == exorcist_idx:
            new_players.append({**player, "alive": False})
        else:
            new_players.append(player)
    return new_players, True, attempted, False, True


# -------------------------
# GAME LOOP
# -------------------------

def run_game(n):
    roles = assign_roles(n)
    players = [{
        "alive": True,
        "alignment": roles[i],
        "infected": False,
        "cleansed": False,
    } for i in range(n)]

    suspicion = [0.0 for _ in range(n)]
    last_ingredients = [None for _ in range(n)]  # Track last used ingredient per player
    extra_infected = 0

    exorcist_idx = None
    if n >= 7:
        coven_indices = [i for i, p in enumerate(players) if p["alignment"] == "COVEN"]
        if coven_indices:
            exorcist_idx = random.choice(coven_indices)
    exorcist_used = False

    rounds_played = 0
    pure_count = 0
    tainted_count = 0
    backfire_count = 0
    infection_count = 0
    ex_attempts = 0
    ex_hits = 0
    ex_suicides = 0

    round_num = 1

    while round_num <= MAX_ROUNDS:
        alive_ids = [i for i, p in enumerate(players) if p["alive"]]
        if len(alive_ids) <= 1:
            break

        alive_players = [players[i] for i in alive_ids]
        coven_alive = sum(1 for p in alive_players if p["alignment"] == "COVEN")
        hollow_alive = len(alive_players) - coven_alive

        if hollow_alive == 0:
            winner = "COVEN"
            break
        if hollow_alive >= coven_alive:
            winner = "HOLLOW"
            break

        performer = choose_performer(alive_ids)
        
        # Choose ingredients with cooldown constraint
        vals_by_player = {}
        for pid in alive_ids:
            ingredient = choose_ingredient(players[pid]["alignment"], last_ingredients[pid])
            vals_by_player[pid] = ingredient
            last_ingredients[pid] = ingredient  # Update last used
            
        outcome, idx = compute_outcome(list(vals_by_player.values()))

        rounds_played += 1
        if outcome == "PURE":
            pure_count += 1
        elif outcome == "TAINTED":
            tainted_count += 1
        else:
            backfire_count += 1

        for pid, val in vals_by_player.items():
            if val >= HIGH_CORRUPT_THRESHOLD:
                suspicion[pid] += 1.0
            elif val <= 0:
                suspicion[pid] -= 0.25

        if outcome == "BACKFIRED":
            players[performer]["alive"] = False

        if n >= 6 and INFECTION_START <= round_num <= INFECTION_END and extra_infected < MAX_EXTRA_INFECTED:
            infected_this_round = False

            if outcome == "TAINTED" and random.random() < INFECT_TAINTED:
                covens = [i for i, p in enumerate(players) if p["alive"] and p["alignment"] == "COVEN"]
                if covens:
                    target = random.choice(covens)
                    players[target]["alignment"] = "HOLLOW"
                    players[target]["infected"] = True
                    extra_infected += 1
                    infected_this_round = True

            if outcome == "BACKFIRED" and random.random() < INFECT_BACKFIRE:
                covens = [i for i, p in enumerate(players) if p["alive"] and p["alignment"] == "COVEN"]
                if covens:
                    target = random.choice(covens)
                    players[target]["alignment"] = "HOLLOW"
                    players[target]["infected"] = True
                    extra_infected += 1
                    infected_this_round = True

            if infected_this_round:
                infection_count += 1

        if players[performer]["alive"]:
            alive_ids = [i for i, p in enumerate(players) if p["alive"]]
            kill = council_vote(alive_ids, players, suspicion)
            players[kill]["alive"] = False

        players, exorcist_used, attempted, hit, suicide = maybe_exorcist_action(
            players, suspicion, exorcist_idx, exorcist_used, round_num, n
        )
        if attempted:
            ex_attempts += 1
        if hit:
            ex_hits += 1
        if suicide:
            ex_suicides += 1

        alive_players = [p for p in players if p["alive"]]
        coven_alive = sum(1 for p in alive_players if p["alignment"] == "COVEN")
        hollow_alive = len(alive_players) - coven_alive

        if hollow_alive == 0:
            winner = "COVEN"
            break
        if hollow_alive >= coven_alive:
            winner = "HOLLOW"
            break

        round_num += 1

    else:
        alive_players = [p for p in players if p["alive"]]
        coven_alive = sum(1 for p in alive_players if p["alignment"] == "COVEN")
        hollow_alive = len(alive_players) - coven_alive
        winner = "COVEN" if coven_alive > hollow_alive else "HOLLOW"

    return {
        "winner": winner,
        "rounds": rounds_played,
        "pure": pure_count,
        "tainted": tainted_count,
        "backfired": backfire_count,
        "infection_events": infection_count,
        "ex_attempts": ex_attempts,
        "ex_hits": ex_hits,
        "ex_suicides": ex_suicides,
    }


def run_sims():
    results = defaultdict(lambda: {"COVEN": 0, "HOLLOW": 0})
    stats = defaultdict(lambda: {
        "rounds": 0,
        "pure": 0,
        "tainted": 0,
        "backfired": 0,
        "infection_events": 0,
        "ex_attempts": 0,
        "ex_hits": 0,
        "ex_suicides": 0,
        "games": 0,
    })

    for n in range(3, 10):
        for _ in range(GAMES_PER_COUNT):
            game = run_game(n)
            winner = game["winner"]
            results[n][winner] += 1

            bucket = stats[n]
            bucket["rounds"] += game["rounds"]
            bucket["pure"] += game["pure"]
            bucket["tainted"] += game["tainted"]
            bucket["backfired"] += game["backfired"]
            bucket["infection_events"] += game["infection_events"]
            bucket["ex_attempts"] += game["ex_attempts"]
            bucket["ex_hits"] += game["ex_hits"]
            bucket["ex_suicides"] += game["ex_suicides"]
            bucket["games"] += 1

    for n in range(3, 10):
        cov = results[n]["COVEN"]
        hol = results[n]["HOLLOW"]
        total = cov + hol
        bucket = stats[n]
        games = bucket["games"] or 1

        print(f"\n== {n} players ==")
        print(f"Winrate -> Coven: {cov/total:.2f}, Hollow: {hol/total:.2f}")
        print(f"Avg rounds: {bucket['rounds']/games:.2f}")
        print(
            "Avg ritual outcomes per game: "
            f"pure {bucket['pure']/games:.2f}, "
            f"tainted {bucket['tainted']/games:.2f}, "
            f"backfired {bucket['backfired']/games:.2f}"
        )
        print(f"Avg infection events per game: {bucket['infection_events']/games:.2f}")
        print(
            "Exorcist (per game avg): "
            f"attempts {bucket['ex_attempts']/games:.2f}, "
            f"hits {bucket['ex_hits']/games:.2f}, "
            f"suicides {bucket['ex_suicides']/games:.2f}"
        )


if __name__ == "__main__":
    run_sims()
