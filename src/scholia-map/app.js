const regionMetadata = window.SCHOLIA_REGION_METADATA || {};
const fallbackRegionMetadata = window.SCHOLIA_FALLBACK_REGION_METADATA || {};
const ITEM_TERM_STOPWORDS = new Set(['ways']);
const REGION_ITEM_CARD_LIMIT = 8;
const BAKED_REGION_AREAS = [
  { title: 'Scholia Diaspros', coords: '3672,1926,3594,1952,3555,1998,3594,2037,3653,2069,3731,2056,3763,2011,3744,1946' },
  { title: 'Greensea Expanse', coords: '3514,1922,3529,1832,3546,1740,3553,1695,3523,1514,3718,1631,3793,1682,3864,1714,3936,1786,4040,1779,4143,1734,4221,1747,4319,1812,4410,1847,4319,1945,4215,2029,4228,2123,4280,2143,4377,2227,4436,2273,4585,2214,4689,2188,4734,2318,4630,2416,4468,2468,4338,2519,4273,2558,4111,2519,4066,2383,4014,2364,3936,2344,3871,2357,3786,2338,3741,2377,3689,2442,3598,2474,3507,2468,3494,2247,3462,2136,3436,2039,3475,1977' },
  { title: 'Lissome Plains', coords: '4846,2559,5060,2533,5222,2553,5216,2371,5222,2196,5158,1975,5080,1955,4898,2053,4697,1936,4684,1761,4561,1611,4412,1546,4159,1546,4022,1644,3802,1481,3575,1332,3517,1507,3957,1786,4065,1782,4162,1730,4266,1775,4340,1825,4431,1864,4565,1983,4610,2048,4669,2107,4697,2189,4736,2319,4671,2397,4671,2442' },
  { title: 'Sands of Perdu', coords: '3079,1984,3215,2003,3306,2062,3351,2172,3377,2334,3338,2438,3274,2484,3124,2523,3027,2594,2910,2627,2731,2619,2574,2674,2503,2587,2462,2509,2406,2543,2251,2528,2173,2435,2228,2341,2222,2224,2274,2140,2391,2081,2527,2023,2631,2062,2709,2127,2806,2133,2871,2075,2988,2016' },
  { title: 'The Glacial Domain', coords: '4838,3497,4799,3315,4611,3179,4540,3088,4397,2977,4273,2958,4079,2893,3910,2873,3767,2808,3650,2834,3520,2795,3436,2731,3397,2724,3267,2821,3189,2867,3092,2821,2955,2802,2754,2854,2689,2906,2650,3023,2495,3003,2306,3068,2118,3094,1943,3133,1761,3172,1566,3231,1358,3244,1229,3334,1110,3494' },
  { title: 'The Two Brothers Mountain Range', coords: '3578,1348,3567,1311,3542,1280,3458,1170,3283,1066,3192,975,3114,1001,2998,1092,2939,1202,2868,1313,2745,1365,2628,1365,2634,1280,2576,1202,2479,1144,2401,1183,2330,1274,2433,1384,2621,1462,2629,1533,2595,1605,2485,1676,2342,1793,2433,1852,2595,1845,2647,1910,2555,2023,2707,2116,2810,2127,2981,2012,3160,1975,3251,1981,3335,2066,3380,2209,3400,2339,3374,2423,3452,2442,3491,2391,3491,2235,3439,2027,3504,1923,3542,1767,3549,1683,3517,1514,3549,1417' },
  { title: 'The Nightshores', coords: '2069,1892,2148,1892,2211,1908,2266,1908,2329,1931,2384,1963,2408,2073,2558,2018,2653,1908,2589,1845,2432,1852,2345,1789,2416,1711,2290,1561,2227,1561' },
  { title: 'Hinterland', coords: '3354,2417,3276,2480,3118,2519,3031,2582,2905,2622,2731,2606,2558,2661,2503,2882,2479,2992,2645,3016,2684,2906,2747,2843,2944,2795,3102,2819,3181,2866,3410,2716,3441,2724,3528,2795,3646,2827,3764,2795,3883,2850,4096,2890,4182,2780,4103,2519,3827,2527,3693,2448,3496,2464,3496,2377,3449,2441,3410,2433' },
  { title: 'Darvitch', coords: '2392,2070,1974,2204,1888,2109,1943,1968,1990,1881,2069,1889,2140,1889,2381,1941' },
  { title: 'Dawnshore', coords: '2164,2437,2243,2532,2392,2540,2455,2508,2542,2650,2463,2997,2282,3060,2172,3076,1911,2966,1833,2713,1809,2587,1982,2477' },
  { title: 'Stormveil Dominion', coords: '3299,274,3205,259,3047,337,2921,306,2905,468,3000,613,3165,527,3260,582,3354,598,3457,574,3488,429,3394,358' },
  { title: 'Heraldia', coords: '3686,471,3654,550,3583,582,3512,629,3504,692,3567,747,3678,739,3780,755,3875,732,3914,661,4001,668,4182,676,4261,605,4238,542,4111,464,3977,456,3851,408,3741,456' },
  { title: 'Bay Of Blitz', coords: '3815,760,3847,883,3854,955,3971,952,4100,961,4119,1048,4111,1104,3993,1104,3898,1104,3821,987,3711,994,3614,1039,3458,1162,3575,1331,3633,1377,3776,1461,3841,1506,3932,1565,4029,1643,4107,1578,4172,1500,4438,1487,4491,1395,4509,1260,4522,1175,4496,1071,4626,1065,4704,1065,4820,1052,4797,954,4750,907,4522,851,4261,851,4206,780,4152,682,3919,656,3880,734' },
  { title: 'County Majicka', coords: '4395,1859,4230,2016,4230,2087,4243,2131,4427,2277,4687,2182,4655,2080,4529,1945,4450,1890' },
  { title: 'The Jagged Sea', coords: '5050,2839,4965,2877,4868,2855,4813,2887,4750,2855,4671,2918,4600,2950,4498,2981,4458,3021,4545,3084,4616,3186,4805,3320,4851,3498,5573,3498,5586,3344,5491,3068,5423,2840,5599,2723,5339,2632' },
  { title: 'Mouth of Colra', coords: '5412,2836,5649,2694,5846,2623,6201,2734,6374,2907,6398,3104,6319,3301,6154,3388,5878,3443,5696,3427,5586,3333' },
  { title: 'Hibernating Ecoliee', coords: '5436,534,5357,613,5444,676,5507,598' },
  { title: 'The Three Sisters Mountains', coords: '3780,2345,3688,2438,3815,2532,4109,2516,4056,2372,3925,2332' },
  { title: 'Eastersea', coords: '4866,878,4827,1229,4860,1397,4944,1501,4938,1683,5067,1748,5236,1826,5145,1962,5216,2203,5216,2573,5573,2729,5839,2618,6228,2755,6377,2904,6656,2625,6579,2359,6533,2131,6520,1910,6520,1456,6326,1027,6137,768,5969,1034,5833,975,5696,884,5495,878,5197,910' },
  { title: 'The Westerseam', coords: '461,3499,481,2890,454,2817,416,2670,429,2274,636,2112,714,1807,669,1512,740,1272,617,1362,351,1357,318,896,662,623,694,794,727,1019,772,1180,837,1141,902,850,1064,746,1168,622,1090,415,1161,370,1110,246,1168,0,1369,12,1311,320,1395,391,1505,363,1616,261,1758,177,1778,285,1798,353,1856,378,1869,307,2038,255,2115,255,2121,375,1914,453,1791,453,1616,487,1518,479,1408,537,1304,615,1174,765,986,1012,934,1203,1019,1415,999,1623,876,1753,772,1961,714,2324,630,2616,714,2766,824,2876,707,3103,818,3214,818,3331,785,3493' },
  { title: 'Gildermount', coords: '2317,1268,2128,1177,2012,1281,1875,1437,1888,1573,1953,1658,2167,1541,2232,1554,2291,1554,2427,1710,2576,1599,2615,1469,2440,1372' },
  { title: 'Elzbereth', coords: '2330,1123,2634,1123,2634,1416,2330,1416' },
  { title: 'Westersea', coords: '2167,3072,1908,2968,1798,2585,2154,2423,2219,2339,2219,2215,2265,2144,2401,2069,1979,2189,1895,2085,1986,1880,2077,1878,2232,1530,1960,1644,1882,1566,1882,1419,2115,1183,2330,1254,2394,1176,2492,1131,2570,1183,2628,1254,2634,1352,2758,1358,2861,1306,2926,1189,2998,1079,3095,1014,3192,975,3022,628,2907,468,2940,109,2143,168,2109,364,1901,442,1610,474,1506,468,1318,578,974,994,928,1208,1013,1403,993,1604,870,1727,773,1929,624,2601,701,2750,805,2854,695,3101,805,3192,792,3484,1104,3497,1227,3328,1363,3244,1551,3224' },
  { title: 'Niolantea', coords: '4645,1153,4580,1244,4580,1426,4587,1497,4775,1614,4937,1673,4944,1491,4859,1380,4827,1205' },
  { title: 'Maristannio', coords: '4100,967,4107,1103,3906,1116,3847,1012,3893,954' },
  { title: 'Faermeadows', coords: '4113,2527,4178,2774,4094,2891,4282,2962,4386,2968,4451,3020,4567,2955,4665,2917,4742,2858,4801,2884,4879,2852,4982,2865,5047,2832,5339,2637,5151,2533,4853,2559,4678,2442,4658,2384,4626,2417,4340,2507,4269,2559' },
  { title: 'The World Gash', coords: '4587,2,4535,424,4645,586,4827,593,5047,716,5119,619,4989,554,4892,482,4794,385,4768,314,4665,-5' },
  { title: 'Cape of Sunrise', coords: '4684,1761,4931,1676,5222,1819,5145,1962,5086,1955,4898,2059,4697,1929' },
  { title: 'The Easterseam', coords: '4995,429,4969,487,5005,543,5108,621,5158,578,5248,532,5338,609,5435,528,5475,526,5501,597,5482,662,5443,682,5342,621,5203,721,5158,747,5034,740,5041,805,5112,864,5171,870,5248,864,5359,838,5411,857,5501,857,5625,857,5676,870,5839,968,5975,1026,6137,766,6332,1000,6520,1435,6533,2104,6649,2604,6383,2896,6409,3130,6656,3487,7071,3461,7065,3013,7116,2162,6902,1864,6760,1318,6649,909,6487,630,6351,351,6267,136,6228,19,6007,13,6027,156,6020,312,5774,299,5696,188,5579,201,5521,312,5398,292,5294,292,5248,396,5145,422' },
];
const DEFAULT_ATLAS_RESOURCE_SOURCES = [
  { type: 'map', label: 'Baked atlas polygons', source: 'src/scholia-map/app.js' },
  { type: 'metadata', label: 'Inline region metadata', source: 'src/data/scholia-map/regionMetadata.js' },
  { type: 'items', label: 'Item viewer runtime', source: 'src/data/allData.js' },
  { type: 'items-viewer', label: 'Item browser applet', source: 'src/items.html' },
  { type: 'monsters', label: 'Embedded atlas bestiary seed', source: 'src/scholia-map/app.js' },
  { type: 'monsters-viewer', label: 'Bestiary applet', source: 'bestiary.html' },
];
const MUSIC_FILE_OVERRIDES = {
  'where things holy dwelt': 'Where Things Holy Dwelt_converted.mp3',
  'barren rendered': 'Barren Rendered(1).mp3',
};
const WORLD_MAP_MUSIC_BASE = 'src/assets/audio/World%20Map%20Music/';
const MEDIA_READINESS_ENABLED = false;
const BAKED_MEDIA_MANIFEST = createInlineMediaManifest();
const BAKED_BESTIARY = [
  {
    name: 'Dark Dimension Auditarch',
    description: 'Medium Humanoid, domineering evil',
    race: 'Humanoid',
    size: 'Medium',
    crStr: '11',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/annapasted-image_bria.png',
    environment: '',
  },
  {
    name: 'Shadow Slimepress',
    description: 'The Shadow Slimepress is an arrogant and tyrannical monarch of the deep. This massive ooze rules over a grotesque court of ooze-kin with an oppressive, corrosive presence. Its shifting form and psychic decrees subdue all who defy its orders.',
    race: 'Ooze',
    size: 'Large',
    crStr: '10',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Pacifier Golem',
    description: 'Large construct, unaligned',
    race: 'construct',
    size: 'Large',
    crStr: '5',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Night-Mare Shadowstorm',
    description: 'A towering evolution of the Darkling-Ossuite Charger, she embodies both savage brutality and an almost otherworldly allure-her presence on the battlefield is as mesmerizing as it is deadly.',
    race: 'Variant Darkling-Ossuite Charger Omega',
    size: 'Large',
    crStr: '9',
    imageUrl: 'https://ik.imagekit.io/owlcan/night-mare.png',
    environment: 'Shadowy Plains, Underdark, Battlefields',
  },
  {
    name: 'Darkforme Abyssal Leviathan',
    description: 'Gargantuan abomination, ancient dread',
    race: 'abomination',
    size: 'Gargantuan',
    crStr: '15',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Lakeopus Rex',
    description: 'Huge abomination, ancient evil',
    race: 'Abomination',
    size: 'Huge',
    crStr: '10',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/lakeopus_rex.png',
    environment: '',
  },
  {
    name: 'Dark Dimension Changebot',
    description: 'Medium construct, lawful evil',
    race: 'construct',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Primordial Bottle Beast',
    description: 'Large elemental, chaotic neutral',
    race: 'elemental',
    size: 'Large',
    crStr: '4',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Lost Plushie',
    description: 'Tiny construct, unaligned',
    race: 'construct',
    size: 'Tiny',
    crStr: '1/8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkling-Ghostiby',
    description: 'Small monstrosity, chaotic evil',
    race: 'monstrosity',
    size: 'Small',
    crStr: '1/4',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Bottle Elemental',
    description: 'Medium elemental, neutral',
    race: 'elemental',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkling-Hooter',
    description: 'Tiny abomination, a cute yet annoying hooter whose gutwrenching call shakes nerves.',
    race: 'Abomination',
    size: 'Tiny',
    crStr: '1/8',
    imageUrl: 'https://i.postimg.cc/br86ctwG/darkling-hooter.png',
    environment: 'Urban/Shady',
  },
  {
    name: 'Darkforme River Tyrant',
    description: 'Large abomination, dominating evil',
    race: 'abomination',
    size: 'Large',
    crStr: '5',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkaconda',
    description: 'Huge abomination, a colossal serpentine dark serpent whose abyssal form can crush, devour, and lunge forth from the shadows with terrifying reach.',
    race: 'Abomination',
    size: 'Huge',
    crStr: '4',
    imageUrl: 'https://i.postimg.cc/GhgjzNGT/darkaconda.png',
    environment: 'Nightmarish Swamp',
  },
  {
    name: 'Darkling Liquid Legion',
    description: 'Medium ooze, chaotic evil',
    race: 'ooze',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Nightpinyon',
    description: 'Medium abomination, a larger and aggressive hooter whose piercing, debilitating peck leaves foes breathless-and reactionless.',
    race: 'Abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/Z51xzdfT/darkforme-nightpinyon.png',
    environment: 'High Skies',
  },
  {
    name: 'Darkling-Slitherscale',
    description: 'Small abomination, a sinuous reptilian darkling whose shimmering scales ripple as it slithers silently.',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://i.postimg.cc/NFgxPvdm/darkling-slitherscale.png',
    environment: 'Swamp/Shadow',
  },
  {
    name: 'Darkforme Mire-Croaker',
    description: 'Medium abomination, croaking evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '1',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkling Pond-Skulker',
    description: 'Small abomination, thieving evil',
    race: 'abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Sky-Darkener Nightveil',
    description: 'Large abomination, a majestic aerial predator rumored to have inspired umbral raven forms. With perfect flight and lethal swoop-and-dive tactics, it dominates the heavens.',
    race: 'Abomination',
    size: 'Large',
    crStr: '5',
    imageUrl: 'https://i.postimg.cc/90JY6gkS/sky-darkener-nightveil.png',
    environment: 'Open Skies',
  },
  {
    name: 'Darkling-Ossokin',
    description: 'Tiny abomination, a small little bone guy with an annoying shin-smacking attack that falls apart when defeated. Occasionally, its scattered bones reassemble-if not consecrated-minutes later.',
    race: 'Abomination',
    size: 'Tiny',
    crStr: '1/8',
    imageUrl: 'https://i.postimg.cc/wTwwZ38v/darkling-ossokin.png',
    environment: 'Haunted Crypts',
  },
  {
    name: 'Forgotten Rattle',
    description: 'Small construct, unaligned',
    race: 'construct',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Suffocator',
    description: 'Medium abomination, a grotesque creature with elongated, enveloping limbs that suffocate its prey with a crushing grip.',
    race: 'Abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/GtQXcm4X/darkforme-suffocator.png',
    environment: 'Damp Ruins',
  },
  {
    name: 'Darkling-Ticklefinger',
    description: 'Small monstrosity, mischievous evil',
    race: 'monstrosity',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkling-Cactine-Biggo-Boy',
    description: 'Small abomination, a chunkier, delightfully round cactus creature whose smooth exterior hides microcrystalline spines. Quick-footed and mischievous, it combines the call for backup of its kin with a painful, restraining embrace.',
    race: 'Abomination',
    size: 'Small',
    crStr: '1',
    imageUrl: 'https://i.postimg.cc/BZcY5Mm2/darkling-cactine-biggo-boy.png',
    environment: 'Desert/Arid',
  },
  {
    name: 'Darkforme-Ossokin-Aegisite',
    description: 'Medium bone golem abomination with a large build. Its fearsome, unliving bulk forms an unyielding defensive bulwark on the battlefield.',
    race: 'Abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/VNnBfkTX/darkforme-ossokin-aegisite.png',
    environment: 'Ancient Crypts',
  },
  {
    name: 'Darkling River-Lurk',
    description: 'Small abomination, slithering evil',
    race: 'abomination',
    size: 'Small',
    crStr: '1/4',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkling Weed-Tangler',
    description: 'Medium abomination, ensnaring evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '1',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkforme-Spinebearer',
    description: 'Medium abomination, a bristling cactus menace with brutal spike attacks and a lethal grappling maneuver called Heel !Lucha!',
    race: 'Abomination',
    size: 'Medium',
    crStr: '3',
    imageUrl: 'https://i.postimg.cc/C5LjsHK4/darkforme-spinebearer.png',
    environment: 'Desert/Arid',
  },
  {
    name: 'Shadow Babysitter',
    description: 'Medium fey, neutral evil',
    race: 'fey',
    size: 'Medium',
    crStr: '4',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkling-Ossuite Charger',
    description: 'Large centauroid abomination darkling with four-legged speed and a bow that fires arrow-tipped tendrils. Those struck must succeed on a saving throw or be grappled by the sticky tendrils, which attach with 10 HP and an AC of 8.',
    race: 'Abomination',
    size: 'Large',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/yNZnDPJg/darkling-ossuite-charger.png',
    environment: 'Battlefields',
  },
  {
    name: 'Darkling-Cactine',
    description: 'Small abomination, a whimsical cactus creature that unexpectedly calls for help with its backup spines.',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://i.postimg.cc/1tDWjHsh/darkling-cactine.png',
    environment: 'Desert/Arid',
  },
  {
    name: 'Darkforme Current-Snapper',
    description: 'Medium abomination, lurking evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkforme Punishment Maid',
    description: 'Medium monstrosity, lawful evil',
    race: 'monstrosity',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme Mud-Gnasher',
    description: 'Medium abomination, territorial evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '1',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkform Enforcer',
    description: 'Large abomination, salty evil',
    race: 'Abomination',
    size: 'Large',
    crStr: '5',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Enforcer.png',
    environment: '',
  },
  {
    name: 'Darkling-Ossokin-Proselyte',
    description: 'A small, skeletal abomination support creature, its form composed of formless black and smoky miasmic condensate. This eerie being channels divine energy to aid its ossuite and ossokin allies. Its uncanny, bone-like structure belies its cleric abilities, and it wields a handful of divine spells - including the cantrip Spontaneous Accident - to bolster its kin in battle.',
    race: 'Abomination',
    size: 'Small',
    crStr: '1',
    imageUrl: 'https://i.postimg.cc/kgDTm9qy/darkling-ossokin-proselyte.png',
    environment: 'Shadowy Crypts',
  },
  {
    name: 'Crawling Onesie',
    description: 'Medium construct, unaligned',
    race: 'construct',
    size: 'Medium',
    crStr: '1',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Ossuarian',
    description: 'Huge abomination-a living ossuary formed by countless ossuite remains fused into a massive, lumbering bone monster. It shuffles slowly along the floor, exuding a pants-crapping fear presence. Its hideous body carries brutal melee attacks reminiscent of lesser ossuite kin, and it wields an array of dark, divine spells that combine arcane and clerical power. Once per day, it can teleport to a new space, forcing all in its wake to contend with a crushing, pinning avalanche of bones.',
    race: 'Abomination',
    size: 'Huge',
    crStr: '7',
    imageUrl: 'https://i.postimg.cc/9M2Prj5K/Darkforme-Ossuarian.png',
    environment: 'Haunted Catacombs',
  },
  {
    name: 'Darkling Murkfin Swarmer',
    description: 'Tiny abomination, numerous evil',
    race: 'abomination',
    size: 'Tiny',
    crStr: '1/4',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkling Angler-Lurk',
    description: 'Small abomination, deceptive evil',
    race: 'abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkling-Ossuite Charger Omega',
    description: 'A larger, more fearsome evolution of the Darkling-Ossuite Charger, this massive centauroid abomination uses its lance to deadly effect. It charges in a devastating line attack, trampling through foes, and can unleash shadowy tendrils to entangle and slow its enemies. Writhing black miasma flows over its skeletal, shadowy frame, forming a grotesque yet awe-inspiring presence.',
    race: 'Abomination',
    size: 'Large',
    crStr: '6',
    imageUrl: 'https://i.postimg.cc/Jh67Phkj/Comfy-UI-00880.png',
    environment: 'Battlefields',
  },
  {
    name: 'Darkling-Bellowbelly',
    description: 'Medium abomination, wailing evil',
    race: 'Abomination',
    size: 'Medium',
    crStr: '1',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Bellowbelly.png',
    environment: '',
  },
  {
    name: 'Sentient Crib',
    description: 'Large construct, neutral',
    race: 'construct',
    size: 'Large',
    crStr: '3',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Shade-Sneak',
    description: 'Small abomination, stalking evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Shadow-Lurker.png',
    environment: '',
  },
  {
    name: 'Regression Fog',
    description: 'Large ooze, unaligned',
    race: 'ooze',
    size: 'Large',
    crStr: '5',
    imageUrl: '',
    environment: '',
  },
  {
    name: "Chap'Hell",
    description: 'Huge abomination-a living ossuary formed by countless ossuite remains fused into a massive, lumbering bone monster. It shuffles slowly along the floor, exuding a pants-crapping fear presence. Its hideous body carries brutal melee attacks reminiscent of lesser ossuite kin, and it wields an array of dark, divine spells that combine arcane and clerical power. Once per day, it can teleport to a new space, forcing all in its wake to contend with a crushing, pinning avalanche of bones.',
    race: 'Abomination',
    size: 'Huge',
    crStr: '14',
    imageUrl: 'https://ik.imagekit.io/owlcan/chaphell.png',
    environment: 'Haunted Catacombs',
  },
  {
    name: 'Darkforme Titan-Snapper',
    description: 'Huge abomination, ancient evil',
    race: 'abomination',
    size: 'Huge',
    crStr: '8',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkforme Nightsipper',
    description: 'A bulbous, fast-flying mid-boss darkling ooze known as the Darkforme Nightsipper. It regenerates by drinking from foes and unleashes a terrifying brown-note screech that incapacitates and instills fear.',
    race: 'Ooze',
    size: 'Large',
    crStr: '4',
    imageUrl: 'https://ik.imagekit.io/owlcan/thin%20and%20decrepit%20shadow%20monster%20bat%20oozing%20black%20goo%20and%20slime%20from%20its%20emaciated%20form%20with%20diaphan1.png',
    environment: 'Twisted Skies',
  },
  {
    name: 'Diaper Dimension Rift',
    description: 'Large aberration, chaotic evil',
    race: 'aberration',
    size: 'Large',
    crStr: '10',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Sleek-Lurker Pack Alpha',
    description: 'Medium abomination, stalking evil',
    race: 'Abomination',
    size: 'Medium',
    crStr: '1',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Shadow-Lurker%20Pack%20Alpha.png',
    environment: '',
  },
  {
    name: 'Darkforme Pike-Maw',
    description: 'Medium abomination, sudden evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Weirdling-Paralurker',
    description: 'Small abomination, unsettling evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1',
    imageUrl: 'https://i.postimg.cc/sDgcYyQR/weirdling-paralurker.png',
    environment: '',
  },
  {
    name: 'Dark Dimension Regressor Field',
    description: 'Large aberration, lawful evil',
    race: 'aberration',
    size: 'Large',
    crStr: '6',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Ossuarian',
    description: 'Huge abomination-a living ossuary formed by countless ossuite remains fused into a massive, lumbering bone monster. It shuffles slowly along the floor, exuding a pants-crapping fear presence. Its hideous body carries brutal melee attacks reminiscent of lesser ossuite kin, and it wields an array of dark, divine spells that combine arcane and clerical power. Once per day, it can teleport to a new space, forcing all in its wake to contend with a crushing, pinning avalanche of bones.',
    race: 'Abomination',
    size: 'Huge',
    crStr: '7',
    imageUrl: 'https://i.postimg.cc/9M2Prj5K/Darkforme-Ossuarian.png',
    environment: 'Haunted Catacombs',
  },
  {
    name: 'Darkling Gloom-Newt',
    description: 'Medium abomination, disorienting evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '1/2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkling-Hungerer',
    description: 'Medium abomination, frail and insatiably hungry',
    race: 'Abomination',
    size: 'Medium',
    crStr: '1/2',
    imageUrl: 'https://i.postimg.cc/rFVhfxH3/darkling-hungerer.png',
    environment: '',
  },
  {
    name: 'Darkling Rill-Skitter',
    description: 'Small abomination, skittering evil',
    race: 'abomination',
    size: 'Small',
    crStr: '1/4',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Darkforme-Hungore',
    description: 'Large abomination, a menacing mid-boss with a voracious maw',
    race: 'Abomination',
    size: 'Large',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/RZ3LYRLs/darkforme-hungore.png',
    environment: '',
  },
  {
    name: 'Darkling Blood-Gorger',
    description: 'Small abomination, draining evil',
    race: 'abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Dark Dimension Matronbot',
    description: 'Large Nannybot, authoritarian evil',
    race: 'Nannybot',
    size: 'Large',
    crStr: '5',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/matronbot_bria.png',
    environment: '',
  },
  {
    name: 'Nightmare Lullaby',
    description: 'Medium fey, neutral evil',
    race: 'fey',
    size: 'Medium',
    crStr: '7',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Deranged Diaper-check Bot',
    description: 'Medium Nannybot, annoying evil',
    race: 'Nannybot',
    size: 'Medium',
    crStr: '1/8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Teddy Abomination',
    description: 'Large monstrosity, chaotic evil',
    race: 'monstrosity',
    size: 'Large',
    crStr: '6',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme Current-Drifter',
    description: 'Medium abomination, shocking evil',
    race: 'abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: 'Aquatic',
  },
  {
    name: 'Dark Dimension Nannybot Bratnapper',
    description: 'Medium Nannybot, mischievous evil',
    race: 'Nannybot',
    size: 'Medium',
    crStr: '1',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/nannybot.jpg',
    environment: '',
  },
  {
    name: 'Darkling-Shark',
    description: 'Medium abomination, a stealthy aquatic predator with a predatory grin',
    race: 'Abomination',
    size: 'Medium',
    crStr: '1',
    imageUrl: 'https://i.postimg.cc/qRcLLvxp/darkling-shark.png',
    environment: 'Aquatic',
  },
  {
    name: 'Darkforme-Shark',
    description: 'Large abomination, a twisted aquatic predator with crab legs and an unsettling presence',
    race: 'Abomination',
    size: 'Large',
    crStr: '3',
    imageUrl: 'https://i.postimg.cc/ZRL8NDJR/darkforme-shark.png',
    environment: 'Aquatic/Land',
  },
  {
    name: 'Crying Starmass',
    description: 'Huge aberration, chaotic neutral',
    race: 'aberration',
    size: 'Huge',
    crStr: '9',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Temporal Crib Guardian',
    description: 'Large construct, lawful neutral',
    race: 'construct',
    size: 'Large',
    crStr: '8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Dream Stealer',
    description: 'Medium fey, neutral evil',
    race: 'fey',
    size: 'Medium',
    crStr: '8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Dark Dimension Trainee Auditor',
    description: 'Medium Humanoid, lawful evil',
    race: 'Humanoid',
    size: 'Medium',
    crStr: '3',
    imageUrl: 'https://ik.imagekit.io/owlcan/ComfyUI_02438_.png',
    environment: '',
  },
  {
    name: 'Darkling-Nightshade Elemental',
    description: 'Medium elemental abomination, a shadowy presence that instills fear with its eerie, whispering darkness',
    race: 'Elemental',
    size: 'Medium',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/x17tj7dV/darkling-nightshade-elemental.png',
    environment: 'Shadowy',
  },
  {
    name: 'Darkforme Overwatch',
    description: '',
    race: 'Abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkforme-Overwatch.png',
    environment: '',
  },
  {
    name: 'Darkforme-Cavesweller',
    description: 'Large abomination, brooding evil',
    race: 'Abomination',
    size: 'Large',
    crStr: '3',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Cavesweller.png',
    environment: '',
  },
  {
    name: 'Darkling-Yowler',
    description: 'Small abomination, wailing evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkling%20Yowler.png',
    environment: '',
  },
  {
    name: 'Darkling-Caller',
    description: 'Small abomination, wheezing evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/4',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkling%20Caller.png',
    environment: '',
  },
  {
    name: 'Darkling-Lurker',
    description: 'Small abomination, sad evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkling%20Lurker.png',
    environment: '',
  },
  {
    name: 'Darkling-Brackling',
    description: 'Medium abomination, brackish evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Brackling.png',
    environment: '',
  },
  {
    name: 'Darkling-Slurper',
    description: 'Small abomination, hungy evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkling%20Slurper.png',
    environment: '',
  },
  {
    name: 'Dark Dimension Project Auditor',
    description: 'Medium Humanoid, lawful evil',
    race: 'Humanoid',
    size: 'Medium',
    crStr: '7',
    imageUrl: 'https://ik.imagekit.io/owlcan/projectauditor.png',
    environment: 'Any,',
  },
  {
    name: 'Darkling Bellowbelly Cubling',
    description: 'Small abomination, squeaky evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/4',
    imageUrl: 'https://ik.imagekit.io/owlcan/Monsters/Darkling%20Cubling.png',
    environment: '',
  },
  {
    name: 'The Darkformless',
    description: 'Medium abomination elemental mage wielding both shadow and non-elemental magic in unsettling ways',
    race: 'Abomination Elemental Mage',
    size: 'Medium',
    crStr: '4',
    imageUrl: 'https://i.postimg.cc/v8zhxDmz/the-darkformless.png',
    environment: 'Urban/Shadowed',
  },
  {
    name: 'Darkling-Paralurker',
    description: 'Small abomination, gliding evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1/2',
    imageUrl: 'https://i.postimg.cc/ydCjcZ9f/darkling-paralurker.png',
    environment: '',
  },
  {
    name: 'Voravenor: Hungore-Absolutor',
    description: 'A colossal blackened mass of bone and sinew, missing its legs and lashed together with inky black ooze. Voravenor rises from a massive bottomless bone pit of darkling biomass, its massive ventral maw gaping hungrily. Its two baleful eyes maintain a Shroud of Black Dread, which must be dispelled by blinding or destroying them to reveal its vulnerability to radiant light.',
    race: 'Abomination',
    size: 'Colossal+',
    crStr: '13',
    imageUrl: 'https://ik.imagekit.io/owlcan/voravenor.webp',
    environment: 'Bottomless Pit, Cavern',
  },
  {
    name: 'Nightmare Sire Reaver',
    description: 'A crown-bound juggernaut of shadow and bone, the Sire Reaver is the perfected warform of the Darkling-Ossuite line - a predator-warlord whose very advance unravels ranks. His every stride is a storm of iron hooves and soul-rending will, and the fall of the Crown of Tyranny marks the moment the battle turns desperate for all who stand before him.',
    race: 'Variant Darkling-Ossuite Charger Omega',
    size: 'Huge',
    crStr: '14',
    imageUrl: 'https://ik.imagekit.io/owlcan/Pagematerials/sire_reaver.png',
    environment: 'Shadowy Plains, Underdark, Battlefields',
  },
  {
    name: 'Lurker Primogenitor',
    description: 'Medium abomination, cunning evil',
    race: 'Abomination',
    size: 'Medium',
    crStr: '4',
    imageUrl: '',
    environment: 'Cellarways',
  },
  {
    name: 'Darkling Gourdling',
    description: 'Small abomination, chaotic evil',
    race: 'Abomination',
    size: 'Small',
    crStr: '1',
    imageUrl: '',
    environment: 'Any',
  },
  {
    name: 'Darkforme Gourd Lord',
    description: 'Medium abomination, cunning evil',
    race: 'Abomination',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: 'Any',
  },
  {
    name: 'Ossokin Apostlyte',
    description: 'A weedy skeletal warrior, small in stature but burning with a fanatical necrotic zeal. Resembling a stunted paladin, it wears a patchwork of rib-cage plate armor and wields a weapon too large for its frame. Alone it is pitiful, but among fellow Ossokin its conviction hardens into tangible defense.',
    race: 'Abomination',
    size: 'Small',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/placeholder/apostlyte.png',
    environment: 'Shadowy Crypts',
  },
  {
    name: 'Ossokin Declaryte',
    description: 'A gaunt, robed figure that acts as a herald for the Ossuite forces. It carries a scroll of skin and a jagged bone dagger. It does not fight with strength, but with a screeching, mocking voice that demoralizes enemies and bolsters the undead. Its padding is merely bunched ceremonial rags.',
    race: 'Abomination',
    size: 'Medium',
    crStr: '2',
    imageUrl: 'https://i.postimg.cc/placeholder/declaryte.png',
    environment: 'Shadowy Crypts',
  },
  {
    name: 'Ossokin Vestal',
    description: 'The Ossokin Vestal is a parody of a shrine maiden, wrapped in excessively thick, quilted white vestments. She carries a broom that is actually a three-pronged bone trident. Bratty, demanding, and volatile, she channels divine necrotic energy through petulant rites and punishing smites.',
    race: 'Abomination',
    size: 'Medium',
    crStr: '3',
    imageUrl: 'https://i.postimg.cc/placeholder/vestal.png',
    environment: 'Shadowy Crypts',
  },
  {
    name: 'Ossokin Bonesinger',
    description: 'An Ossokin Bonesinger is a small, skeletal figure that hums with a vibrating, unnerving resonance. Unlike the mindless clicking of others, it produces a melodic, grinding drone by rubbing its ribs together. It is fragile, but its song knits its bones back together as fast as they are shattered, unless purified by light or fire.',
    race: 'Abomination',
    size: 'Small',
    crStr: '1',
    imageUrl: 'https://i.postimg.cc/placeholder/bonesinger.png',
    environment: 'Shadowy Crypts',
  },
  {
    name: 'Ossokin Bone Shaman',
    description: 'The Ossokin Bone Shaman is a small, morbidly obese skeleton-a paradox of anatomy where smoky, solidified miasma fills the gaps between bones to create a rotund, pudgy silhouette. It waddles slowly, draped in heavy, opulent vestments of gloom. As a High Priest of the Ossuites, it commands dark miracles and can turn the very bones of its enemies against them.',
    race: 'Abomination',
    size: 'Small',
    crStr: '5',
    imageUrl: 'https://i.postimg.cc/placeholder/boneshaman.png',
    environment: 'Shadowy Crypts',
  },
  {
    name: 'Darkforme-Shieldguard',
    description: '',
    race: 'Humanoid (Darkforme-Construct)',
    size: 'Medium',
    crStr: '4',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Prefect (The Gavel)',
    description: 'Faction: The Gavel (Administrative Guard)\nRole: Discipline and containment. Prefects are tasked with "detaining" unruly students and suppressing magical outbursts.',
    race: 'Humanoid (Darkforme-Caster)',
    size: 'Medium',
    crStr: '5',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Skirmisher',
    description: 'Faction: The Swift-Strider Scouts\nRole: Light melee infantry used for flanking and harassing spellcasters. They are high-mobility units designed to bypass the frontline.',
    race: 'Humanoid (Darkforme)',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Harrier',
    description: 'Faction: The Cloud-Watcher Legion\nRole: Flighted infantry utilized for aerial reconnaissance and dropping psychological payloads. Their wings are made of solidified shadow-mist.',
    race: 'Humanoid (Darkforme)',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Ballisteer',
    description: '',
    race: 'Humanoid (Darkforme)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Gatekeeper (Gatekeeper Krell)',
    description: 'Location: Zone A: The Foyer of Echoes',
    race: 'Undead (Darkforme-Construct)',
    size: 'Medium',
    crStr: '6',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Slinger',
    description: 'Faction: The Iron-Root Sappers (Light Support)\nRole: Mid-range support units that fire alchemical and psychic canisters. They provide cover for the Enforcers.',
    race: 'Humanoid (Darkforme)',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Marshal (Marshal Rictus)',
    description: 'Location: Zone D: The War Room',
    race: 'Undead (Darkforme-Commander)',
    size: 'Medium',
    crStr: '8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Quartermaster (Quartermaster Gnash)',
    description: 'Location: Zone B: The Mess Hall',
    race: 'Monstrosity (Darkforme)',
    size: 'Medium',
    crStr: '5',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme-Suffocator',
    description: 'Location: Marshland Nexus (Greensea Expanse)',
    race: 'Monstrosity (Darkforme)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Ossokin Scrapper',
    description: '',
    race: 'Undead (Ossokin)',
    size: 'Small',
    crStr: '1/4',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Vora the Soul-Squeezer',
    description: '',
    race: '',
    size: 'Gargantuan',
    crStr: '9',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Sissel the Mist-Walker',
    description: '',
    race: '',
    size: 'Huge',
    crStr: '7',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Krazis the Corrupted',
    description: '',
    race: '',
    size: 'Huge',
    crStr: '6',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Giggling Cackler',
    description: 'Small, hyper-active simians partially cured of Darkling rot. Mischievous but useful.',
    race: 'Beast (Darkling-Kin)',
    size: 'Small',
    crStr: '1/8',
    imageUrl: '',
    environment: 'Greensea Outskirts, Meaglow Grove',
  },
  {
    name: 'Canopy Cackler',
    description: 'The standard nuisance of the woods, known for hurling sticky Glut-Pellets.',
    race: 'Darkling (Beast)',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: 'Campus Woods, Greensea Jungle',
  },
  {
    name: 'Maw-Faced Cackler',
    description: 'A horrifying monstrosity with a vertical maw where its face should be.',
    race: 'Darkforme (Monstrosity)',
    size: 'Small',
    crStr: '2',
    imageUrl: '',
    environment: 'Greensea Depths',
  },
  {
    name: 'Darkforme Noxback',
    description: 'The silver-backed king of the Dark simians. Coordaintes swarms with terrifying precision.',
    race: 'Darkforme (Monstrosity)',
    size: 'Large',
    crStr: '5',
    imageUrl: '',
    environment: 'Greensea Depths, Marshland Nexus',
  },
  {
    name: 'Hactor the Everhopping',
    description: '',
    race: '',
    size: 'Huge',
    crStr: '8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Lord Furuzzle: Bunnarch of All Bunkind',
    description: '',
    race: '',
    size: 'Gargantuan',
    crStr: '15',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Blanz-Coh the Tiny Terror',
    description: '',
    race: '',
    size: 'Small',
    crStr: '10',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme Gutroar',
    description: 'Huge monstrosity (darkforme), neutral evil',
    race: 'monstrosity (darkforme)',
    size: 'Huge',
    crStr: '4',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkling Cubling Suppsipper',
    description: 'Small monstrosity (darkling), chaotic evil',
    race: 'monstrosity (darkling)',
    size: 'Small',
    crStr: '1/2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Grizzwauler, the Gargant',
    description: 'Gargantuan monstrosity (darkforme, legendary), chaotic evil',
    race: 'monstrosity (darkforme, legendary)',
    size: 'Gargantuan',
    crStr: '8',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme Pseudomaiden',
    description: 'Medium undead (darkforme), neutral evil',
    race: 'undead (darkforme)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Darkforme Tickle Monster',
    description: 'Medium monstrosity (darkforme), chaotic evil',
    race: 'monstrosity (darkforme)',
    size: 'Medium',
    crStr: '2',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Tittalus Manus, The Bad Toucher',
    description: 'Large monstrosity (darkforme, legendary), chaotic evil',
    race: 'monstrosity (darkforme, legendary)',
    size: 'Large',
    crStr: '8',
    imageUrl: 'https://gleaming-cannedlulu.wordpress.com/wp-content/uploads/2026/03/a_gigantic_horrific_202603180119_inspyrenet-3.png',
    environment: '',
  },
  {
    name: 'Darkforme Toddlegeist',
    description: 'Small undead (darkling), chaotic evil',
    race: 'undead (darkling)',
    size: 'Small',
    crStr: '3',
    imageUrl: '',
    environment: '',
  },
  {
    name: 'Caelistian Vanguard',
    description: 'Medium humanoid (any race), lawful evil',
    race: 'humanoid (any race)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: 'Academy Ruins, The Greensea Expanse',
  },
  {
    name: 'Caelistian Gunner',
    description: 'Medium humanoid (any race), lawful evil',
    race: 'humanoid (any race)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: 'Academy Ruins, The Greensea Expanse',
  },
  {
    name: 'Caelistian Zealot',
    description: 'Medium humanoid (any race), lawful evil',
    race: 'humanoid (any race)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: 'Academy Ruins, The Greensea Expanse',
  },
  {
    name: 'Caelistian Infiltrator',
    description: 'Medium humanoid (any race), lawful evil',
    race: 'humanoid (any race)',
    size: 'Medium',
    crStr: '3',
    imageUrl: '',
    environment: 'Academy Ruins, The Greensea Expanse',
  },
];
const BOOKMARK_KEY = 'scholia_diaspros_bookmarks_v1';
const ITEM_IMAGE_FALLBACK = 'src/assets/images/logo.png';
const MONSTER_IMAGE_FALLBACK = 'src/assets/images/logo.png';
const REGION_IMAGE_FALLBACK = 'src/assets/images/the-map.png';
const MONSTER_LOCAL_IMAGE_FILENAMES = [
  'abyssalleviathan.webp',
  'Age-Hound.webp',
  'anglerlurk.webp',
  'auditarch.webp',
  'baronessofblackbile.webp',
  'bellyacher.webp',
  'blancoz.webp',
  'bloodgorger.webp',
  'boneshaman.webp',
  'bottlebeast.webp',
  'bottleelemental.webp',
  'Brackling.webp',
  'bracklings.webp',
  'bratnapper.webp',
  'caelistianregimentcommander.webp',
  'caelistianregimentcommander1.webp',
  'caelistianregimentpsycommander.webp',
  'caelistianregimentpsycommander1.webp',
  'caelistianremnantgunner1.webp',
  'caelistianremnantgunner2.webp',
  'caelistianremnantinfiltrator (1).webp',
  'caelistianremnantinfiltrator (2).webp',
  'caelistianremnantinfiltrator (3).webp',
  'caelistianremnantinfiltrator.webp',
  'caelistianremnantvanguard.webp',
  'caelistianremnantvanguard1.webp',
  'caelistianremnantzealot.webp',
  'caelistianremnantzealot2.webp',
  'cavesweller.webp',
  'changebot.webp',
  'chaphell.webp',
  'cryingstarmass.webp',
  'Corsair-Orca.webp',
  'cublingsuppsipper.webp',
  'currentdrifter.webp',
  'currentsnapper.webp',
  'Dark Mycoforme Rotter.webp',
  'Dark Mycoforme Rotter1.webp',
  'darkaconda.webp',
  'darkdimensioninfiltrator.webp',
  'darkdimensionjusticar.webp',
  'darkdimensionregressorfield.webp',
  'darkdimensionvanguard.webp',
  'darkdimensionvoidscholar.webp',
  'Dark-Dracoforme_Blaze_Drake.webp',
  'darkforgedremnantbrute.webp',
  'darkforgedremnantbulwark.webp',
  'darkforgedremnantlash.webp',
  'darkforgedremnantspike.webp',
  'Darkforged_Rigman.webp',
  'Darkforged-Slag-Brute.webp',
  'Darkforme Bellowbelly.webp',
  'Darkforme Cavesweller.webp',
  'Darkforme Enforcer.webp',
  'Darkforme Mycomugger.webp',
  'Darkforme Mycomugger1.webp',
  'Darkforme Mycomystic.webp',
  'Darkforme Shadow-Lurker Pack Alpha.webp',
  'Darkforme Shadow-Lurker.webp',
  'Darkforme-Chimeric-Dread.webp',
  'Darkforme-Chrono-Snare.webp',
  'Darkforme-Deluge.webp',
  'Darkforme-Avalanche-Horn.webp',
  'Darkforme-Frost-Gargantua.webp',
  'Darkforme-Gale-Screecher.webp',
  'Darkforme-Flutter-Ghast.webp',
  'Darkforme-Glacier-Maw.webp',
  'Darkforme-Glacier-Maw__Focus.webp',
  'Darkforme-Rime-Spinner.webp',
  'Darkforme_Benthic_Leviathan.webp',
  'Darkforme_Blackdeep_Shark.webp',
  'Darkforme-Mangrove-Matriarch.webp',
  'Darkforme-Nimbus-Ray.webp',
  'Darkforme-Black-Bramble-Stag.webp',
  'Darkforme_Augur-Eye.webp',
  'Darkforme_Brackish_Gale.webp',
  'Darkforme_Current-Drifter.webp',
  'Darkforme_Dark_Geode.webp',
  'Darkforme_Salachleon.webp',
  'Darkforme_Scrapgull.webp',
  'Darkforme_Sleekrime-Stalker.webp',
  'Darkforme_Void-Clam.webp',
  'Darkforme_Void-Orca.webp',
  'darkforme-rot-blossom.webp',
  'Darkforme-Shatterhorn.webp',
  'Darkforme-Sol-Anhinga.webp',
  'Darkforme-Star-Shrike.webp',
  'Darkforme-Strangleweed.webp',
  'Darkforme-Thunderhead.webp',
  'Darkforme_Umbralraune.webp',
  'Darkforme-Caldera-Lurker.webp',
  'Darkforme-Hippocampus.webp',
  'Darkforme-Magma-Roller.webp',
  'darkforme-hungore.webp',
  'darkforme-nightpinyon.webp',
  'darkforme-ossokin-aegisite.webp',
  'darkforme-ossuarian.webp',
  'Darkforme-Overwatch.webp',
  'darkforme-shark.webp',
  'darkforme-spinebearer.webp',
  'darkforme-suffocator.webp',
  'darkformeballisteer.webp',
  'darkformedisciplinedean.webp',
  'darkformegourdlord.webp',
  'darkformegutroar.webp',
  'darkformeharrier.webp',
  'darkformeharrier1.webp',
  'darkformeharrierskycommander.webp',
  'darkformemarshallrictus.webp',
  'darkformenoxback.webp',
  'darkformeossuitechargeromega.webp',
  'darkformeprefect.webp',
  'darkformeshieldguard.webp',
  'darkformeskirmisher.webp',
  'darkformeskirmisher1.webp',
  'darkformeslinger.webp',
  'darkformeticklemonster.webp',
  'Darkling Caller.webp',
  'Darkling Cubling.webp',
  'Darkling Lurker.webp',
  'Darkling Slurper.webp',
  'Darkling Yowler.webp',
  'Darkling Diaper Mimick.webp',
  'Darkling_Bushelgreed.webp',
  'Darkling_Fire-Dracklie.webp',
  'Darkling_Lagoform.webp',
  'Darkling_Quickslime.webp',
  'Darkling_Rift-Hunter.webp',
  'Darkling_Rift-Invoker.webp',
  'Darkling_Rift-Marauder.webp',
  'Darkling_Tide-Crab.webp',
  'Darkling_Wraith_Seeress.webp',
  'Darkling-Delta-Mimic.webp',
  'Darkling-Ember-Spinner.webp',
  'Darkling-Gale-Harrier.webp',
  'Darkling-Gilded-Husk.webp',
  'Darkling-Glamour-Mantle (2).webp',
  'Darkling-Grease-Miter.webp',
  'Darkling-Hoarfrost-Yowler.webp',
  'Darkling-Loop-Stalker.webp',
  'Darkling-Petro-Legion.webp',
  'Darkling-Porcelain-Thrall.webp',
  'Darkling-Rimecreep.webp',
  'Darkling-Scree-Roller.webp',
  'Darkling-Sea-Brackling.webp',
  'Darkling-Shell-Skitterer.webp',
  'Darkling-Shiver.webp',
  'Darkling-Silt-Hound.webp',
  'Darkling-Sol-Shunner.webp',
  'Darkling-Slush-Slurper.webp',
  'Darkling-Spore-Symbiote.webp',
  'Darkling-Squallkin.webp',
  'darkling-cactine-biggo-boy.webp',
  'darkling-hooter.webp',
  'darkling-hungerer.webp',
  'darkling-nightshade-elemental.webp',
  'darkling-ossokin-proselyte.webp',
  'darkling-ossokin.webp',
  'darkling-ossuite-charger.webp',
  'darkling-paralurker.webp',
  'darkling-shark.webp',
  'darkling-slitherscale.webp',
  'darklingbellowbelly.webp',
  'darklingbellowbellycubling.webp',
  'darklingcactine.webp',
  'darklingcanopycackler.webp',
  'darklingcanopycacklermawface.webp',
  'darklingcanopygiggler.webp',
  'darklingdetentionprofessormagics.webp',
  'darklingdetentionprofessorweapons.webp',
  'darklinggourdling.webp',
  'darklinghallmonitor.webp',
  'darklingslimebigboy.webp',
  'darklingslimecubeprincess.webp',
  'darkpunishmentmaid.webp',
  'Darkshade Fungi Darkling (2).webp',
  'Darkshade Fungi Darkling.webp',
  'Darkshade Fungi Darkling_ (2).webp',
  'Darkshade Fungi Darkling_ (3).webp',
  'Darkshade Fungi Darkling_ (4).webp',
  'Darkshade Fungi Darkling_.webp',
  'derangeddiapercheckbot.webp',
  'diaperdimensionrift.webp',
  'dreamstealer.webp',
  'enforcer.webp',
  'forgottenrattle.webp',
  'Funky Fungi Darkling.webp',
  'Funky Fungi Darkling1.webp',
  'Funky Fungi Darkling2.webp',
  'furuzzle.webp',
  'gatekeeperkrell.webp',
  'ghostiby.webp',
  'gloomnewt.webp',
  'Ground-Owl.webp',
  'grizzwauler.webp',
  'hactor.webp',
  'krazis.webp',
  'lakeopus_rex.webp',
  'liquidlegion.webp',
  'livingmagmaclot.webp',
  'lostplushie.webp',
  'matronbot.webp',
  'matronbot_bria.webp',
  'mirecroaker.webp',
  'mobilehallcleaner.webp',
  'mudgnasher.webp',
  'murkfinswarmer.webp',
  'nannybotmatron.webp',
  'nightmarelullaby.webp',
  'onesie.webp',
  'Ossuite_Trench-Walker.webp',
  'ossokinapostlyte.webp',
  'ossokinapostlyte1.webp',
  'ossokinapostlyte2.webp',
  'ossokinapostlytea.webp',
  'ossokinbonesinger.webp',
  'ossokindeclaryte.webp',
  'ossokindeclaryte1.webp',
  'ossokinminivestal.webp',
  'ossokinscrapper.webp',
  'ossokinvestal1.webp',
  'ossokinvestal2.webp',
  'ossokinvestal3.webp',
  'ossokinvestal4.webp',
  'ossokinvestal5.webp',
  'pacifiergolem.webp',
  'packalpha.webp',
  'pikemaw.webp',
  'planarwarden.webp',
  'pondskulker.webp',
  'projectauditor.webp',
  'pseudomaiden.webp',
  'pseudomaiden1.webp',
  'psychicbloom.webp',
  'quartermastergnash.webp',
  'regressionfog.webp',
  'rillskitter.webp',
  'riverlurk.png',
  'rivertyrant.webp',
  'royaljestersofdespair.webp',
  'sentientcrib.webp',
  'shadesneak.webp',
  'shadowbabysitter.webp',
  'shadowstorm.webp',
  'shadowychamberlain.webp',
  'sisselthemistwalker.webp',
  'sky-darkener-nightveil.webp',
  'slimepress.webp',
  'smalldarklingcuboidslime.webp',
  'smalldarklingslime.webp',
  'Slip-Stream_Seal.webp',
  'Spore Spreader Darkling.webp',
  'Spore Spreader Darkling1.webp',
  'teddybombination.webp',
  'temporalcribguardian.webp',
  'The_Ebongoreel.webp',
  'The_Echo_Inquisitor.webp',
  'the-darkformless.png',
  'the-darkformless.webp',
  'ticklefinger.webp',
  'tiny darkling slime.webp',
  'titansnapper.webp',
  'tittalusmanus.webp',
  'toddlegeist.webp',
  'traineeauditor.webp',
  'viscountofviscera.webp',
  'vora.webp',
  'voravenor.webp',
  'warforgeddarkwatch.webp',
  'weedtangler.webp',
  'weirdling-paralurker.webp',
  'Wizenbear.webp',
];
const MONSTER_LOCAL_IMAGE_ALIASES = {
  blanzcohthetinyterror: 'blancoz',
  bottleelemental: 'bottleelemental',
  canopycackler: 'darklingcanopycackler',
  caelistiangunner: 'caelistianremnantgunner1',
  caelistianinfiltrator: 'caelistianremnantinfiltrator',
  caelistianvanguard: 'caelistianremnantvanguard',
  caelistianzealot: 'caelistianremnantzealot',
  cryingstarmass: 'cryingstarmass',
  darkdimensionauditarch: 'auditarch',
  darkdimensionchangebot: 'changebot',
  darkdimensionmatronbot: 'matronbot',
  darkdimensionnannybotbratnapper: 'bratnapper',
  darkdimensionprojectauditor: 'projectauditor',
  darkdimensiontraineeauditor: 'traineeauditor',
  darkformeabyssalleviathan: 'abyssalleviathan',
  darkformecurrentdrifter: 'currentdrifter',
  darkformecurrentsnapper: 'currentsnapper',
  darkformeaugureye: 'Darkforme_Augur-Eye',
  darkformebrackishgalethevoidsquid: 'Darkforme_Brackish_Gale',
  darkformecalderalurker: 'Darkforme-Caldera-Lurker',
  darkformedarkgeode: 'Darkforme_Dark_Geode',
  darkformegatekeepergatekeeperkrell: 'gatekeeperkrell',
  darkformeglaciermaw: 'Darkforme-Glacier-Maw__Focus',
  darkformegutroar: 'darkformegutroar',
  darkformehippocampus: 'Darkforme-Hippocampus',
  darkformemagmaroller: 'Darkforme-Magma-Roller',
  darkformemirecroaker: 'mirecroaker',
  darkformequartermasterquartermastergnash: 'quartermastergnash',
  darkformescrapgull: 'Darkforme_Scrapgull',
  darkformeshatterhorn: 'Darkforme-Avalanche-Horn',
  darkformebramblestag: 'Darkforme-Black-Bramble-Stag',
  darkformerivertyrant: 'rivertyrant',
  darkformesuffocator: 'darkforme-suffocator',
  darkformetitansnapper: 'titansnapper',
  darkformeumbralraune: 'Darkforme_Umbralraune',
  darkformevoidclam: 'Darkforme_Void-Clam',
  darkformevoidorca: 'Darkforme_Void-Orca',
  darklinganglerlurk: 'anglerlurk',
  darklingbloodgorger: 'bloodgorger',
  darklingbrackling: 'Brackling',
  darklingbushelgreed: 'Darkling_Bushelgreed',
  darklingcaller: 'Darkling Caller',
  darklingcubling: 'Darkling Cubling',
  darklingcublingsuppsipper: 'cublingsuppsipper',
  darklingdiapermimic: 'Darkling Diaper Mimick',
  darklingdiapermimick: 'Darkling Diaper Mimick',
  darklingemberspinner: 'Darkling-Ember-Spinner',
  darklingfiredracklie: 'Darkling_Fire-Dracklie',
  darklinggloomnewt: 'gloomnewt',
  darklingghostiby: 'ghostiby',
  darklingglamourmantle: 'Darkling-Glamour-Mantle (2)',
  darklinggreasemite: 'Darkling-Grease-Miter',
  darklinglagoform: 'Darkling_Lagoform',
  darklingliquidlegion: 'liquidlegion',
  darklinglurker: 'Darkling Lurker',
  darklingmurkfinswarmer: 'murkfinswarmer',
  darklingpondskulker: 'pondskulker',
  darklingquickslime: 'Darkling_Quickslime',
  darklingrillskitter: 'rillskitter',
  darklingrifthunter: 'Darkling_Rift-Hunter',
  darklingriftinvoker: 'Darkling_Rift-Invoker',
  darklingriftmarauder: 'Darkling_Rift-Marauder',
  darklingriverlurk: 'riverlurk',
  darklingsporesymbiote: 'Darkling-Spore-Symbiote',
  darklingslurper: 'Darkling Slurper',
  darklingtidecrab: 'Darkling_Tide-Crab',
  darklingwraithseeress: 'Darkling_Wraith_Seeress',
  darklingweedtangler: 'weedtangler',
  darklingyowler: 'Darkling Yowler',
  derangeddiapercheckbot: 'derangeddiapercheckbot',
  diaperdimensionrift: 'diaperdimensionrift',
  dreamstealer: 'dreamstealer',
  gigglingcackler: 'darklingcanopygiggler',
  hactortheeverhopping: 'hactor',
  lordfuruzzlebunnarchofallbunkind: 'furuzzle',
  lostplushie: 'lostplushie',
  mawfacedcackler: 'darklingcanopycacklermawface',
  nightmarelullaby: 'nightmarelullaby',
  ossuitetrenchwalker: 'Ossuite_Trench-Walker',
  pacifiergolem: 'pacifiergolem',
  primordialbottlebeast: 'bottlebeast',
  regressionfog: 'regressionfog',
  sentientcrib: 'sentientcrib',
  slipstreamseal: 'Slip-Stream_Seal',
  temporalcribguardian: 'temporalcribguardian',
  theebongoreel: 'The_Ebongoreel',
  theebongoreelthewrackturner: 'The_Ebongoreel',
  theechoinquisitor: 'The_Echo_Inquisitor',
  thedarkformless: 'the-darkformless',
  tittalusmanusthebadtoucher: 'tittalusmanus',
  vorathesoulsqueezer: 'vora',
  wizenbear: 'Wizenbear',
};
const MONSTER_LOCAL_IMAGE_INDEX = MONSTER_LOCAL_IMAGE_FILENAMES.reduce((index, fileName) => {
  const key = normalizeMonsterAssetKey(fileName);
  if (key && !index[key]) {
    index[key] = `src/assets/images/Monsters/${fileName}`;
  }
  return index;
}, Object.create(null));

