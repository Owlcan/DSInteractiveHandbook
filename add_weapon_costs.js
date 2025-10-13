// Quick script to generate weapon cost data
// This adds base_cost to all weapon entries based on D&D 5e standards

const weaponCosts = {
  // Simple Melee
  "Club": 10,
  "Dagger": 200, 
  "Dart": 5,
  "Greatclub": 20,
  "Handaxe": 500,
  "Javelin": 50,
  "Light Hammer": 200,
  "Mace": 500,
  "Quarterstaff": 20,
  "Sickle": 100,
  "Spear": 100,
  "Kunai": 250,

  // Simple Ranged
  "Light Crossbow": 2500,
  "Shortbow": 2500,
  "Sling": 10,
  "Boomerang": 150,

  // Martial Melee
  "Battleaxe": 1000,
  "Flail": 1000,
  "Glaive": 2000,
  "Greataxe": 3000,
  "Greatsword": 5000,
  "Halberd": 2000,
  "Lance": 1000,
  "Longsword": 1500,
  "Maul": 1000,
  "Morningstar": 1500,
  "Pike": 500,
  "Rapier": 2500,
  "Scimitar": 2500,
  "Shortsword": 1000,
  "Trident": 500,
  "War Pick": 500,
  "Warhammer": 1500,
  "Whip": 200,
  "Wrist Blades": 5000,
  "Chakram": 3000,
  "Cestus": 200,
  "Scythe": 1800,
  "Katana": 5000,
  "Sai": 1500,

  // Martial Ranged
  "Hand Crossbow": 7500,
  "Heavy Crossbow": 5000,
  "Longbow": 5000,
  "Net": 300,
  "Repeating Crossbow": 10000,
  "Exploding Bolts Crossbow": 15000,
  "Harpoon Gun": 12000,
  "Heavy Repeating Crossbow": 18000,

  // Renaissance Firearms
  "Pistol": 25000,
  "Musket": 50000,
  "Blunderbuss": 30000,
  "Pepperbox": 35000,
  "Arquebus": 45000,
  "Hand Mortar": 75000,
  "Hand Cannon": 60000,

  // Modern Firearms
  "Revolver": 150000,
  "Shotgun": 200000,
  "Double-Barrel Shotgun": 180000,
  "Hunting Rifle": 300000,
  "Automatic Rifle": 800000,
  "Sniper Rifle": 500000,
  "Grenade Launcher": 1000000,
  "Flamethrower": 750000,

  // Magic/Futuristic
  "Eldritch Staff": 50000,
  "Crystal Focus Staff": 75000,
  "Energy Whip": 100000,
  "Plasma Blade": 250000,
  "Vibro Sword": 300000,
  "Gravity Hammer": 500000,
  "Photon Glaive": 400000,
  "Thermal Blade": 200000,
  "Quantum Dagger": 150000,
  "Laser Pistol": 500000,
  "Laser Rifle": 750000
};

console.log("Weapon costs ready to be added to the HTML file:");
for (const [name, cost] of Object.entries(weaponCosts)) {
  console.log(`"${name}": ${cost} GP`);
}