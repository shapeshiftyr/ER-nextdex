import { gameData } from "../data_version.js";
import { e } from "../utils.js";
import { getTypeEffectiveness } from "../weakness.js";

// All defensive abilities grouped by effect type
const defensiveAbilities = {
    // Immunity: nullify damage from type entirely
    immunity: {
        "Flash Fire": ["Fire"],
        "Sap Sipper": ["Grass"],
        "Volt Absorb": ["Electric"],
        "Lightning Rod": ["Electric"],
        "Motor Drive": ["Electric"],
        "Water Absorb": ["Water"],
        "Dry Skin": ["Water"],
        "Storm Drain": ["Water"],
        "Evaporate": ["Water"],
        "Levitate": ["Ground"],
        "Dragonfly": ["Ground"],
        "Mountaineer": ["Rock"],
        "Poison Absorb": ["Poison"],
        "Aerodynamics": ["Flying"],
        "Well Baked Body": ["Fire"],
        "Elemental Vortex": ["Fire", "Water"],
        "Justified": ["Dark"],
        "Ice Dew": ["Ice"],
        "Earth Eater": ["Ground"],
        "Hover": ["Ground"],
        "Aerialist": ["Ground"],
        "Imposing Wings": ["Ground"],
        "Desolate Sun": ["Ground", "Water"],
        "Reservoir": ["Water"],
        "Desolate Land": ["Water"],
        "Primordial Sea": ["Fire"],
        "Fey Flight": ["Ground"],
        "Radiance": ["Dark"],
        "Heat Sink": ["Fire"],
    },
    // Adds a defensive type
    addType: {
        "Phantom": "Ghost",
        "Metallic": "Steel",
        "Dragonfly": "Dragon",
        "Half Drake": "Dragon",
        "Ice Age": "Ice",
        "Grounded": "Ground",
        "Aquatic": "Water",
        "Turboblaze": "Fire",
        "Teravolt": "Electric",
        "Fairy Tale": "Fairy",
        "Aquatic Dweller": "Water",
        "Metallic Jaws": "Steel",
        "Bruiser": "Fighting",
        "Rocky Exterior": "Rock",
        "Lightning Born": "Electric",
        "Komodo": "Dragon",
        "Fey Flight": "Fairy",
        "Dead Bark": "Ghost",
        "Lightsaber": "Fire",
        "Hover": "Psychic",
        "Ominous Shroud": "Ghost",
        "Voltron": "Steel",
        "Waterborne": "Water",
        "Atlantic Ruler": "Water",
        "Draconic Might": "Dragon",
        "Dragonfruit": "Dragon",
        "Witch Broom": "Psychic",
        "Rock Armor": "Rock",
    },
    // Type-based multipliers: { ability: { type: multiplier } }
    typeMultipliers: {
        // x0.5 resists
        "Water Bubble": { "Fire": 0.5 },
        "Seaweed": { "Fire (if Grass-type)": 0.5 },
        "Heatproof": { "Fire": 0.5 },
        "Iron Giant": { "Fire": 0.5 },
        "Thick Fat": { "Fire": 0.5, "Ice": 0.5 },
        "Immunity": { "Poison": 0.5 },
        "Fossilized": { "Rock": 0.5 },
        "Raw Wood": { "Grass": 0.5 },
        "Water Compaction": { "Water": 0.5 },
        "Old Mariner": { "Fire": 0.5 },
        "Flame Bubble": { "Fire": 0.5 },
        "Deep Freeze": { "Fire": 0.5 },
        "Droideka": { "Fire": 0.5 },
        "Thermal Entropy": { "Fire": 0.5 },
        "Strong Foundation": { "Water": 0.5, "Ground": 0.5 },
        "Sumo Guard": { "Fire": 0.5, "Ice": 0.5 },
        "Tummyache": { "Fire": 0.5, "Ice": 0.5 },
        "Purifying Salt": { "Ghost": 0.5 },
        "Heavy Metal": { "Ghost": 0.5, "Dark": 0.5 },
        "Aegis Ward": { "Dark": 0.5, "Ghost": 0.5, "Psychic": 0.5 },
        "Elemental Aegis": { "Fire": 0.5, "Electric": 0.5, "Water": 0.5 },
        "Magma Armor": { "Water": 0.5, "Ice": 0.5 },
        "Hyper Cleanse": { "Poison": 0.5 },
        // x0.25 quad resists
        "Thick Blubber": { "Fire": 0.25, "Ice": 0.25 },
        // x2 weaknesses
        "Fluffy": { "Fire": 2 },
        "Puffy": { "Fire": 2 },
        "Liquified": { "Water": 2 },
        "Dry Skin": { "Fire": 2 },
        "Massive Pelt": { "Fire": 2 },
        // x4 weaknesses
        "Fluffiest": { "Fire": 4 },
    },
    // Damage category modifiers: { ability: { Physical, Special, Contact } multiplier }
    dmgCategory: {
        "Fur Coat": { Physical: 0.5 },
        "Apple Enlightenment": { Physical: 0.5 },
        "Prismatic Fur": { Physical: 0.5, Special: 0.5 },
        "Ice Scales": { Special: 0.5 },
        "Fire Scales": { Special: 0.5 },
        "Rainbow Scales": { Special: 0.5 },
        "Fluffy": { Contact: 0.5 },
        "Puffy": { Contact: 0.5 },
        "Massive Pelt": { Contact: 0.5 },
        "Liquified": { Contact: 0.5 },
        "Fluffiest": { Contact: 0.25 },
        "Ice Plumes": { Special: 0.5 },
        "Prism Scales": { Special: 0.7 },
        "Sand Guard": { "Special (in sand)": 0.5 },
        "Sun Basking": { "Physical (in sun)": 0.5 },
        // General damage reduction (all categories)
        "Dead Bark": { Physical: 0.85, Special: 0.85, Contact: 0.85 },
        "Rock Armor": { Physical: 0.9, Special: 0.9, Contact: 0.9 },
        "Battle Armor": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Shell Armor": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Dream State": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Crust Coat": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Parry": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Deflect": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Feathercoat": { Physical: 0.9, Special: 0.9, Contact: 0.9 },
        "Mucus Membrane": { Physical: 0.7, Special: 0.7, Contact: 0.7 },
        // Combos inheriting Shell Armor / Battle Armor (20% less)
        "Faraday Cage": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Toxic Shell": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Shattered Armor": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
        "Fortress": { Physical: 0.8, Special: 0.8, Contact: 0.8 },
    },
    // Stat boost when hit by type (informational only)
    statBoost: {
        "Cryo Architect": ["Water", "Ice"],
    },
    // Nullifies weakness to types (informational only)
    nullWeakness: {
        "Gifted Mind": ["Ghost", "Bug", "Dark"],
    },
    // Reduces super-effective damage (informational — affects all SE types)
    resistSE: {
        "Filter": 0.65,
        "Solid Rock": 0.65,
        "Prism Armor": 0.65,
        "Permafrost": 0.65,
        "Thick Skin": 0.65,
        "Flame Shield": 0.65,
        "Primal Armor": 0.5,
        "Refrigerator": 0.65,
        "Fortress": 0.65,
    },
};