const elements = {
  atlasImage: document.getElementById('atlasImage'),
  overlay: document.getElementById('atlasOverlay'),
  tooltip: document.getElementById('regionTooltip'),
  status: document.getElementById('atlasStatus'),
  search: document.getElementById('regionSearch'),
  bookmarkToggle: document.getElementById('bookmarkToggle'),
  openSelectedRegionButton: document.getElementById('openSelectedRegionButton'),
  atlasMusicPlayer: document.getElementById('atlasMusicPlayer'),
  atlasMusicTrack: document.getElementById('atlasMusicTrack'),
  atlasMusicRegion: document.getElementById('atlasMusicRegion'),
  atlasMusicPlayPause: document.getElementById('atlasMusicPlayPause'),
  atlasMusicNext: document.getElementById('atlasMusicNext'),
  atlasMusicVolume: document.getElementById('atlasMusicVolume'),
  atlasGlobalMute: document.getElementById('atlasGlobalMute'),
  regionModalLayer: document.getElementById('regionModalLayer'),
  regionOverviewTemplate: document.getElementById('regionOverviewTemplate'),
  mapStage: document.getElementById('mapStage'),
  controlsDrawer: document.getElementById('controlsDrawer'),
  backdrop: document.getElementById('atlasBackdrop'),
};

