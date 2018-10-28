module.exports = [
	// SABOTAGE
	{
		type: 'sabotage',
		name: 'Stinger',
		description: 'Play on an opponent’s sabotage pile to give them a puncture.',
		quote: '‘This is crazy,’ I mumbled. She threw me that look. I lugged the damn Stinger out of the trunk set it across the street. They didn’t see it coming.',
		artwork: 'sabotage-puncture.jpg',
		effect: 'puncture',
		quantity: 3
	},
	{
		type: 'sabotage',
		name: 'Speed Limit',
		description: 'Play on an opponent’s sabotage pile to stop them playing journey cards higher than 15.',
		quote: 'I gave a beat cop 20 bucks to keep a look out.',
		artwork: 'sabotage-speedlimit.jpg',
		effect: 'speedlimit',
		quantity: 3
	},
	{
		type: 'sabotage',
		name: 'Pursuit',
		description: 'Play on an opponent’s sabotage pile to stop them playing journey cards lower then 75.',
		quote: 'A buck here, a buck there, you make your name with the cops. I dialed 911 and hit call.',
		artwork: 'sabotage-pursuit.jpg',
		effect: 'pursuit',
		quantity: 3
	},
	{
		type: 'sabotage',
		name: 'Detour',
		description: 'Discard this card and all of an opponent’s lowest distances.',
		quote: 'Detour signs litter the junkyard. Useful. I chuck one up on the road. Someone will always follow the signs.',
		artwork: 'sabotage-detour.jpg',
		effect: 'detour',
		quantity: 3
	},

	// REMEDIES
	{
		type: 'remedy',
		name: 'Chop Shop',
		quote: 'It was a shady joint. A shadow in the doorway, glow of a cigarette. A place that won’t ask questions',
		description: 'Play on your sabotage pile to remedy a Stinger.',
		artwork: 'remedy-puncture.jpg',
		remedies: 'puncture',
		quantity: 7
	},
	{
		type: 'remedy',
		name: 'Toll Gate',
		description: 'Play on your sabotage pile to remedy a Speed Limit.',
		quote: 'At the end of the road there’s a police stop. We call it the Toll Gate. But really your paying to not get noticed.',
		artwork: 'remedy-speedlimit.jpg',
		remedies: 'speedlimit',
		quantity: 7
	},
	{
		type: 'remedy',
		name: 'New coat of paint',
		description: 'Play on your sabotage pile to end a Pursuit.',
		quote: 'The cops were onto us. But here was a broad who knew the right color for a Plymouth. Scarlet. The color of her lipstick.',
		artwork: 'remedy-pursuit.jpg',
		remedies: 'pursuit',
		quantity: 7
	},

	// SKILLED DRIVERS
	{
		type: 'driver',
		name: 'The Mechanic', // F
		description: 'Play to your Journey area to protect against Stinger.',
		quote: 'Years doing jobs taught me a thing or two about mechanics. But this gal knew her way about a Plymouth. She was part of the car.',
		artwork: 'driver-mechanic.jpg',
		distance: 10,
		remedies: 'puncture',
		prevents: 'puncture',
		quantity: 3
	},
	{
		type: 'driver',
		name: 'The Brute', // M
		description: 'Play to your Journey area to protect against Pursuit.',
		quote: 'Life on the inside had taken its toll. He could barely murmur a word. But he was armed to the teeth. Nobody dared get close to us.',
		artwork: 'driver-brute.jpg',
		distance: 30,
		remedies: 'pursuit',
		prevents: 'pursuit',
		quantity: 3
	},
	{
		type: 'driver',
		name: 'Mayor Ducane', // F
		description: 'Play to your Journey area to protect against Speed Limit.',
		quote: 'The mayor’s an old friend. She swerves to avoid a crossing gal. ’Broads!’ I shouted. How was I supposed to know she had daughter. We didnt speak a word for 60 damn miles.',
		artwork: 'driver-mayor.jpg',
		distance: 50,
		remedies: 'speedlimit',
		prevents: 'speedlimit',
		quantity: 3
	},
	{
		type: 'driver',
		name: 'The Navigator',
		description: 'Play on your Journey area to protect against Detours.',
		quote: '',
		distance: 30,
		artwork: 'driver-navigator.jpg',
		prevents: 'detour',
		quantity: 3
	},

	// REVIVES
	{
		type: 'driver',
		name: 'Nurse',
		description: 'Play to your Journey pile then pick any discarded card and immediately play it.',
		quote: 'She took a drag of a cigarette and handed me a cup of brown. Tasted of ash.',
		artwork: 'driver-nurse.jpg',
		distance: 0,
		effect: 'revive',
		quantity: 3
	},
	{
		type: 'driver',
		name: 'Vet',
		description: 'Play to your Journey pile then pick any discarded card and immediately play it.',
		quote: 'He was a grisly guy with a stench of fomaldehyde. An animal doctor. Hospital wasn’t an option, so this was the next best thing.',
		artwork: 'driver-vet.jpg',
		distance: 0,
		effect: 'revive',
		quantity: 3
	},

	// TURNCOATS
	{
		type: 'driver',
		name: 'Turncoat Rita',
		description: 'Play to an opponent’s Journey pile and draw two cards.',
		quote: 'Damn you Rita. Broke my heart. I should have seen this coming. The way you talked about them.',
		artwork: 'driver-rita.jpg',
		distance: 0,
		effect: 'turncoat',
		quantity: 1
	},
	{
		type: 'driver',
		name: 'Crafty Jenkins',
		description: 'Play to an opponent’s Journey pile and draw two cards.',
		quote: 'I never trusted Jenkins. Had her hat in too many rings. But desperate times... I gave her the keys.',
		artwork: 'driver-jenkins.jpg',
		effect: 'turncoat',
		distance: 20,
		quantity: 3
	},
	{
		type: 'driver',
		name: 'Bill',
		description: 'Play to an opponent’s Journey pile and draw two cards.',
		quote: 'Bill was the kind of bastard you never trust. He’d sell out his own mother for a fix. Hope to never see his gnarly mug again.',
		artwork: 'driver-bill.jpg',
		distance: 50,
		effect: 'turncoat',
		quantity: 5
	},

	// DRIVER
	{
		type: 'driver',
		name: 'Old Smokey',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		quote: 'The stench of cheap cigarettes. He asks if I’ve got a light. I fumble for a match. Something wasn’t right.',
		artwork: 'driver-oldsmokey.jpg',
		distance: 5,
		quantity: 6
	},
	{
		type: 'driver',
		name: 'Dolly',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		quote: 'She said it was better on the outside. Dolly was feeding me a can of lies. It was for my own good. She was trying to save me.',
		artwork: 'driver-dolly.jpg',
		distance: 10,
		quantity: 8
	},
	{
		type: 'driver',
		name: 'Butler',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		quote: 'We go back. Last job he took four slugs to the chest. Never been the same. A stare that crushes hope and fills you with dread.',
		artwork: 'driver-butler.jpg',
		distance: 15,
		quantity: 10
	},
	{
		type: 'driver',
		name: 'Cat Ducane',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		quote: 'I run through the alley. A broad calls out ’get in.’ I did. I open my mouth to speak, but she didn’t give a damn who I am.',
		artwork: 'driver-cat.jpg',
		distance: 30,
		quantity: 6
	},
	{
		type: 'driver',
		name: 'Briggs',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		quote: 'The outsider. The loner. There are only tales of Briggs, he leaves no witnesses. But he drives stick.',
		artwork: 'driver-briggs.jpg',
		distance: 50,
		quantity: 6
	},
	{
		type: 'driver',
		name: 'Wheelman Phelps',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		quote: 'The thrill of the chase. We were pushing {{distance}}. I’d heard of Phelps through Ducane. A friend of Ducane is a friend of mine.',
		artwork: 'driver-wheelman.jpg',
		quantity: 2,
		distance: 75
	},
	{
		type: 'driver',
		name: 'Don Marloni',
		quote: 'A muffled scream in the trunk. I said nothing. The Don, the big man, he’ll rip your teeth out and wear them as cufflinks.',
		description: 'Play to your Journey area to travel {{distance}} miles.',
		artwork: 'driver-don.jpg',
		quantity: 2,
		distance: 100
	}
];