// Build sorted list of all defensive ability names
function getAllDefensiveAbilityNames() {
    const names = new Set();
    for (const category of Object.values(defensiveAbilities)) {
        for (const name of Object.keys(category)) names.add(name);
    }
    return [...names].sort();
}

const defensiveAbilityNames = getAllDefensiveAbilityNames();

// Helper: collect values from a map category for selected abilities
function collectFromMap(category, abilities, collector) {
    for (const abi of abilities) {
        const val = category[abi];
        if (val) collector(val, abi);
    }
}

// Helper: get usable types (filter out None, Stellar, Mystery)
function getUsableTypes() {
    return gameData.typeT.filter(
        (t) => t !== "None" && t !== "Stellar" && t !== "Mystery",
    );
}

// --- Dropdown ---

const dropdownStates = {};

function closeAllDropdowns() {
    $(".tc-dropdown-list").hide();
    for (const id in dropdownStates) dropdownStates[id].isOpen = false;
}

function setupDropdown(btnId, options) {
    const btn = $(`#${btnId}`);
    const list = btn.next(".tc-dropdown-list");
    dropdownStates[btnId] = { isOpen: false };

    function buildList(filter) {
        const frag = document.createDocumentFragment();
        const query = (filter || "").toLowerCase();
        const currentValue = btn[0].dataset.value;
        for (const opt of options) {
            if (query && opt.value && !opt.label.toLowerCase().includes(query)) continue;
            const div = document.createElement("div");
            div.textContent = opt.label;
            div.dataset.value = opt.value;
            if (opt.value && opt.value === currentValue) div.className = "tc-dropdown-selected";
            div.onmousedown = (ev) => {
                ev.preventDefault();
                selectOption(opt);
            };
            frag.append(div);
        }
        list.empty();
        list[0].appendChild(frag);
    }

    function selectOption(opt) {
        btn.val(opt.label);
        btn[0].dataset.value = opt.value;
        close();
        btn[0].blur();
        updateReadonly();
        recalculate();
    }

    function open(filter) {
        closeAllDropdowns();
        buildList(filter);
        list.show();
        dropdownStates[btnId].isOpen = true;
    }

    function close() {
        list.hide();
        dropdownStates[btnId].isOpen = false;
    }

    function updateReadonly() {
        btn[0].readOnly = !btn[0].dataset.value;
    }

    buildList();
    updateReadonly();

    btn.off("focus").on("focus", () => {
        if (btn[0].readOnly) return;
        btn.val("");
        open("");
    });

    btn.off("input").on("input", () => open(btn.val()));

    btn.off("blur").on("blur", () => {
        close();
        const match = options.find((o) => o.value === btn[0].dataset.value);
        btn.val(match ? match.label : "-- None --");
    });

    btn.off("mousedown").on("mousedown", (ev) => {
        if (dropdownStates[btnId].isOpen) {
            ev.preventDefault();
            close();
            btn[0].blur();
            return;
        }
        if (btn[0].readOnly) {
            ev.preventDefault();
            btn[0].readOnly = false;
            btn.val("");
            btn[0].focus();
            open("");
        }
    });
}