const state = {
  regions: [],
  mediaManifest: null,
  monsters: [],
  selectedRegion: null,
  bookmarks: loadBookmarks(),
  bookmarksOnly: false,
  openRegionModals: [],
  expandedItemRegions: new Set(),
  activeModalDrag: null,
  musicPlayer: {
    audio: null,
    regionSlug: '',
    regionTitle: '',
    trackNames: [],
    trackSources: [],
    index: 0,
    statusNode: null,
  },
  loreLightbox: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  activeMapPan: null,
};

function createInlineMediaManifest() {
  const regions = {};

  Object.entries(regionMetadata).forEach(([title, metadata]) => {
    regions[title] = {
      slug: metadata.slug || slugify(title),
      shortDescription: metadata.shortDescription || fallbackRegionMetadata.shortDescription || '',
      description: metadata.description || fallbackRegionMetadata.description || '',
      tags: Array.isArray(metadata.tags) ? [...metadata.tags] : [],
      locationTerms: Array.isArray(metadata.locationTerms) ? [...metadata.locationTerms] : [],
      curatedItemNames: Array.isArray(metadata.curatedItemNames) ? [...metadata.curatedItemNames] : [],
      curatedEntityNames: Array.isArray(metadata.curatedEntityNames) ? [...metadata.curatedEntityNames] : [],
      galleryImages: Array.isArray(metadata.galleryImages) ? metadata.galleryImages : [],
      musicLabel: metadata.musicLabel || '',
      mediaNeeds: Array.isArray(metadata.mediaNeeds) ? metadata.mediaNeeds : [],
      resourceSources: buildResourceSources(title, metadata),
    };
  });

  return { regions };
}

