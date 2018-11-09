const reviveDescription = 'Play to your Journey pile and immediately play a discarded card.';
const turncoatDescription = 'Play to an opponent’s Journey pile and draw two cards.';
const driverDescription = 'Play to your Journey area to travel {{distance}} miles.';

module.exports = [
	// SABOTAGE
	{
		type: 'sabotage',
		name: 'Puncture',
		description: 'Play on an opponent’s sabotage pile to halt their journey.',
		effect: 'puncture',
		quantity: 3
	},
	{
		type: 'sabotage',
		name: 'Speed Limit',
		description: 'Play on an opponent’s sabotage pile to limit them to 15 or lower.',
		effect: 'speedlimit',
		quantity: 3
	},
	{
		type: 'sabotage',
		name: 'Pursuit',
		description: 'Play on an opponent’s sabotage pile to limit them to 75 or higher.',
		effect: 'pursuit',
		quantity: 3
	},
	{
		type: 'sabotage',
		name: 'Detour',
		description: 'Discard this card and all of the highest cards in play.',
		effect: 'detour',
		quantity: 3
	},

	// REMEDIES
	{
		type: 'remedy',
		name: 'New tire',
		description: 'Play on your sabotage pile to fix a Puncture.',
		remedies: 'puncture',
		quantity: 3
	},
	{
		type: 'remedy',
		name: 'End of limit',
		description: 'Play on your sabotage pile to end a Speed Limit.',
		remedies: 'speedlimit',
		quantity: 3
	},
	{
		type: 'remedy',
		name: 'Escape',
		description: 'Play on your sabotage pile to end a Pursuit.',
		remedies: 'pursuit',
		quantity: 3
	},

	// SKILLED DRIVERS
	{
		type: 'driver',
		name: 'The Brute', // F
		description: 'Play to your Journey area to protect against Puncture.',
		quote: 'Life on the inside had taken its toll. But he lugged the Plymouth {{distance}} damn miles.',
		artwork: 'brute',
		distance: 10,
		remedies: 'puncture',
		prevents: 'puncture',
		quantity: 2
	},
	{
		type: 'driver',
		name: 'Wheelman',
		description: 'Play on your Journey area to protect against Pursuits.',
		quote: 'The thrill of the chase. He knew how to handle the Plymouth, but I hope to never see his gnarly mug again.',
		artwork: 'wheelman',
		distance: 30,
		remedies: 'pursuit',
		prevents: 'pursuit',
		quantity: 2
	},
	{
		type: 'driver',
		name: 'Mayor Ducane', // F
		description: 'Play to your Journey area to protect against Speed Limits.',
		quote: 'A buck here, a buck there, you make your name with the Mayor. No limits for the Mayor.',
		artwork: 'mayor',
		distance: 50,
		remedies: 'speedlimit',
		prevents: 'speedlimit',
		quantity: 2
	},
	{
		type: 'driver',
		name: 'Detective Briggs',
		description: 'Play on your Journey area to protect against Detours.',
		quote: 'I give a beat cop 20 bucks to guide the way. He knows the backstreets, the rough parts of town.',
		distance: 30,
		artwork: 'detective',
		prevents: 'detour',
		quantity: 2
	},

	// REVIVES
	{
		type: 'driver',
		name: 'Mafia Clinic',
		description: reviveDescription,
		quote: 'A nurse took a drag of a cigarette and handed me a cup of brown. Tasted of ash.',
		artwork: 'nurse',
		distance: 0,
		effect: 'revive',
		quantity: 2
	},
	{
		type: 'driver',
		name: 'Animal Clinic',
		description: reviveDescription,
		quote: 'He was a grisly guy with a stench of fomaldehyde. But here’s a guy who won’t ask questions.',
		artwork: 'doctor',
		distance: 0,
		effect: 'revive',
		quantity: 2
	},

	// TURNCOATS
	{
		type: 'driver',
		name: 'Turncoat Rita',
		description: turncoatDescription,
		quote: 'Rita said it was better on the outside. She was feeding me a can of lies. Damn you Rita. Broke my heart.',
		artwork: 'rita',
		distance: 0,
		effect: 'turncoat',
		quantity: 1
	},
	{
		type: 'driver',
		name: 'Crafty Jenkins',
		description: turncoatDescription,
		quote: 'I never trusted Jenkins. Had her hat in too many rings. Scarlet lipstick... color of betrayal.',
		artwork: 'jenkins',
		effect: 'turncoat',
		distance: 20,
		quantity: 1
	},
	{
		type: 'driver',
		name: 'Bill',
		description: turncoatDescription,
		quote: 'Bill was the kind of bastard you never trust. He’d sell out his own mother for a fix.',
		artwork: 'bill',
		distance: 50,
		effect: 'turncoat',
		quantity: 1
	},

	// DRIVER
	{
		type: 'driver',
		name: 'Old Smokey',
		description: driverDescription,
		quote: 'The stench of cheap cigarettes. He asks if I’ve got a light. I fumble for a match. Something wasn’t right.',
		artwork: 'smokey',
		distance: 5,
		quantity: 6
	},
	{
		type: 'driver',
		name: 'Dolly',
		description: driverDescription,
		quote: 'Dolly looked like your everyday grandma. But she was armed to the teeth. Nobody dared get close to us.',
		artwork: 'dolly',
		distance: 10,
		quantity: 8
	},
	{
		type: 'driver',
		name: 'Butler',
		description: driverDescription,
		quote: 'Butler’s an old pal. Last job he took four slugs to the chest. Now he’s got a stare that could kill a puppy.',
		artwork: 'butler',
		distance: 15,
		quantity: 10
	},
	{
		type: 'driver',
		name: 'Cat Ducane',
		description: driverDescription,
		quote: 'Cat’s an ex-cop. I throw a wad of cash. Paying to not get noticed. She didn’t give a damn who I am.',
		artwork: 'cat',
		distance: 30,
		quantity: 8
	},
	{
		type: 'driver',
		name: 'Phelps',
		description: driverDescription,
		quote: 'The outsider. The loner. There are only tales of Phelps, he leaves no witnesses. But he drives stick.',
		artwork: 'phelps',
		distance: 50,
		quantity: 6
	},
	{
		type: 'driver',
		name: 'Shadow',
		description: driverDescription,
		quote: 'A shadow in the doorway, glow of a cigarette. A broad that won’t ask questions.',
		artwork: 'shadow',
		quantity: 4,
		distance: 75
	},
	{
		type: 'driver',
		name: 'Don Marloni',
		quote: 'A muffled scream in the trunk. The Don, the big man, he’ll rip your teeth out and wear them as cufflinks.',
		description: driverDescription,
		artwork: 'don',
		quantity: 2,
		distance: 100
	}
];