// --- Init ---

export function populateTypeCalc() {
    const types = getUsableTypes();
    const typeOptions = types.map((t) => ({ label: t, value: t }));
    const noneOption = { label: "-- None --", value: "" };

    setupDropdown("typecalc-type1", typeOptions);
    $("#typecalc-type1").val(types[0]);
    $("#typecalc-type1")[0].dataset.value = types[0];

    setupDropdown("typecalc-type2", [noneOption, ...typeOptions]);
    $("#typecalc-type2")[0].dataset.value = "";

    const abiOptions = [noneOption, ...defensiveAbilityNames.map((n) => ({ label: n, value: n }))];
    for (let i = 0; i < 4; i++) {
        setupDropdown(`typecalc-abi${i}`, abiOptions);
        $(`#typecalc-abi${i}`)[0].dataset.value = "";
    }

    $(document).off("click.typecalc").on("click.typecalc", (ev) => {
        if (!$(ev.target).closest(".tc-dropdown-wrap").length) closeAllDropdowns();
    });

    recalculate();
}

// --- Calculation ---

function getSelectedAbilities() {
    const seen = new Set();
    const result = [];
    for (let i = 0; i < 4; i++) {
        const val = $(`#typecalc-abi${i}`)[0].dataset.value;
        if (val && !seen.has(val)) {
            seen.add(val);
            result.push(val);
        }
    }
    return result;
}

function recalculate() {
    const type1 = $("#typecalc-type1")[0].dataset.value;
    if (!type1) {
        $("#typecalc-result").empty();
        return;
    }
    const type2 = $("#typecalc-type2")[0].dataset.value || "";
    const defTypes = [type1];
    if (type2 && type2 !== type1) defTypes.push(type2);

    const abilities = getSelectedAbilities();

    // Collect added types
    const addedTypes = [];
    collectFromMap(defensiveAbilities.addType, abilities, (type) => {
        if (!defTypes.includes(type) && !addedTypes.includes(type)) addedTypes.push(type);
    });

    // Collect immunities
    const immuneTo = [];
    collectFromMap(defensiveAbilities.immunity, abilities, (types) => immuneTo.push(...types));

    // Collect type multipliers (resist, quad resist, weakness, weakness4x — all unified)
    const typeMults = {};
    collectFromMap(defensiveAbilities.typeMultipliers, abilities, (map) => {
        for (const [type, mult] of Object.entries(map)) {
            const baseType = type.split(" ")[0]; // "Fire (if Grass-type)" -> "Fire"
            typeMults[baseType] = (typeMults[baseType] || 1) * mult;
        }
    });

    // Calculate type effectiveness
    const allDefTypes = [...defTypes, ...addedTypes];
    const attackTypes = getUsableTypes();
    const coverage = {};

    for (const atkT of attackTypes) {
        let eff = 1;
        if (immuneTo.includes(atkT)) {
            eff = 0;
        } else {
            for (const defT of allDefTypes) {
                eff *= getTypeEffectiveness(atkT, defT);
            }
            if (typeMults[atkT] !== undefined) eff *= typeMults[atkT];
        }
        (coverage[eff] ??= []).push(atkT);
    }

    // Calculate Physical / Special / Contact damage multipliers
    const dmgMods = { Physical: 100, Special: 100, Contact: 100 };
    collectFromMap(defensiveAbilities.dmgCategory, abilities, (map) => {
        for (const [cat, mult] of Object.entries(map)) {
            if (dmgMods[cat] !== undefined) dmgMods[cat] *= mult;
        }
    });

    // Build ability effect summaries
    const abiEffects = buildAbiEffects(abilities);

    renderResult(coverage, defTypes, addedTypes, abiEffects, dmgMods);
}