function buildResourceSources(title, metadata) {
  const sources = [...DEFAULT_ATLAS_RESOURCE_SOURCES];
  const normalizedTitle = normalize(title);
  const tags = Array.isArray(metadata?.tags) ? metadata.tags.map(normalize) : [];

  if (normalizedTitle.includes('sea') || normalizedTitle.includes('shore') || normalizedTitle.includes('bay') || normalizedTitle.includes('cape') || tags.includes('coast')) {
    sources.push({ type: 'gallery', label: 'Local lore coast art', source: 'src/assets/images/lore/' });
  }
  if (normalizedTitle.includes('mount') || normalizedTitle.includes('brothers') || normalizedTitle.includes('sisters') || tags.includes('mountains')) {
    sources.push({ type: 'gallery', label: 'Mountain and ore imagery', source: 'src/assets/images/' });
  }
  if (normalizedTitle.includes('greensea') || normalizedTitle.includes('plains') || normalizedTitle.includes('meadow') || tags.includes('forest') || tags.includes('flora')) {
    sources.push({ type: 'gallery', label: 'Regional ingredient imagery', source: 'src/assets/images/' });
  }
  if (normalizedTitle.includes('gash') || normalizedTitle.includes('majicka') || tags.includes('anomaly') || tags.includes('magic')) {
    sources.push({ type: 'gallery', label: 'Lore and anomaly art', source: 'src/assets/images/lore/' });
  }

  return dedupeResourceSources([...(Array.isArray(metadata?.resourceSources) ? metadata.resourceSources : []), ...sources]);
}

function dedupeResourceSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    if (!source) return false;
    const key = `${normalize(source.type)}|${normalize(source.label)}|${normalize(source.source)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeBestiaryEntries(seedEntries, liveEntries) {
  const merged = new Map();

  seedEntries.forEach((entry) => {
    const normalizedEntry = normalizeBestiaryEntry(entry);
    const key = normalize(normalizedEntry?.name);
    if (!key) return;
    merged.set(key, { ...normalizedEntry });
  });

  liveEntries.forEach((entry) => {
    const normalizedEntry = normalizeBestiaryEntry(entry);
    const key = normalize(normalizedEntry?.name);
    if (!key) return;

    const existing = merged.get(key) || {};
    merged.set(key, {
      name: choosePreferredText(existing.name, normalizedEntry.name),
      description: choosePreferredText(existing.description, normalizedEntry.description),
      race: choosePreferredText(existing.race, normalizedEntry.race),
      size: choosePreferredText(existing.size, normalizedEntry.size),
      crStr: choosePreferredText(existing.crStr, normalizedEntry.crStr),
      imageUrl: choosePreferredImage(existing.imageUrl, normalizedEntry.imageUrl),
      environment: choosePreferredText(existing.environment, normalizedEntry.environment),
    });
  });

  return Array.from(merged.values());
}

function normalizeBestiaryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return {
      name: '',
      description: '',
      race: '',
      size: '',
      crStr: '',
      imageUrl: '',
      environment: '',
    };
  }

  const flavor = entry.flavor && typeof entry.flavor === 'object' ? entry.flavor : {};
  const stats = entry.stats && typeof entry.stats === 'object' ? entry.stats : {};
  const challengeRating = stats.challengeRatingStr || String(stats.challengeRating || entry.cr || '').trim();
  const description = String(entry.description || entry.desc || flavor.description || '').trim();
  const explicitEnvironment = String(entry.environment || entry.habitat || entry.location || flavor.environment || '').trim();

  return {
    name: String(entry.name || flavor.name || '').trim(),
    description,
    race: String(entry.race || entry.type || stats.race || '').trim(),
    size: String(entry.size || stats.size || '').trim(),
    crStr: String(challengeRating || '').trim(),
    imageUrl: String(entry.imageUrl || entry.image || flavor.imageUrl || '').trim(),
    environment: explicitEnvironment || extractInlineBestiaryLocation(description) || extractNarrativeBestiaryLocation(description),
  };
}

function extractInlineBestiaryLocation(description) {
  const text = String(description || '').trim();
  if (!text) return '';

  const match = text.match(/(?:^|\n)\s*location\s*:\s*([^\n\r]+)/i);
  return match ? String(match[1] || '').trim() : '';
}

function extractNarrativeBestiaryLocation(description) {
  const text = String(description || '').trim();
  if (!text) return '';

  const match = text.match(/\b(?:of|in|within|beneath|around|from) the ([A-Z][A-Za-z' -]+?)\s+(garrison|academy|manor|house|forest|swamp|bay|sea|mountains?|plains?|domain|sanctuary|archives|hall|foyer|room|plumbing)\b/);
  if (!match) return '';

  const placeName = String(match[1] || '').trim();
  const placeKind = String(match[2] || '').trim();
  if (!placeName || !placeKind) return '';

  if (/house/i.test(placeKind)) return `${placeName} ${placeKind}`.trim();
  return placeName;
}

async function fetchJsonFirstOk(paths) {
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response || !response.ok) continue;
      return await response.json();
    } catch (_) {
      // Try the next candidate path.
    }
  }
  return null;
}

function extractBestiaryEntries(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.creatures)) return payload.creatures;
  return [];
}

function choosePreferredText(primary, secondary) {
  const left = String(primary || '').trim();
  const right = String(secondary || '').trim();
  if (!left) return right;
  if (!right) return left;
  return right.length > left.length ? right : left;
}

function choosePreferredImage(primary, secondary) {
  const left = normalizeAtlasAssetPath(primary, '');
  const right = normalizeAtlasAssetPath(secondary, '');
  if (!left) return right;
  if (!right) return left;
  const leftIsRemote = /^(https?:)?\/\//i.test(left);
  const rightIsRemote = /^(https?:)?\/\//i.test(right);
  if (leftIsRemote !== rightIsRemote) {
    return leftIsRemote ? right : left;
  }
  return left;
}

async function init() {
  initMusicPlayer();
  wireStaticControls();
  renderWelcomeState();

  try {
    await ensureAtlasImageReady();
    syncOverlayToImage();
    state.mediaManifest = loadMediaManifest();
    state.monsters = await loadBestiaryEntries();
    const regions = loadRegions();
    state.regions = regions;
    renderRegions();
    setStatus(`${regions.length} regions ready`);
  } catch (error) {
    console.error(error);
    setStatus('Unable to load region polygons');
    elements.overlay.innerHTML = '';
  }
}

function loadMediaManifest() {
  return BAKED_MEDIA_MANIFEST;
}

async function loadBestiaryEntries() {
  const liveBestiary = Array.isArray(window.monstersData) ? window.monstersData : [];
  if (!canFetchExternalBestiarySources()) {
    return mergeBestiaryEntries(BAKED_BESTIARY, liveBestiary);
  }

  const externalSources = [
    [
      'src/data/Diaper-School-Full-BestiaryRuntime.json',
      './src/data/Diaper-School-Full-BestiaryRuntime.json',
      '/src/data/Diaper-School-Full-BestiaryRuntime.json',
      'Diaper-School-Full-BestiaryRuntime.json',
      '/Diaper-School-Full-BestiaryRuntime.json',
    ],
    [
      'src/data/Diaper-School-Full-BestiaryV4.json',
      './src/data/Diaper-School-Full-BestiaryV4.json',
      '/src/data/Diaper-School-Full-BestiaryV4.json',
      'Diaper-School-Full-BestiaryV4.json',
      '/Diaper-School-Full-BestiaryV4.json',
    ],
    [
      'Diaper-School-Full-BestiaryV3.json',
      '/Diaper-School-Full-BestiaryV3.json',
      'src/data/Diaper-School-Full-BestiaryV3.json',
      './src/data/Diaper-School-Full-BestiaryV3.json',
      '/src/data/Diaper-School-Full-BestiaryV3.json',
    ],
    [
      'tools/_tmp_bestiary_v3_additions.json',
      '/tools/_tmp_bestiary_v3_additions.json',
      './tools/_tmp_bestiary_v3_additions.json',
    ],
    [
      'referencedata/World of Scholia Diaspros/new-monsters-critterdb.json',
      '/referencedata/World of Scholia Diaspros/new-monsters-critterdb.json',
      './referencedata/World of Scholia Diaspros/new-monsters-critterdb.json',
      'referencedata/World%20of%20Scholia%20Diaspros/new-monsters-critterdb.json',
      '/referencedata/World%20of%20Scholia%20Diaspros/new-monsters-critterdb.json',
      './referencedata/World%20of%20Scholia%20Diaspros/new-monsters-critterdb.json',
    ],
  ];

  const fetchedEntries = [];
  for (const paths of externalSources) {
    const payload = await fetchJsonFirstOk(paths);
    fetchedEntries.push(...extractBestiaryEntries(payload));
  }

  return mergeBestiaryEntries(BAKED_BESTIARY, [...liveBestiary, ...fetchedEntries]);
}

function canFetchExternalBestiarySources() {
  const protocol = String(window?.location?.protocol || '').toLowerCase();
  return protocol === 'http:' || protocol === 'https:';
}

function wireStaticControls() {
  window.addEventListener('resize', syncOverlayToImage);
  window.addEventListener('pointermove', onRegionModalDrag);
  window.addEventListener('pointerup', stopRegionModalDrag);
  window.addEventListener('pointercancel', stopRegionModalDrag);
  window.addEventListener('pointermove', onMapPan);
  window.addEventListener('pointerup', stopMapPan);
  window.addEventListener('pointercancel', stopMapPan);
  window.addEventListener('keydown', onGlobalKeydown);
  elements.search?.addEventListener('input', onSearchInput);
  elements.bookmarkToggle?.addEventListener('click', toggleBookmarksOnly);
  elements.backdrop?.addEventListener('click', closeAllDrawers);
  elements.atlasImage?.addEventListener('load', syncOverlayToImage);
  elements.mapStage?.addEventListener('wheel', onMapWheel, { passive: false });
  elements.mapStage?.addEventListener('pointerdown', startMapPan);
  elements.mapStage?.addEventListener('mousedown', suppressMiddleButtonScroll);
  elements.openSelectedRegionButton?.addEventListener('click', () => {
    if (!state.selectedRegion) return;
    openRegionModal(state.selectedRegion);
  });
  elements.atlasMusicPlayPause?.addEventListener('click', () => {
    const player = state.musicPlayer;
    const region = state.regions.find((entry) => entry.slug === player.regionSlug);
    if (!region) return;
    toggleRegionMusic(region, player.statusNode);
  });
  elements.atlasMusicNext?.addEventListener('click', () => {
    const player = state.musicPlayer;
    if (!player.trackSources.length) return;
    player.index = (player.index + 1) % player.trackSources.length;
    void playCurrentRegionTrack();
  });
  elements.atlasMusicVolume?.addEventListener('input', () => {
    const audio = state.musicPlayer.audio;
    if (!audio) return;
    const value = Number(elements.atlasMusicVolume.value);
    audio.volume = Number.isFinite(value) ? Math.min(1, Math.max(0, value / 100)) : 0.72;
  });
  elements.atlasGlobalMute?.addEventListener('click', toggleGlobalMute);

  document.querySelectorAll('[data-drawer-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleDrawer(button.getAttribute('data-drawer-toggle'));
    });
  });

  document.querySelectorAll('[data-drawer-close]').forEach((button) => {
    button.addEventListener('click', () => {
      closeDrawer(button.getAttribute('data-drawer-close'));
    });
  });

  document.querySelectorAll('[data-zoom-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-zoom-action');
      if (action === 'in') state.zoom = Math.min(2.4, state.zoom + 0.2);
      if (action === 'out') state.zoom = Math.max(0.8, state.zoom - 0.2);
      if (action === 'reset') {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
      }
      applyMapTransform();
      syncOverlayToImage();
    });
  });

  applyMapTransform();
  syncSelectedRegionButton();
}

function applyMapTransform() {
  if (!elements.mapStage) return;
  elements.mapStage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function suppressMiddleButtonScroll(event) {
  if (event.button !== 1) return;
  event.preventDefault();
}

function startMapPan(event) {
  if (event.button !== 1) return;
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('.atlas-region-modal, .atlas-floating-actions, .atlas-floating-brand, .atlas-drawer, .atlas-music-player')) return;

  state.activeMapPan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startPanX: state.panX,
    startPanY: state.panY,
  };

  elements.mapStage?.classList.add('is-panning');
  elements.mapStage?.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function onMapPan(event) {
  const panState = state.activeMapPan;
  if (!panState || event.pointerId !== panState.pointerId) return;

  state.panX = panState.startPanX + (event.clientX - panState.startX);
  state.panY = panState.startPanY + (event.clientY - panState.startY);
  applyMapTransform();
}

function stopMapPan(event) {
  const panState = state.activeMapPan;
  if (!panState) return;
  if (event && event.pointerId !== panState.pointerId) return;

  elements.mapStage?.classList.remove('is-panning');
  try {
    elements.mapStage?.releasePointerCapture?.(panState.pointerId);
  } catch (_) {
    // Ignore browsers that throw when capture was not established.
  }
  state.activeMapPan = null;
}

function onMapWheel(event) {
  if (!elements.mapStage) return;
  event.preventDefault();

  const delta = event.deltaY < 0 ? 0.12 : -0.12;
  const nextZoom = clamp(state.zoom + delta, 0.8, 2.4);
  if (nextZoom === state.zoom) return;

  state.zoom = nextZoom;
  applyMapTransform();
  syncOverlayToImage();
}

function onGlobalKeydown(event) {
  if (event.key !== 'Escape') return;
  if (!state.loreLightbox?.isOpen) return;
  event.preventDefault();
  closeLoreImageLightbox();
}

async function ensureAtlasImageReady() {
  const image = elements.atlasImage;
  if (!image) return;
  if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) return;

  await new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener('load', finish);
      image.removeEventListener('error', finish);
      resolve();
    };
    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });
  });
}

function syncOverlayToImage() {
  const image = elements.atlasImage;
  const overlay = elements.overlay;
  if (!image || !overlay) return;

  const width = image.clientWidth;
  const height = image.clientHeight;
  if (!width || !height) return;

  const naturalWidth = image.naturalWidth || 7116;
  const naturalHeight = image.naturalHeight || 3499;

  overlay.setAttribute('viewBox', `0 0 ${naturalWidth} ${naturalHeight}`);
  overlay.setAttribute('preserveAspectRatio', 'none');
  overlay.style.left = `${image.offsetLeft}px`;
  overlay.style.top = `${image.offsetTop}px`;
  overlay.style.width = `${width}px`;
  overlay.style.height = `${height}px`;
}

function loadRegions() {
  return BAKED_REGION_AREAS.map((area, index) => {
    const title = area.title || area.alt || `Region ${index + 1}`;
    const inlineMetadata = regionMetadata[title] || fallbackRegionMetadata;
    const canonicalTitle = inlineMetadata.sharedRegionTitle || title;
    const canonicalInlineMetadata = regionMetadata[canonicalTitle] || inlineMetadata;
    const manifestMetadata = state.mediaManifest?.regions?.[canonicalTitle] || state.mediaManifest?.regions?.[title] || {};
    const points = parseCoords(area.coords);
    return {
      id: `${canonicalInlineMetadata.slug || manifestMetadata.slug || slugify(canonicalTitle)}-${index}`,
      slug: canonicalInlineMetadata.slug || manifestMetadata.slug || slugify(canonicalTitle),
      title,
      points,
      polygonArea: calculatePolygonArea(points),
      polygonString: points.map((point) => `${point.x},${point.y}`).join(' '),
      metadata: {
        ...fallbackRegionMetadata,
        ...canonicalInlineMetadata,
        ...manifestMetadata,
        sharedRegionTitle: inlineMetadata.sharedRegionTitle || '',
      },
    };
  });
}

function parseCoords(coords) {
  const values = String(coords || '')
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));
  const points = [];
  for (let index = 0; index < values.length; index += 2) {
    points.push({ x: values[index], y: values[index + 1] });
  }
  return points;
}

function calculatePolygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;

  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += (current.x * next.y) - (next.x * current.y);
  }

  return Math.abs(area / 2);
}

function renderRegions() {
  const query = normalize(elements.search?.value);
  const regions = state.regions.filter((region) => {
    if (state.bookmarksOnly && !state.bookmarks.has(region.slug)) return false;
    if (!query) return true;
    return normalize(region.title).includes(query) || normalize(region.metadata.shortDescription).includes(query);
  }).sort((left, right) => (right.polygonArea || 0) - (left.polygonArea || 0));

  elements.overlay.innerHTML = '';

  regions.forEach((region) => {
    const isInteractive = region.metadata.nonInteractive !== true;
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', region.polygonString);
    polygon.setAttribute('class', buildRegionClass(region));
    polygon.setAttribute('tabindex', isInteractive ? '0' : '-1');
    polygon.setAttribute('role', isInteractive ? 'button' : 'img');
    polygon.setAttribute('aria-disabled', String(!isInteractive));
    polygon.setAttribute('aria-label', `${region.title}: ${getRegionTooltipDescription(region)}`);

    polygon.addEventListener('mouseenter', (event) => showTooltip(event, region));
    polygon.addEventListener('mousemove', (event) => moveTooltip(event));
    polygon.addEventListener('mouseleave', hideTooltip);
    if (isInteractive) {
      polygon.addEventListener('click', () => selectRegion(region));
      polygon.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRegion(region);
        }
      });
    }
    elements.overlay.appendChild(polygon);
  });

  setStatus(`${regions.length} regions shown`);

  if (state.selectedRegion && !regions.some((region) => region.slug === state.selectedRegion.slug)) {
    renderWelcomeState('No visible region selected');
  }
}

function buildRegionClass(region) {
  const classes = ['atlas-region'];
  if (region.metadata.nonInteractive === true) classes.push('is-disabled');
  if (state.selectedRegion?.slug === region.slug) classes.push('is-active');
  if (state.bookmarks.has(region.slug)) classes.push('is-bookmarked');
  return classes.join(' ');
}

function selectRegion(region) {
  if (region.metadata.nonInteractive === true) return;
  state.selectedRegion = region;
  renderRegions();
  syncSelectedRegionButton();
  openRegionModal(region);
}

function openRegionModal(region) {
  const existingModal = getRegionModal(region.slug);
  if (existingModal) {
    existingModal.region = region;
    existingModal.node.setAttribute('aria-label', `${getRegionCardTitle(region)} region overview`);
    renderRegionDetails(region, existingModal.targets);
    startRegionMusic(region, existingModal.targets.musicState);
    bringRegionModalToFront(region.slug);
    return existingModal.node;
  }

  const template = elements.regionOverviewTemplate;
  const layer = elements.regionModalLayer;
  if (!template || !layer) return null;

  const fragment = template.content.cloneNode(true);
  const modalNode = fragment.querySelector('.atlas-region-modal');
  if (!modalNode) return null;

  modalNode.dataset.regionSlug = region.slug;
  modalNode.setAttribute('aria-label', `${getRegionCardTitle(region)} region overview`);

  const targets = getRegionDetailTargets(modalNode);
  const modalRecord = { slug: region.slug, region, node: modalNode, targets, dragOffsetX: 0, dragOffsetY: 0 };
  const handleCloseModal = (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeRegionModal(region.slug);
  };

  targets.closeButton?.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  targets.closeButton?.addEventListener('mousedown', (event) => {
    event.stopPropagation();
  });
  targets.closeButton?.addEventListener('pointerup', handleCloseModal);
  targets.closeButton?.addEventListener('click', handleCloseModal);
  targets.bookmarkButton?.addEventListener('click', () => {
    toggleBookmark(region.slug);
    renderRegions();
    refreshOpenRegionModals();
  });
  targets.bookmarkButton?.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  targets.header?.addEventListener('pointerdown', (event) => startRegionModalDrag(event, region.slug));
  modalNode.addEventListener('mousedown', () => bringRegionModalToFront(region.slug));

  state.openRegionModals.push(modalRecord);
  layer.appendChild(fragment);
  renderRegionDetails(region, targets);
  startRegionMusic(region, targets.musicState);
  syncRegionModalStack();
  return modalNode;
}

function closeRegionModal(slug) {
  const modalIndex = state.openRegionModals.findIndex((modal) => modal.slug === slug);
  if (modalIndex < 0) return;

  if (state.activeModalDrag?.slug === slug) {
    stopRegionModalDrag();
  }

  if (state.musicPlayer.regionSlug === slug) {
    state.musicPlayer.audio?.pause();
    state.musicPlayer.regionSlug = '';
    state.musicPlayer.regionTitle = '';
    state.musicPlayer.trackNames = [];
    state.musicPlayer.trackSources = [];
    state.musicPlayer.index = 0;
    state.musicPlayer.statusNode = null;
    syncTopMusicPlayer();
  }

  const closingNode = state.openRegionModals[modalIndex].node;
  if (state.loreLightbox?.isOpen && state.loreLightbox.lastTrigger && closingNode.contains(state.loreLightbox.lastTrigger)) {
    closeLoreImageLightbox({ restoreFocus: false });
  }

  state.openRegionModals[modalIndex].node.remove();
  state.openRegionModals.splice(modalIndex, 1);
  syncRegionModalStack();
}

function getRegionModal(slug) {
  return state.openRegionModals.find((modal) => modal.slug === slug) || null;
}

function bringRegionModalToFront(slug) {
  const modalIndex = state.openRegionModals.findIndex((modal) => modal.slug === slug);
  if (modalIndex < 0) return;
  if (modalIndex === state.openRegionModals.length - 1) return;
  const [modal] = state.openRegionModals.splice(modalIndex, 1);
  state.openRegionModals.push(modal);
  elements.regionModalLayer?.appendChild(modal.node);
  syncRegionModalStack();
}

function syncRegionModalStack() {
  state.openRegionModals.forEach((modal, index) => {
    modal.node.style.setProperty('--modal-index', String(index));
    modal.node.style.setProperty('--modal-drag-x', `${modal.dragOffsetX}px`);
    modal.node.style.setProperty('--modal-drag-y', `${modal.dragOffsetY}px`);
    modal.node.classList.toggle('is-active', index === state.openRegionModals.length - 1);
  });
}

function refreshOpenRegionModals() {
  state.openRegionModals.forEach((modal) => {
    const currentRegion = state.regions.find((region) => region.slug === modal.slug) || modal.region;
    modal.region = currentRegion;
    renderRegionDetails(currentRegion, modal.targets);
  });
  syncSelectedRegionButton();
}

function syncSelectedRegionButton() {
  if (!elements.openSelectedRegionButton) return;
  const hasSelection = Boolean(state.selectedRegion && state.selectedRegion.metadata.nonInteractive !== true);
  elements.openSelectedRegionButton.disabled = !hasSelection;
  elements.openSelectedRegionButton.textContent = hasSelection
    ? `Open ${state.selectedRegion.title}`
    : 'Open Selected Region';
}

function getRegionDetailTargets(root) {
  const mediaStatus = root.querySelector('[data-region-media-status]');
  return {
    node: root,
    header: root.querySelector('.atlas-region-modal-header'),
    closeButton: root.querySelector('[data-region-modal-close]'),
    bookmarkButton: root.querySelector('[data-region-bookmark-button]'),
    heroImage: root.querySelector('[data-region-hero-image]'),
    eyebrow: root.querySelector('[data-region-eyebrow]'),
    title: root.querySelector('[data-region-title]'),
    summary: root.querySelector('[data-region-summary]'),
    description: root.querySelector('[data-region-description]'),
    lore: root.querySelector('[data-region-lore]'),
    tags: root.querySelector('[data-region-tags]'),
    gallery: root.querySelector('[data-region-gallery]'),
    mediaSection: mediaStatus?.closest('section') || null,
    mediaStatus,
    mediaSummary: root.querySelector('[data-region-media-summary]'),
    mediaNeeds: root.querySelector('[data-region-media-needs]'),
    promoSection: root.querySelector('[data-region-promo-section]'),
    promoCount: root.querySelector('[data-region-promo-count]'),
    promos: root.querySelector('[data-region-promos]'),
    items: root.querySelector('[data-region-items]'),
    itemActions: root.querySelector('[data-region-item-actions]'),
    itemCount: root.querySelector('[data-region-item-count]'),
    handbookSection: root.querySelector('[data-region-handbook-section]'),
    handbookLinks: root.querySelector('[data-region-handbook-links]'),
    handbookCount: root.querySelector('[data-region-handbook-count]'),
    entities: root.querySelector('[data-region-entities]'),
    entityCount: root.querySelector('[data-region-entity-count]'),
    musicState: root.querySelector('[data-region-music-state]'),
  };
}

function startRegionModalDrag(event, slug) {
  if (!(event.target instanceof Element)) return;
  if (event.button !== 0) return;
  if (event.target.closest('button, a, input, textarea, select')) return;

  const modal = getRegionModal(slug);
  const layer = elements.regionModalLayer;
  if (!modal || !layer) return;

  const modalRect = modal.node.getBoundingClientRect();
  const layerRect = layer.getBoundingClientRect();

  state.activeModalDrag = {
    slug,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startRectLeft: modalRect.left,
    startRectTop: modalRect.top,
    width: modalRect.width,
    height: modalRect.height,
    layerLeft: layerRect.left,
    layerTop: layerRect.top,
    layerRight: layerRect.right,
    layerBottom: layerRect.bottom,
    startOffsetX: modal.dragOffsetX,
    startOffsetY: modal.dragOffsetY,
  };

  modal.node.classList.add('is-dragging');
  bringRegionModalToFront(slug);
  event.preventDefault();
}

function onRegionModalDrag(event) {
  const dragState = state.activeModalDrag;
  if (!dragState || event.pointerId !== dragState.pointerId) return;

  const modal = getRegionModal(dragState.slug);
  if (!modal) {
    stopRegionModalDrag();
    return;
  }

  const deltaX = event.clientX - dragState.startX;
  const deltaY = event.clientY - dragState.startY;
  const unclampedLeft = dragState.startRectLeft + deltaX;
  const unclampedTop = dragState.startRectTop + deltaY;
  const minLeft = dragState.layerLeft + 12;
  const minTop = dragState.layerTop + 12;
  const maxLeft = Math.max(minLeft, dragState.layerRight - dragState.width - 12);
  const maxTop = Math.max(minTop, dragState.layerBottom - dragState.height - 12);
  const nextLeft = clamp(unclampedLeft, minLeft, maxLeft);
  const nextTop = clamp(unclampedTop, minTop, maxTop);

  modal.dragOffsetX = dragState.startOffsetX + (nextLeft - dragState.startRectLeft);
  modal.dragOffsetY = dragState.startOffsetY + (nextTop - dragState.startRectTop);
  modal.node.style.setProperty('--modal-drag-x', `${modal.dragOffsetX}px`);
  modal.node.style.setProperty('--modal-drag-y', `${modal.dragOffsetY}px`);
}

function stopRegionModalDrag(event) {
  const dragState = state.activeModalDrag;
  if (!dragState) return;
  if (event && event.pointerId !== dragState.pointerId) return;

  const modal = getRegionModal(dragState.slug);
  modal?.node.classList.remove('is-dragging');
  state.activeModalDrag = null;
}

function getRegionCardTitle(region) {
  return region?.metadata?.sharedRegionTitle || region?.title || 'Unknown region';
}

function getRegionTooltipDescription(region) {
  return region?.metadata?.hoverDescription || region?.metadata?.shortDescription || '';
}

function renderRegionDetails(region, targets) {
  const matchedItems = findItemsForRegion(region);
  const matchedEntities = findEntitiesForRegion(region);
  const galleryEntries = normalizeGalleryEntries(region.metadata.galleryImages);
  const mediaRequirements = buildMediaRequirements(region, galleryEntries, matchedItems);
  const showMediaReadiness = MEDIA_READINESS_ENABLED && region.metadata.hideMediaReadiness !== true;
  const cardTitle = getRegionCardTitle(region);

  targets.heroImage.src = normalizeAtlasAssetPath(galleryEntries[0]?.src, REGION_IMAGE_FALLBACK);
  targets.heroImage.alt = `${cardTitle} regional artwork`;
  targets.heroImage.onerror = () => {
    targets.heroImage.src = REGION_IMAGE_FALLBACK;
  };

  targets.eyebrow.textContent = state.bookmarks.has(region.slug) ? 'Bookmarked Region' : 'Atlas Entry';
  targets.title.textContent = cardTitle;
  targets.summary.textContent = region.metadata.shortDescription;
  targets.description.textContent = region.metadata.description;
  targets.musicState.textContent = region.metadata.musicLabel || 'Playlist pending';
  targets.musicState.setAttribute('title', 'Click to play or pause regional music');
  targets.musicState.style.cursor = 'pointer';
  targets.bookmarkButton.setAttribute('aria-pressed', String(state.bookmarks.has(region.slug)));
  targets.bookmarkButton.textContent = state.bookmarks.has(region.slug) ? 'Bookmarked' : 'Bookmark';

  targets.musicState.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleRegionMusic(region, targets.musicState);
  };

  renderTags(region.metadata.tags || [], targets);
  renderLore(region, galleryEntries, targets);
  renderGallery(galleryEntries, cardTitle, targets);
  if (targets.mediaSection) {
    targets.mediaSection.hidden = !showMediaReadiness;
  }
  if (showMediaReadiness) {
    renderMediaRequirements(mediaRequirements, targets);
  } else {
    if (targets.mediaStatus) targets.mediaStatus.textContent = '';
    if (targets.mediaSummary) targets.mediaSummary.innerHTML = '';
    if (targets.mediaNeeds) targets.mediaNeeds.innerHTML = '';
  }
  renderRegionPromos(region, targets);
  renderItems(region, matchedItems, targets);
  renderHandbookLinks(region, targets);
  renderEntities(region, matchedEntities, mediaRequirements, targets);
}

function renderRegionPromos(region, targets) {
  if (!targets.promoSection || !targets.promos || !targets.promoCount) return;

  const promos = Array.isArray(region?.metadata?.featuredGamePromos)
    ? region.metadata.featuredGamePromos.filter((promo) => promo && promo.title && promo.src)
    : [];

  targets.promos.innerHTML = '';
  targets.promoSection.hidden = promos.length === 0;
  targets.promoCount.textContent = `${promos.length} playable`;
  if (!promos.length) return;

  promos.forEach((promo) => {
    const card = document.createElement('article');
    card.className = 'item-card promo-card';

    const body = document.createElement('div');
    body.className = 'item-card-body';

    const heading = document.createElement('h4');
    heading.textContent = promo.title;

    const detail = document.createElement('p');
    detail.textContent = promo.description;

    const notice = document.createElement('p');
    notice.className = 'promo-launch-note';
    notice.textContent = promo.launchNotice || 'Opens in a separate popup game window.';

    const footer = document.createElement('div');
    footer.className = 'card-actions';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'atlas-button atlas-button-ghost';
    button.textContent = promo.buttonLabel || 'Open in popup window';
    button.addEventListener('click', () => {
      openAtlasPromoPopup(promo.src, promo.popupTitle || promo.title);
    });

    footer.appendChild(button);
    body.append(heading, detail, notice, footer);
    card.appendChild(body);
    targets.promos.appendChild(card);
  });
}

function openAtlasPromoPopup(src, windowTitle) {
  const targetSrc = String(src || '').trim();
  if (!targetSrc) return;

  const width = Math.min(1400, Math.max(900, window.innerWidth - 120));
  const height = Math.min(1000, Math.max(700, window.innerHeight - 120));
  const left = Math.max(0, Math.round((window.screenX || window.screenLeft || 0) + (window.innerWidth - width) / 2));
  const top = Math.max(0, Math.round((window.screenY || window.screenTop || 0) + (window.innerHeight - height) / 2));
  const features = `popup=yes,width=${width},height=${height},left=${left},top=${top}`;
  const popup = window.open(targetSrc, windowTitle || '_blank', features);

  if (popup) {
    try { popup.opener = null; } catch (_) {}
    try { popup.focus(); } catch (_) {}
  }
}

function normalizeLoreEntries(region, galleryEntries) {
  const sections = Array.isArray(region?.metadata?.loreSections) ? region.metadata.loreSections : [];
  return sections
    .map((section, index) => {
      const fallbackImage = galleryEntries[Math.min(index, Math.max(galleryEntries.length - 1, 0))]?.src
        || galleryEntries[0]?.src
        || REGION_IMAGE_FALLBACK;
      return {
        title: String(section?.title || '').trim(),
        text: String(section?.text || '').trim(),
        image: normalizeAtlasAssetPath(section?.image || section?.src || fallbackImage, REGION_IMAGE_FALLBACK),
        imageLabel: String(section?.imageLabel || section?.label || `Lore visual ${index + 1}`).trim(),
      };
    })
    .filter((section) => section.title && section.text);
}

function renderLore(region, galleryEntries, targets) {
  if (!targets.lore) return;
  const loreEntries = normalizeLoreEntries(region, galleryEntries);
  targets.lore.innerHTML = '';

  if (!loreEntries.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No structured lore pairings are attached to this region yet.';
    targets.lore.appendChild(emptyState);
    return;
  }

  loreEntries.forEach((entry) => {
    const block = document.createElement('article');
    block.className = 'lore-block';

    const visual = document.createElement('figure');
    visual.className = 'lore-block-visual';

    const imageTrigger = document.createElement('button');
    imageTrigger.type = 'button';
    imageTrigger.className = 'lore-image-trigger';
    imageTrigger.setAttribute('aria-label', `Expand lore image: ${entry.imageLabel}`);

    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = entry.image;
    image.alt = `${region.title}: ${entry.imageLabel}`;
    image.onerror = () => {
      image.src = REGION_IMAGE_FALLBACK;
    };
    imageTrigger.append(image);
    imageTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLoreImageLightbox({
        src: image.currentSrc || image.src || entry.image,
        alt: image.alt,
        caption: '',
        trigger: imageTrigger,
      });
    });

    visual.append(imageTrigger);

    const content = document.createElement('div');
    content.className = 'lore-block-body';

    const heading = document.createElement('h4');
    heading.textContent = entry.title;

    const copy = document.createElement('p');
    copy.textContent = entry.text;

    content.append(heading, copy);
    block.append(visual, content);
    targets.lore.appendChild(block);
  });
}

function ensureLoreLightboxElements() {
  if (state.loreLightbox?.node && state.loreLightbox.node.isConnected) {
    return state.loreLightbox;
  }

  const node = document.createElement('div');
  node.className = 'atlas-lightbox';
  node.hidden = true;
  node.setAttribute('aria-hidden', 'true');

  const dialog = document.createElement('div');
  dialog.className = 'atlas-lightbox-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Expanded lore artwork');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'atlas-lightbox-close atlas-button atlas-button-ghost';
  closeButton.textContent = 'Close';

  const image = document.createElement('img');
  image.className = 'atlas-lightbox-image';
  image.alt = '';
  image.loading = 'eager';
  image.decoding = 'async';
  image.onerror = () => {
    image.src = REGION_IMAGE_FALLBACK;
  };

  const caption = document.createElement('p');
  caption.className = 'atlas-lightbox-caption';

  dialog.append(closeButton, image, caption);
  node.appendChild(dialog);
  document.body.appendChild(node);

  node.addEventListener('click', (event) => {
    if (event.target === node) {
      closeLoreImageLightbox();
    }
  });
  closeButton.addEventListener('click', () => closeLoreImageLightbox());

  state.loreLightbox = {
    node,
    dialog,
    image,
    caption,
    closeButton,
    lastTrigger: null,
    isOpen: false,
  };

  return state.loreLightbox;
}

function openLoreImageLightbox({ src, alt, caption, trigger }) {
  const lightbox = ensureLoreLightboxElements();
  const resolvedSrc = normalizeAtlasAssetPath(src, REGION_IMAGE_FALLBACK);

  lightbox.image.src = resolvedSrc;
  lightbox.image.alt = alt || 'Expanded lore artwork';
  lightbox.caption.textContent = caption || '';
  lightbox.lastTrigger = trigger || null;
  lightbox.node.hidden = false;
  lightbox.node.classList.add('is-open');
  lightbox.node.setAttribute('aria-hidden', 'false');
  lightbox.isOpen = true;
  document.body.classList.add('atlas-lightbox-open');
  lightbox.closeButton.focus();
}

function closeLoreImageLightbox({ restoreFocus = true } = {}) {
  const lightbox = state.loreLightbox;
  if (!lightbox?.isOpen) return;

  lightbox.isOpen = false;
  lightbox.node.classList.remove('is-open');
  lightbox.node.setAttribute('aria-hidden', 'true');
  lightbox.node.hidden = true;
  document.body.classList.remove('atlas-lightbox-open');

  if (restoreFocus && lightbox.lastTrigger && lightbox.lastTrigger.isConnected) {
    lightbox.lastTrigger.focus();
  }
  lightbox.lastTrigger = null;
}

function renderWelcomeState(title = 'Select a region') {
  state.selectedRegion = null;
  syncSelectedRegionButton();
}

function renderTags(tags, targets) {
  targets.tags.innerHTML = '';
  tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = 'detail-tag';
    span.textContent = tag;
    targets.tags.appendChild(span);
  });
}

function normalizeGalleryEntries(images) {
  const entries = Array.isArray(images) && images.length ? images : [REGION_IMAGE_FALLBACK];
  return entries.map((entry, index) => {
    if (typeof entry === 'string') {
      return {
        src: normalizeAtlasAssetPath(entry, REGION_IMAGE_FALLBACK),
        label: index === 0 ? 'Primary art slot' : `Gallery slot ${index + 1}`,
      };
    }

    return {
      src: normalizeAtlasAssetPath(entry?.src, REGION_IMAGE_FALLBACK),
      label: entry?.label || (index === 0 ? 'Primary art slot' : `Gallery slot ${index + 1}`),
    };
  });
}

function renderGallery(images, regionTitle, targets) {
  targets.gallery.innerHTML = '';
  images.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = normalizeAtlasAssetPath(entry.src, REGION_IMAGE_FALLBACK);
    image.alt = `${regionTitle} gallery image ${index + 1}`;
    image.onerror = () => {
      image.src = REGION_IMAGE_FALLBACK;
    };
    card.append(image);
    targets.gallery.appendChild(card);
  });
}

function buildMediaRequirements(region, galleryEntries, matchedItems) {
  const usesPlaceholderHero = (galleryEntries[0]?.src || '') === REGION_IMAGE_FALLBACK;
  const galleryNeeds = region.metadata.mediaNeeds?.length
    ? [...region.metadata.mediaNeeds]
    : [];

  if (usesPlaceholderHero) {
    galleryNeeds.unshift(`Add a dedicated hero image for ${region.title}.`);
  }
  if (galleryEntries.length < 2) {
    galleryNeeds.push('Add at least one supporting gallery image so the region reads as furnished rather than stubbed.');
  }
  if (!region.metadata.musicLabel || /pending/i.test(region.metadata.musicLabel)) {
    galleryNeeds.push('Assign a region-specific music playlist or confirm that shared atlas audio is intentional.');
  }
  if (!matchedItems.length) {
    galleryNeeds.push('Review whether this region needs curated item links because automatic matches are currently empty.');
  }

  const uniqueNeeds = Array.from(new Set(galleryNeeds));
  const furnishedCount = galleryEntries.filter((entry) => entry.src && entry.src !== REGION_IMAGE_FALLBACK).length;
  const statusLabel = uniqueNeeds.length === 0 ? 'Furnished' : uniqueNeeds.length <= 2 ? 'Mostly furnished' : 'Needs assets';

  return {
    statusLabel,
    summary: [
      { title: 'Gallery Coverage', body: `${furnishedCount}/${galleryEntries.length} gallery slots use non-placeholder local art.` },
      { title: 'Item Hooks', body: matchedItems.length ? `${matchedItems.length} automatic item links found from existing handbook data.` : 'No automatic item links yet.' },
      { title: 'Music State', body: region.metadata.musicLabel || 'Playlist pending' },
      { title: 'Resource Manifests', body: buildResourceManifestSummary(region.metadata.resourceSources) },
    ],
    needs: uniqueNeeds,
  };
}

function buildResourceManifestSummary(resourceSources) {
  const sources = Array.isArray(resourceSources) ? resourceSources : [];
  if (!sources.length) {
    return 'Inline region metadata only.';
  }
  return sources.map((source) => source.label || source.type || 'resource').join(', ');
}

function initMusicPlayer() {
  const audio = new Audio();
  audio.preload = 'none';
  audio.volume = Number(elements.atlasMusicVolume?.value || 72) / 100;
  audio.muted = false;
  audio.addEventListener('play', syncTopMusicPlayer);
  audio.addEventListener('pause', syncTopMusicPlayer);
  audio.addEventListener('volumechange', syncTopMusicPlayer);
  audio.addEventListener('ended', () => {
    const player = state.musicPlayer;
    if (!player.trackSources.length) return;
    player.index = (player.index + 1) % player.trackSources.length;
    void playCurrentRegionTrack();
  });
  audio.addEventListener('error', () => {
    const player = state.musicPlayer;
    if (!player.trackSources.length) return;
    const nextIndex = player.index + 1;
    if (nextIndex >= player.trackSources.length) {
      setMusicStatus('Unable to load mapped track');
      syncTopMusicPlayer();
      return;
    }
    player.index = nextIndex;
    void playCurrentRegionTrack();
  });
  state.musicPlayer.audio = audio;
  syncTopMusicPlayer();
}

function toggleGlobalMute() {
  const audio = state.musicPlayer.audio;
  if (!audio) return;
  audio.muted = !audio.muted;
  syncTopMusicPlayer();
}

function getRegionTracks(region) {
  const raw = String(region?.metadata?.musicLabel || '');
  if (!raw || /pending/i.test(raw)) return [];
  return raw
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toMusicLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toMusicFileName(trackName) {
  const key = toMusicLookupKey(trackName);
  return MUSIC_FILE_OVERRIDES[key] || `${trackName}.mp3`;
}

function toMusicSource(fileName) {
  return `${WORLD_MAP_MUSIC_BASE}${encodeURIComponent(fileName)}`;
}

function setMusicStatus(text) {
  if (state.musicPlayer.statusNode) {
    state.musicPlayer.statusNode.textContent = text;
  }
}

function startRegionMusic(region, statusNode) {
  const trackNames = getRegionTracks(region);
  if (!trackNames.length) {
    setMusicStatus(region?.metadata?.musicLabel || 'Playlist pending');
    return;
  }

  const player = state.musicPlayer;
  player.regionSlug = region.slug;
  player.regionTitle = getRegionCardTitle(region);
  player.trackNames = trackNames;
  player.trackSources = trackNames.map((name) => toMusicSource(toMusicFileName(name)));
  player.index = 0;
  player.statusNode = statusNode;
  setMusicStatus(`Loading: ${trackNames[0]}`);
  syncTopMusicPlayer();
  void playCurrentRegionTrack();
}

async function playCurrentRegionTrack() {
  const player = state.musicPlayer;
  if (!player.audio || !player.trackSources.length) return;

  const source = player.trackSources[player.index];
  const name = player.trackNames[player.index];
  player.audio.src = source;

  try {
    await player.audio.play();
    setMusicStatus(`Now playing: ${name}`);
    syncTopMusicPlayer();
  } catch {
    setMusicStatus(`Click to play: ${name}`);
    syncTopMusicPlayer();
  }
}

function toggleRegionMusic(region, statusNode) {
  const player = state.musicPlayer;
  if (!player.audio) return;

  if (player.regionSlug !== region.slug || !player.trackSources.length) {
    startRegionMusic(region, statusNode);
    return;
  }

  player.statusNode = statusNode;
  if (player.audio.paused) {
    void playCurrentRegionTrack();
  } else {
    player.audio.pause();
    setMusicStatus(`Paused: ${player.trackNames[player.index]}`);
    syncTopMusicPlayer();
  }
}

function syncTopMusicPlayer() {
  const player = state.musicPlayer;
  const audio = player.audio;
  const isPlaying = Boolean(player.regionSlug && player.trackNames.length && audio && !audio.paused);
  const isMuted = Boolean(audio?.muted);

  if (elements.atlasMusicPlayer) {
    elements.atlasMusicPlayer.hidden = !isPlaying;
  }

  if (elements.atlasMusicTrack) {
    const trackName = player.trackNames[player.index] || 'Unknown track';
    elements.atlasMusicTrack.textContent = trackName;
  }

  if (elements.atlasMusicRegion) {
    elements.atlasMusicRegion.textContent = player.regionTitle || 'Unknown region';
  }

  if (elements.atlasMusicPlayPause) {
    elements.atlasMusicPlayPause.textContent = audio && !audio.paused ? 'Pause' : 'Play';
  }

  if (elements.atlasMusicVolume && audio) {
    elements.atlasMusicVolume.value = String(Math.round(audio.volume * 100));
  }

  if (elements.atlasGlobalMute) {
    elements.atlasGlobalMute.setAttribute('aria-pressed', String(isMuted));
    elements.atlasGlobalMute.setAttribute('aria-label', isMuted ? 'Unmute atlas audio' : 'Mute all atlas audio');
    elements.atlasGlobalMute.setAttribute('title', isMuted ? 'Unmute atlas audio' : 'Mute all atlas audio');
    elements.atlasGlobalMute.classList.toggle('is-muted', isMuted);
  }
}

function renderMediaRequirements(requirements, targets) {
  targets.mediaStatus.textContent = requirements.statusLabel;
  targets.mediaSummary.innerHTML = '';
  requirements.summary.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'summary-card';
    const heading = document.createElement('h4');
    heading.textContent = entry.title;
    const copy = document.createElement('p');
    copy.textContent = entry.body;
    card.append(heading, copy);
    targets.mediaSummary.appendChild(card);
  });

  targets.mediaNeeds.innerHTML = '';
  if (!requirements.needs.length) {
    targets.mediaNeeds.innerHTML = '<div class="empty-state">This region currently reads as fully furnished for phase 1.</div>';
    return;
  }

  requirements.needs.forEach((need) => {
    const item = document.createElement('div');
    item.className = 'checklist-item';
    item.textContent = need;
    targets.mediaNeeds.appendChild(item);
  });
}

function renderItems(region, items, targets) {
  targets.items.innerHTML = '';
  if (targets.itemActions) targets.itemActions.innerHTML = '';

  const isExpanded = state.expandedItemRegions.has(region.slug);
  const visibleCount = isExpanded ? items.length : Math.min(items.length, REGION_ITEM_CARD_LIMIT);
  targets.itemCount.textContent = items.length > REGION_ITEM_CARD_LIMIT
    ? `${isExpanded ? 'Showing all' : 'Showing'} ${visibleCount} of ${items.length} linked`
    : `${items.length} linked`;

  if (!items.length) {
    targets.items.innerHTML = '<div class="empty-state">No automatic item links found yet for this region. Add curated references to enrich the fact file.</div>';
    return;
  }

  items.slice(0, visibleCount).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'item-card';
    const featuredNote = region.metadata.featuredItemNotes?.[item.name];
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = resolveItemImage(item);
    image.alt = `${item.name} item image`;
    image.onerror = () => {
      image.src = ITEM_IMAGE_FALLBACK;
    };

    const body = document.createElement('div');
    body.className = 'item-card-body';
    const heading = document.createElement('h4');
    heading.textContent = item.name;
    const meta = document.createElement('p');
    meta.textContent = item.location || item.type || 'Item data linked from the handbook database.';
    const detail = document.createElement('p');
    detail.textContent = truncateText(item.description || item.effect || item.benefit || 'Existing item data is available but still needs a region-specific curator note.', 140);
    if (featuredNote) {
      body.appendChild(createFeaturedNote('Featured item note', featuredNote));
    }
    const footer = document.createElement('div');
    footer.className = 'card-actions';
    footer.appendChild(createViewerLink(`src/items.html?q=${encodeURIComponent(item.name)}`, 'Open in item viewer', {
      toolKey: 'items',
      query: item.name,
    }));
    body.append(heading, meta, detail);
    body.appendChild(footer);
    card.append(image, body);
    targets.items.appendChild(card);
  });

  if (items.length > REGION_ITEM_CARD_LIMIT && targets.itemActions) {
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'atlas-button atlas-button-ghost';
    toggleButton.textContent = isExpanded ? 'Show fewer linked items' : `View all ${items.length} linked items`;
    toggleButton.addEventListener('click', () => {
      if (state.expandedItemRegions.has(region.slug)) {
        state.expandedItemRegions.delete(region.slug);
      } else {
        state.expandedItemRegions.add(region.slug);
      }
      renderRegionDetails(region, targets);
    });
    targets.itemActions.appendChild(toggleButton);
  }
}

function renderHandbookLinks(region, targets) {
  if (!targets.handbookSection || !targets.handbookLinks || !targets.handbookCount) return;

  const entries = buildRegionHandbookEntries(region);
  targets.handbookLinks.innerHTML = '';
  targets.handbookSection.hidden = entries.length === 0;
  targets.handbookCount.textContent = `${entries.length} linked`;
  if (!entries.length) return;

  entries.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'item-card';

    const body = document.createElement('div');
    body.className = 'item-card-body';

    const heading = document.createElement('h4');
    heading.textContent = entry.name;

    const meta = document.createElement('p');
    meta.textContent = entry.kind;

    const detail = document.createElement('p');
    detail.textContent = entry.note;

    const footer = document.createElement('div');
    footer.className = 'card-actions';
    footer.appendChild(createViewerLink(entry.href, entry.label, {
      toolKey: entry.toolKey,
      query: entry.name,
    }));

    body.append(heading, meta, detail, footer);
    card.appendChild(body);
    targets.handbookLinks.appendChild(card);
  });
}

function buildRegionHandbookEntries(region) {
  const entries = [];
  const raceNames = Array.isArray(region?.metadata?.curatedRaceNames) ? region.metadata.curatedRaceNames : [];
  const backgroundNames = Array.isArray(region?.metadata?.curatedBackgroundNames) ? region.metadata.curatedBackgroundNames : [];
  const raceNotes = region?.metadata?.featuredRaceNotes || {};
  const backgroundNotes = region?.metadata?.featuredBackgroundNotes || {};

  raceNames.forEach((name) => {
    entries.push({
      name,
      kind: 'Race',
      note: raceNotes[name] || `${name} has a strong cultural or ecological tie to ${region.title}.`,
      label: 'Open in races',
      toolKey: 'races',
      href: `src/races.html?q=${encodeURIComponent(name)}`,
    });
  });

  backgroundNames.forEach((name) => {
    entries.push({
      name,
      kind: 'Background',
      note: backgroundNotes[name] || `${name} is a strong character hook for stories rooted in ${region.title}.`,
      label: 'Open in backgrounds',
      toolKey: 'backgrounds',
      href: `backgrounds.html?q=${encodeURIComponent(name)}`,
    });
  });

  return entries;
}

function renderEntities(region, entities, mediaRequirements, targets) {
  targets.entities.innerHTML = '';
  if (!entities.length) {
    const placeholders = [
      {
        title: 'No regional bestiary hits yet',
        body: `The atlas searched the full bestiary for ${region.title} using the region title and location terms, but nothing scored above the cutoff. This region likely needs explicit curation terms or lore copy that mentions its inhabitants directly.`,
        image: MONSTER_IMAGE_FALLBACK,
      },
      {
        title: 'Next media target',
        body: mediaRequirements.needs[0] || 'This region has enough asset coverage to start curating local entities and portraits.',
        image: REGION_IMAGE_FALLBACK,
      },
    ];

    placeholders.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'entity-card';
      const image = document.createElement('img');
      image.src = entry.image;
      image.alt = entry.title;
      image.onerror = () => {
        image.src = REGION_IMAGE_FALLBACK;
      };
      const body = document.createElement('div');
      body.className = 'entity-card-body';
      const heading = document.createElement('h4');
      heading.textContent = entry.title;
      const copy = document.createElement('p');
      copy.textContent = entry.body;
      body.append(heading, copy);
      card.append(image, body);
      targets.entities.appendChild(card);
    });

    targets.entityCount.textContent = 'Needs curation';
    return;
  }

  entities.slice(0, 12).forEach((entity) => {
    const card = document.createElement('article');
    card.className = 'entity-card';
    const featuredNote = region.metadata.featuredEntityNotes?.[entity.name];
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = resolveMonsterImage(entity);
    image.alt = entity.name;
    image.onerror = () => {
      image.src = MONSTER_IMAGE_FALLBACK;
    };
    const body = document.createElement('div');
    body.className = 'entity-card-body';
    const heading = document.createElement('h4');
    heading.textContent = entity.name;
    const meta = document.createElement('p');
    meta.textContent = [entity.crStr ? `CR ${entity.crStr}` : '', entity.size, entity.race].filter(Boolean).join(' | ') || 'Bestiary entry';
    const copy = document.createElement('p');
    copy.textContent = truncateText(entity.description || entity.environment || 'Bestiary entry linked from the full handbook creature database.', 180);
    if (featuredNote) {
      body.appendChild(createFeaturedNote('Featured entity note', featuredNote));
    }
    const footer = document.createElement('div');
    footer.className = 'card-actions';
    footer.appendChild(createViewerLink(`bestiary.html?q=${encodeURIComponent(entity.name)}`, 'Open in bestiary', {
      toolKey: 'bestiary',
      query: entity.name,
    }));
    body.append(heading, meta, copy, footer);
    card.append(image, body);
    targets.entities.appendChild(card);
  });

  targets.entityCount.textContent = `${entities.length} matched`;
}

function createFeaturedNote(label, text) {
  const note = document.createElement('div');
  note.className = 'featured-note';

  const heading = document.createElement('strong');
  heading.className = 'featured-note-label';
  heading.textContent = label;

  const copy = document.createElement('p');
  copy.textContent = text;

  note.append(heading, copy);
  return note;
}

function findItemsForRegion(region) {
  const items = Array.isArray(window.itemsData) ? window.itemsData : [];
  const curatedItems = findCuratedMatches(items, region.metadata.curatedItemNames);
  const terms = buildItemTerms(region);
  if (!terms.length) return curatedItems;

  const scoredItems = scoreMatches(items, (item) => ({
    name: item.name || '',
    primary: item.location || '',
    secondary: item.type || '',
  }))
    .filter((entry) => entry.score >= 4)
    .map((entry) => entry.item);

  return mergeUniqueByName(curatedItems, scoredItems);

  function scoreMatches(sourceItems, pickFields) {
    return sourceItems
      .map((item) => {
        const fields = pickFields(item);
        return { item, score: scoreAgainstTerms(fields, terms) };
      })
      .sort((left, right) => right.score - left.score || String(left.item.name).localeCompare(String(right.item.name)));
  }
}

function buildItemTerms(region) {
  return Array.from(
    new Set([
      region.title,
      ...(region.metadata.locationTerms || []),
    ].map(normalize).filter((term) => term && !ITEM_TERM_STOPWORDS.has(term))),
  );
}

function findEntitiesForRegion(region) {
  const monsters = Array.isArray(state.monsters) ? state.monsters : [];
  const curatedEntities = findCuratedMatches(monsters, region.metadata.curatedEntityNames);
  const curatedFallbacks = buildCuratedEntityFallbacks(region, curatedEntities);
  const curatedResults = mergeUniqueByName(curatedEntities, curatedFallbacks);
  const terms = buildRegionTerms(region);
  if (!monsters.length) return curatedResults;
  if (!terms.length) return curatedResults;

  const scoredEntities = monsters
    .map((monster) => ({
      monster,
      score: scoreAgainstTerms(
        {
          name: monster.name || '',
          primary: monster.environment || '',
          secondary: [monster.description, monster.race].filter(Boolean).join(' '),
        },
        terms,
      ),
    }))
    .filter((entry) => entry.score >= 2)
    .sort((left, right) => right.score - left.score || String(left.monster.name).localeCompare(String(right.monster.name)))
    .map((entry) => entry.monster);

  return mergeUniqueByName(curatedResults, scoredEntities);
}

function buildCuratedEntityFallbacks(region, matchedEntities) {
  const curatedNames = Array.isArray(region?.metadata?.curatedEntityNames) ? region.metadata.curatedEntityNames : [];
  if (!curatedNames.length) return [];

  const matchedKeys = new Set((Array.isArray(matchedEntities) ? matchedEntities : []).map((entity) => normalize(entity?.name)));
  return curatedNames
    .filter((name) => !matchedKeys.has(normalize(name)))
    .map((name) => ({
      name,
      description: `${name} is part of the curated ${region.title} regional bestiary entry set.`,
      race: 'Regional bestiary',
      size: '',
      crStr: '',
      imageUrl: '',
      environment: region.title,
    }));
}

function findCuratedMatches(sourceItems, curatedNames) {
  if (!Array.isArray(sourceItems) || !Array.isArray(curatedNames) || !curatedNames.length) return [];

  const lookup = new Map(
    sourceItems
      .filter((item) => item && item.name)
      .map((item) => [normalize(item.name), item]),
  );

  return curatedNames
    .map((name) => lookup.get(normalize(name)))
    .filter(Boolean);
}

function mergeUniqueByName(preferredItems, fallbackItems) {
  const merged = [];
  const seen = new Set();

  [preferredItems, fallbackItems].forEach((items) => {
    items.forEach((item) => {
      const key = normalize(item?.name);
      if (!key || seen.has(key)) return;
      seen.add(key);
      merged.push(item);
    });
  });

  return merged;
}

function buildRegionTerms(region) {
  return Array.from(
    new Set([
      region.title,
      ...(region.metadata.locationTerms || []),
      ...(region.metadata.tags || []),
    ].map(normalize).filter(Boolean)),
  );
}

function scoreAgainstTerms(fields, terms) {
  const name = normalize(fields.name || '');
  const primary = normalize(fields.primary || '');
  const secondary = normalize(fields.secondary || '');
  let score = 0;

  terms.forEach((term) => {
    if (!term) return;
    if (name.includes(term)) score += 5;
    if (primary.includes(term)) score += 4;
    if (secondary.includes(term)) score += 2;
  });

  return score;
}

function resolveItemImage(item) {
  return normalizeAtlasAssetPath(item?.image, ITEM_IMAGE_FALLBACK);
}

function resolveMonsterImage(monster) {
  const localMonsterImage = resolveLocalMonsterImage(monster);
  if (localMonsterImage) return localMonsterImage;
  return normalizeAtlasAssetPath(monster?.imageUrl || monster?.image, MONSTER_IMAGE_FALLBACK);
}

function resolveLocalMonsterImage(monster) {
  const candidateKeys = [];
  const addCandidate = (value) => {
    const key = normalizeMonsterAssetKey(value);
    if (key && !candidateKeys.includes(key)) candidateKeys.push(key);
  };
  const addNameVariants = (value) => {
    const key = normalizeMonsterAssetKey(value);
    if (!key) return;
    addCandidate(key);
    const stripped = key.replace(/^(darkdimension|darkforme|darkling|primordial|nightmare|the)+/, '');
    if (stripped && stripped !== key) {
      addCandidate(stripped);
      addCandidate(`darkforme${stripped}`);
      addCandidate(`darkling${stripped}`);
      addCandidate(`darkdimension${stripped}`);
    }
  };

  addNameVariants(monster?.name);
  addNameVariants(monster?.title);
  addNameVariants(monster?.displayName);
  addNameVariants(monster?.slug);
  addNameVariants(monster?.race);

  const primaryName = normalizeMonsterAssetKey(monster?.name || monster?.title || '');
  if (primaryName.includes('cackler')) {
    if (primaryName.includes('giggling')) addCandidate('darklingcanopygiggler');
    if (primaryName.includes('mawfaced')) addCandidate('darklingcanopycacklermawface');
    if (primaryName.includes('canopy')) addCandidate('darklingcanopycackler');
  }

  for (const candidateKey of candidateKeys) {
    const mappedKey = normalizeMonsterAssetKey(MONSTER_LOCAL_IMAGE_ALIASES[candidateKey] || candidateKey);
    const localImage = MONSTER_LOCAL_IMAGE_INDEX[mappedKey];
    if (localImage) return localImage;
  }

  return '';
}

function normalizeMonsterAssetKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function normalizeAtlasAssetPath(value, fallback) {
  const raw = String(value || '').trim().replace(/\\/g, '/');
  if (!raw) return fallback;
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  if (raw.startsWith('/src/')) return raw.slice(1);
  if (raw.startsWith('./src/')) return raw.slice(2);
  if (raw.startsWith('src/')) return raw;
  if (raw.startsWith('/assets/')) return `src${raw}`;
  if (raw.startsWith('assets/')) return `src/${raw}`;
  if (raw.startsWith('./assets/')) return `src/${raw.slice(2)}`;
  if (raw.startsWith('/')) return raw.slice(1);
  return raw;
}

function resolveHandbookNavigator() {
  const candidates = [];
  if (window.parent && window.parent !== window) candidates.push(window.parent);
  if (window.top && window.top !== window.parent && window.top !== window) candidates.push(window.top);

  for (const candidate of candidates) {
    try {
      if (typeof candidate.handbookNavigateToTool === 'function') return candidate;
    } catch (_) {
      // Ignore cross-origin access failures and continue.
    }
  }

  return null;
}

function createViewerLink(href, label, destination = null) {
  const link = document.createElement('a');
  link.className = 'viewer-link';
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  if (destination?.toolKey && destination?.query) {
    link.addEventListener('click', (event) => {
      const handbookHost = resolveHandbookNavigator();
      if (!handbookHost) return;
      event.preventDefault();
      handbookHost.handbookNavigateToTool(destination.toolKey, destination.query);
    });
  }
  return link;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function showTooltip(event, region) {
  elements.tooltip.hidden = false;
  elements.tooltip.innerHTML = `<strong>${escapeHtml(region.title)}</strong><span>${escapeHtml(getRegionTooltipDescription(region))}</span>`;
  moveTooltip(event);
}

function moveTooltip(event) {
  if (elements.tooltip.hidden) return;
  const frame = document.getElementById('mapFrame').getBoundingClientRect();
  const left = event.clientX - frame.left + 18;
  const top = event.clientY - frame.top + 18;
  elements.tooltip.style.left = `${left}px`;
  elements.tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  elements.tooltip.hidden = true;
}

function toggleDrawer(drawerId) {
  const drawer = getDrawer(drawerId);
  if (!drawer) return;
  const shouldOpen = !drawer.classList.contains('is-open');
  closeAllDrawers();
  if (shouldOpen) {
    openDrawer(drawerId);
  }
}

function openDrawer(drawerId) {
  const drawer = getDrawer(drawerId);
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  syncBackdrop();
}

function closeDrawer(drawerId) {
  const drawer = getDrawer(drawerId);
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  syncBackdrop();
}

function closeAllDrawers() {
  [elements.controlsDrawer].forEach((drawer) => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  });
  syncBackdrop();
}

function syncBackdrop() {
  const anyOpen = [elements.controlsDrawer].some((drawer) => drawer?.classList.contains('is-open'));
  if (elements.backdrop) {
    elements.backdrop.hidden = !anyOpen;
  }
}

function getDrawer(drawerId) {
  if (!drawerId) return null;
  return document.getElementById(drawerId);
}

function onSearchInput() {
  renderRegions();
  const query = normalize(elements.search.value);
  if (!query) return;
  const firstMatch = state.regions.find((region) => normalize(region.title).includes(query));
  if (firstMatch) {
    selectRegion(firstMatch);
  }
}

function toggleBookmarksOnly() {
  state.bookmarksOnly = !state.bookmarksOnly;
  elements.bookmarkToggle.setAttribute('aria-pressed', String(state.bookmarksOnly));
  elements.bookmarkToggle.textContent = state.bookmarksOnly ? 'Showing bookmarks' : 'Bookmarks only';
  renderRegions();
}

function toggleBookmark(slug) {
  if (state.bookmarks.has(slug)) {
    state.bookmarks.delete(slug);
  } else {
    state.bookmarks.add(slug);
  }
  saveBookmarks(state.bookmarks);
}

function loadBookmarks() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(BOOKMARK_KEY) || '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(bookmarks) {
  window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(bookmarks)));
}

function setStatus(message) {
  if (elements.status) elements.status.textContent = message;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function truncateText(value, maxLength) {
  const text = String(value || '').trim();
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'region';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

init();