// --- Effect Summary ---

// Each entry: [category key, formatter function]
const effectFormatters = [
    ["addType", (v) => `+${v} type`],
    ["immunity", (v) => `immune: ${v.join(", ")}`],
    ["statBoost", (v) => `stat boost: ${v.join(", ")}`],
    ["nullWeakness", (v) => `null weakness: ${v.join(", ")}`],
    ["typeMultipliers", (v) => Object.entries(v).map(([t, m]) => `x${m}: ${t}`).join(" | ")],
    ["dmgCategory", (v) => {
        const entries = Object.entries(v);
        const allSame = entries.length > 1 && entries.every(([, m]) => m === entries[0][1]);
        if (allSame) return `x${entries[0][1]}: All moves`;
        return entries.map(([cat, m]) => `x${m}: ${cat} moves`).join(" | ");
    }],
    ["resistSE", (v) => `x${v}: SE moves`],
];

function buildAbiEffects(abilities) {
    const results = [];
    for (const abi of abilities) {
        const effects = [];
        for (const [key, fmt] of effectFormatters) {
            const val = defensiveAbilities[key][abi];
            if (val) effects.push(fmt(val));
        }
        if (effects.length) results.push({ name: abi, effects });
    }
    return results;
}

// --- Render ---

function renderResult(coverage, baseTypes, addedTypes, abiEffects, dmgMods) {
    const container = $("#typecalc-result");
    container.empty();

    // Effective typing row
    const infoRow = e("div", "typecalc-info-row");
    for (const t of baseTypes) {
        const badge = e("div", `${t.toLowerCase()} type`);
        badge.append(e("span", "span-align", t));
        infoRow.append(badge);
    }
    for (const t of addedTypes) {
        const badge = e("div", `${t.toLowerCase()} type`);
        badge.append(e("span", "span-align", "+" + t));
        infoRow.append(badge);
    }
    container.append(infoRow);

    // Ability effect rows
    abiEffects.forEach((abi, i) => {
        const row = e("div", "typecalc-abi-info");
        row.append(e("div", "typecalc-abi-name color" + (i % 2 ? "A" : "B"), abi.name));
        row.append(e("div", "typecalc-abi-effects color" + (i % 2 ? "C" : "D"), abi.effects.join(" | ")));
        container.append(row);
    });

    // Physical / Special / Contact modifiers
    const modRow = e("div", "typecalc-dmg-mods");
    for (const cat of ["Physical", "Special", "Contact"]) {
        const pct = dmgMods[cat];
        const mod = e("div", "typecalc-dmg-mod");
        mod.append(e("div", "typecalc-dmg-label", cat));
        const valClass = pct < 100 ? "typecalc-dmg-val resist" : "typecalc-dmg-val";
        mod.append(e("div", valClass, Math.round(pct) + "%"));
        modRow.append(mod);
    }
    container.append(modRow);

    // Coverage rows
    const frag = document.createDocumentFragment();
    for (const mult of Object.keys(coverage).sort((a, b) => Number(a) - Number(b))) {
        const row = e("div", "typecalc-coverage-row");
        const mulDiv = e("div", "typecalc-coverage-mul");
        mulDiv.append(e("span", "span-align", mult));
        row.append(mulDiv);

        const typeList = e("div", "typecalc-coverage-list");
        for (const type of coverage[mult]) {
            const colorDiv = e("div", `${type.toLowerCase()} type`);
            colorDiv.append(e("span", "span-align", type.substr(0, 5)));
            typeList.append(colorDiv);
        }
        row.append(typeList);
        frag.append(row);
    }
    container.append(frag);
}
