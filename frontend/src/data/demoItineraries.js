export const demoItineraries = {
  'best-value': {
    tierId: 'best-value',
    tierName: 'Best Value',
    tripTitle: '4-Day Vibrant Coastal Goa Escape',
    summary: 'A balanced getaway blending boutique resort comfort, sunset coastal cruises, cafe culture in Anjuna, and heritage trails in Old Goa.',
    totalCost: 31000, // for 2 travelers (15500 each)
    perPersonCost: 15500,
    travelers: 2,
    durationDays: 4,
    origin: 'Bhubaneswar (BBI)',
    destination: 'Goa (GOI / GOX)',
    accommodation: {
      id: 'acc-1',
      name: 'BloomSuites Boutique & Spa, Calangute',
      type: 'Boutique Hotel (3-Star)',
      rating: 4.6,
      reviewsCount: 428,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      nights: 3,
      costPerNight: 3300,
      totalCost: 9900,
      amenities: ['Swimming Pool', 'Buffet Breakfast', 'High-Speed Wi-Fi', 'Balcony Room'],
      distanceToBeach: '600m to Calangute Beach',
      alternatives: [
        {
          id: 'acc-alt-1',
          name: 'Casa De Goa Boutique Resort',
          costDelta: +1800,
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          type: 'Portuguese Villa Style (4-Star)'
        },
        {
          id: 'acc-alt-2',
          name: 'Zostel Plus Morjim (Private Pods)',
          costDelta: -2800,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          type: 'Chic Beachside Stay'
        }
      ]
    },
    transport: {
      id: 'trans-1',
      title: 'Roundtrip Flights (Bhubaneswar ⇄ Goa via Mumbai)',
      provider: 'IndiGo Airlines / Air India Express',
      flightNumbers: '6E-543 / 6E-892',
      duration: '4h 15m (1 stop)',
      departure: '08:15 AM Day 1',
      returnArrival: '09:40 PM Day 4',
      totalCost: 11800,
      badge: 'Fastest Route',
      alternatives: [
        {
          id: 'trans-alt-1',
          title: 'Direct Non-Stop Charter Flight',
          costDelta: +3400,
          duration: '2h 30m',
          provider: 'Akasa Air Direct'
        },
        {
          id: 'trans-alt-2',
          title: 'Konkan Express AC 2-Tier Train',
          costDelta: -5200,
          duration: '26h Scenic',
          provider: 'Indian Railways'
        }
      ]
    },
    localTransit: {
      id: 'loc-1',
      title: 'Self-drive Honda Activa 6G Scooter (4 Days)',
      cost: 2000,
      details: '2 helmets provided, pickup & drop at hotel doorstep, fuel not included.'
    },
    days: [
      {
        day: 1,
        date: 'Day 1',
        title: 'Arrival, Check-in & Vagator Sunset Sundowner',
        estimatedSpend: 8200,
        timeline: [
          {
            time: '12:30 PM',
            type: 'transport',
            title: 'Airport Transfer to Calangute Hotel',
            duration: '50 mins',
            cost: 1100,
            description: 'Pre-paid airport taxi from Manohar International Airport (MOPA) directly to BloomSuites.'
          },
          {
            time: '01:30 PM',
            type: 'accommodation',
            title: 'Check-in at BloomSuites & Unwind',
            duration: '1.5 hours',
            cost: 0,
            description: 'Relax by the palm-fringed pool, freshen up, and receive rental scooter keys.'
          },
          {
            time: '04:00 PM',
            type: 'activity',
            title: 'Chapora Fort Clifftop Walk & Dil Chahta Hai Point',
            duration: '2 hours',
            cost: 200,
            description: 'Panoramic views overlooking Vagator and Morjim coastlines as golden hour begins.',
            canChange: true,
            alternatives: [
              { title: 'Aguada Fort & Lighthouse', costDelta: 0 },
              { title: 'Sinquerim Beach Walk & Jet Ski', costDelta: +600 }
            ]
          },
          {
            time: '07:30 PM',
            type: 'food',
            title: 'Dinner at Thalassa Greek Tavern / Antares',
            duration: '2 hours',
            cost: 1800,
            description: 'Cliffside sunset dining with live Mediterranean acoustic music and fresh prawns.'
          }
        ]
      },
      {
        day: 2,
        date: 'Day 2',
        title: 'South Goa Heritage, Old Churches & Latin Quarter',
        estimatedSpend: 6800,
        timeline: [
          {
            time: '09:00 AM',
            type: 'activity',
            title: 'Fontainhas Latin Quarter Walking & Photo Tour',
            duration: '2.5 hours',
            cost: 500,
            description: 'Stroll through pastel-colored Portuguese heritage lanes, tiled alleys, and visit 31st January Bakery.',
            canChange: true,
            alternatives: [
              { title: 'Mangueshi Temple & Spice Plantation Tour', costDelta: +800 },
              { title: 'Miramar Beach & Dona Paula Viewpoint', costDelta: -200 }
            ]
          },
          {
            time: '12:30 PM',
            type: 'food',
            title: 'Traditional Goan Lunch at Viva Panjim',
            duration: '1.5 hours',
            cost: 1200,
            description: 'Savor traditional Goan Fish Curry Thali, Pork Vindaloo, and Bebinca dessert.'
          },
          {
            time: '03:30 PM',
            type: 'activity',
            title: 'Basilica of Bom Jesus & Se Cathedral Heritage Stop',
            duration: '2 hours',
            cost: 100,
            description: 'UNESCO World Heritage 16th-century architectural marvel preserving the relics of St. Francis Xavier.'
          },
          {
            time: '06:00 PM',
            type: 'activity',
            title: 'Mandovi River Sunset Catamaran Cruise',
            duration: '1.5 hours',
            cost: 1400,
            description: 'Relaxing 90-minute evening cruise with Goan folk music performance and sundowner drinks.',
            canChange: true
          }
        ]
      },
      {
        day: 3,
        date: 'Day 3',
        title: 'Anjuna Flea Market, Water Sports & Beach Shack Vibe',
        estimatedSpend: 9200,
        timeline: [
          {
            time: '09:30 AM',
            type: 'food',
            title: 'Artisan Breakfast at Cafe Artjuna, Anjuna',
            duration: '1.5 hours',
            cost: 800,
            description: 'Shaded garden cafe serving fresh açai bowls, shakshuka, croissants, and single-origin coffee.'
          },
          {
            time: '11:30 AM',
            type: 'activity',
            title: 'Baga Water Sports Trio (Parasailing & Jet Ski)',
            duration: '2.5 hours',
            cost: 2600,
            description: 'Safety-certified watersport package including boat ride, parasailing, and jet ski tandem ride.',
            canChange: true,
            alternatives: [
              { title: 'Scuba Diving at Grand Island (Trial)', costDelta: +1800 },
              { title: 'Paddleboarding & Kayaking in Nerul River', costDelta: -1000 }
            ]
          },
          {
            time: '04:30 PM',
            type: 'activity',
            title: 'Curlies & Shiva Valley Coastal Sundown',
            duration: '3 hours',
            cost: 900,
            description: 'Sit back with chilled beverages on beanbags watching surfers ride sunset waves at South Anjuna.'
          },
          {
            time: '08:30 PM',
            type: 'food',
            title: 'Dinner at Gunpowder South Indian Bistro, Assagao',
            duration: '2 hours',
            cost: 1600,
            description: 'Sensational coastal Kerala & Goan spiced delicacies under a romantic heritage courtyard.'
          }
        ]
      },
      {
        day: 4,
        date: 'Day 4',
        title: 'Morning Dip, Souvenirs & Airport Departure',
        estimatedSpend: 6800,
        timeline: [
          {
            time: '08:00 AM',
            type: 'activity',
            title: 'Early Beach Swim & Beachside Coconut Water',
            duration: '1.5 hours',
            cost: 200,
            description: 'Serene morning swim at Ashwem / Morjim Beach with clean sandy shores.'
          },
          {
            time: '11:00 AM',
            type: 'food',
            title: 'Brunch at Baba Au Rhum, Anjuna Bamboo Grove',
            duration: '1.5 hours',
            cost: 1100,
            description: 'Woodfired sourdough pizza, organic salads, and French pastries surrounded by lush foliage.'
          },
          {
            time: '01:30 PM',
            type: 'activity',
            title: 'Spice, Cashew & Feni Souvenir Shopping in Mapusa',
            duration: '1.5 hours',
            cost: 1200,
            description: 'Pick up local roasted cashews, coconut vinegar, bebinca gift boxes, and handmade souvenirs.'
          },
          {
            time: '03:30 PM',
            type: 'transport',
            title: 'Return Taxi Transfer to Airport',
            duration: '1 hour',
            cost: 1200,
            description: 'Scenic taxi ride back to Airport in time for check-in.'
          }
        ]
      }
    ]
  },
  'cheapest': {
    tierId: 'cheapest',
    tierName: 'Cheapest',
    tripTitle: '4-Day Budget Backpacker & Beach Explorer',
    summary: 'Cost-conscious coastal exploration with top-rated hostel social stays, sleeper train connectivity, street shacks, and self-guided trails.',
    totalCost: 17000, // for 2 travelers (8500 each)
    perPersonCost: 8500,
    travelers: 2,
    durationDays: 4,
    origin: 'Bhubaneswar',
    destination: 'Goa',
    accommodation: {
      id: 'acc-cheap-1',
      name: 'The Funky Monkey Hostel, Anjuna',
      type: 'Social Backpackers Dorm',
      rating: 4.7,
      reviewsCount: 890,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      nights: 3,
      costPerNight: 1200,
      totalCost: 3600,
      amenities: ['Free Wi-Fi', 'Locker', 'Shared Kitchen', 'Social Courtyard', 'Clean Linen'],
      distanceToBeach: '400m to Anjuna Beach',
      alternatives: [
        { id: 'cheap-alt-1', name: 'Roadhouse Hostel, Arambol', costDelta: -400, rating: 4.6, type: 'Eco Dorm' }
      ]
    },
    transport: {
      id: 'trans-cheap-1',
      title: 'Express Train (AC 3-Tier / Sleeper Allocation)',
      provider: 'Konkan Railway',
      duration: '24h Scenic Journey',
      totalCost: 4800,
      badge: 'Budget Choice',
      alternatives: [
        { id: 'trans-c-alt', title: 'Connecting Sleeper Bus', costDelta: +600, duration: '22h' }
      ]
    },
    localTransit: {
      id: 'loc-cheap-1',
      title: 'Rented Scooter (1 Scooter for 2 travelers)',
      cost: 1600,
      details: '4 days rental at ₹400/day.'
    },
    days: [
      {
        day: 1,
        date: 'Day 1',
        title: 'Arrival via Madgaon & Check-in at Anjuna',
        estimatedSpend: 3600,
        timeline: [
          { time: '11:00 AM', type: 'transport', title: 'Local Bus to Anjuna', duration: '1.5h', cost: 140, description: 'Economic local Kadamba bus.' },
          { time: '01:00 PM', type: 'accommodation', title: 'Check-in Funky Monkey Hostel', duration: '1h', cost: 0, description: 'Drop bags in dorm.' },
          { time: '04:00 PM', type: 'activity', title: 'Anjuna Beach Sunset Stroll', duration: '3h', cost: 0, description: 'Free beach sunset.' },
          { time: '08:00 PM', type: 'food', title: 'Beach Shack Fried Fish & Thali', duration: '1.5h', cost: 600, description: 'Authentic local shack dinner.' }
        ]
      },
      {
        day: 2,
        date: 'Day 2',
        title: 'Arambol Sweet Water Lake & Drum Circle',
        estimatedSpend: 4200,
        timeline: [
          { time: '10:00 AM', type: 'activity', title: 'Ride North to Arambol Sweet Lake', duration: '2h', cost: 0, description: 'Free nature walk and swim.' },
          { time: '01:00 PM', type: 'food', title: 'Local Russian Bakery Lunch', duration: '1h', cost: 450, description: 'Fresh sandwiches and juices.' },
          { time: '05:30 PM', type: 'activity', title: 'Sunset Drum Circle at Arambol', duration: '2h', cost: 0, description: 'Iconic sunset musical gathering.' }
        ]
      },
      {
        day: 3,
        date: 'Day 3',
        title: 'Old Goa Churches & Panjim Walk',
        estimatedSpend: 4600,
        timeline: [
          { time: '09:30 AM', type: 'activity', title: 'Old Goa Heritage Walk', duration: '3h', cost: 100, description: 'Historical architecture.' },
          { time: '01:00 PM', type: 'food', title: 'Fish Curry Rice Lunch at Local Dhaba', duration: '1h', cost: 500, description: 'Popular local food spot.' }
        ]
      },
      {
        day: 4,
        date: 'Day 4',
        title: 'Vagator Cliffs & Train Departure',
        estimatedSpend: 4600,
        timeline: [
          { time: '09:00 AM', type: 'activity', title: 'Chapora Fort Clifftop view', duration: '2h', cost: 0, description: 'Free scenic viewpoint.' },
          { time: '02:00 PM', type: 'transport', title: 'Station Transfer & Departure', duration: '1.5h', cost: 400, description: 'Train station commute.' }
        ]
      }
    ]
  },
  'comfortable': {
    tierId: 'comfortable',
    tierName: 'Comfortable',
    tripTitle: '4-Day Premium Beachfront & Private AC Tour',
    summary: 'Stay in a 4-star beachfront resort with sea views, travel effortlessly in a dedicated private AC cab, and indulge in guided scuba excursions and fine coastal dining.',
    totalCost: 52000, // for 2 travelers (26000 each)
    perPersonCost: 26000,
    travelers: 2,
    durationDays: 4,
    origin: 'Bhubaneswar',
    destination: 'Goa',
    accommodation: {
      id: 'acc-comf-1',
      name: 'Caravela Beach Resort, Varca Beach',
      type: '4-Star Beachfront Luxury Resort',
      rating: 4.8,
      reviewsCount: 1240,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      nights: 3,
      costPerNight: 6800,
      totalCost: 20400,
      amenities: ['Direct Beach Access', 'Oceanfront Pool', 'Buffet Breakfast & Dinner', 'Ayurvedic Spa', 'Golf Course'],
      distanceToBeach: 'Zero meters (Direct Private Beachfront)',
      alternatives: [
        { id: 'comf-alt-1', name: 'Heritage Village Resort & Spa', costDelta: -2200, rating: 4.7, type: 'Heritage 4-Star' }
      ]
    },
    transport: {
      id: 'trans-comf-1',
      title: 'Prime Slot Direct Flights + Airport Executive Cab',
      provider: 'IndiGo / Air India Prime Slots',
      duration: '3h 30m direct',
      totalCost: 17200,
      badge: 'Prime Flights',
      alternatives: [
        { id: 'trans-cm-alt', title: 'Business Class Upgrade', costDelta: +12000, duration: '3h' }
      ]
    },
    localTransit: {
      id: 'loc-comf-1',
      title: 'Dedicated Private AC Sedan with Chauffeur (All 4 Days)',
      cost: 7200,
      details: 'Air-conditioned Toyota Etios/Dzire with professional driver available 8 hours/day.'
    },
    days: [
      {
        day: 1,
        date: 'Day 1',
        title: 'Executive Chauffeur Welcome & Beachfront Sunset Dinner',
        estimatedSpend: 12000,
        timeline: [
          { time: '11:30 AM', type: 'transport', title: 'Private AC Cab Airport Pickup', duration: '45 mins', cost: 0, description: 'Chauffeur meets at arrival gate.' },
          { time: '01:00 PM', type: 'accommodation', title: 'Check-in at Caravela Sea-view Suite', duration: '2h', cost: 0, description: 'Welcome coconut drinks and oceanfront relaxation.' },
          { time: '05:00 PM', type: 'activity', title: 'Sunset Cocktails on Private Beach Lawn', duration: '2h', cost: 1200, description: 'Live jazz saxophone by the shore.' },
          { time: '08:00 PM', type: 'food', title: 'Candlelight Coastal Seafood at Castaways', duration: '2h', cost: 3200, description: 'Fresh catch of the day with Portuguese reserve wines.' }
        ]
      },
      {
        day: 2,
        date: 'Day 2',
        title: 'Grand Island Scuba Diving & Dolphin Cruise',
        estimatedSpend: 15000,
        timeline: [
          { time: '08:00 AM', type: 'activity', title: 'PADI Certified Scuba Diving & Coral Safari', duration: '5h', cost: 6500, description: 'Includes underwater video, scuba instructor, and boat cruise.' },
          { time: '02:30 PM', type: 'food', title: 'Goan Spice Feast at Fisherman’s Wharf', duration: '2h', cost: 2400, description: 'Riverside dining with crab xec xec.' },
          { time: '06:00 PM', type: 'activity', title: 'Spa & Ayurvedic Massage Treatment', duration: '1.5h', cost: 3000, description: 'Rejuvenating aromatherapy.' }
        ]
      },
      {
        day: 3,
        date: 'Day 3',
        title: 'Latin Quarter Private Curator Tour & Sundowner Club',
        estimatedSpend: 13000,
        timeline: [
          { time: '10:00 AM', type: 'activity', title: 'Private Historian Walking Tour of Fontainhas', duration: '2.5h', cost: 1800, description: 'Exclusive entry to 200-year-old Portuguese heritage mansions.' },
          { time: '05:30 PM', type: 'food', title: 'VIP Sunset Table at Titlie / Cavala', duration: '3h', cost: 3800, description: 'Craft cocktails, fusion tapas, and ocean sunset.' }
        ]
      },
      {
        day: 4,
        date: 'Day 4',
        title: 'Gourmet Brunch, Artisan Boutiques & Departure',
        estimatedSpend: 12000,
        timeline: [
          { time: '10:30 AM', type: 'food', title: 'Champagne Buffet Brunch at Resort', duration: '2h', cost: 1800, description: 'Extensive gourmet spread.' },
          { time: '02:00 PM', type: 'transport', title: 'Chauffeur Drop to Airport VIP Gate', duration: '1h', cost: 0, description: 'Seamless flight departure.' }
        ]
      }
    ]
  },
  'premium': {
    tierId: 'premium',
    tierName: 'Premium',
    tripTitle: '4-Day Ultra-Luxury Private Villa & Yacht Experience',
    summary: 'The pinnacle of bespoke luxury: 5-star private pool villa, private chartered yacht cruise, luxury BMW/Innova Hycross chauffeur, and chef-table tasting experiences.',
    totalCost: 96000, // for 2 travelers (48000 each)
    perPersonCost: 48000,
    travelers: 2,
    durationDays: 4,
    origin: 'Bhubaneswar',
    destination: 'Goa',
    accommodation: {
      id: 'acc-prem-1',
      name: 'Taj Exotica Resort & Spa / Private Pool Villa',
      type: '5-Star Luxury Private Pool Villa',
      rating: 4.9,
      reviewsCount: 3100,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      nights: 3,
      costPerNight: 15500,
      totalCost: 46500,
      amenities: ['Private Plunge Pool', '24/7 Butler Service', 'Jiva Luxury Spa', 'Helipad Access', 'Private Beach Stretch'],
      distanceToBeach: 'Beachfront Estate',
      alternatives: [
        { id: 'prem-alt-1', name: 'W Goa Marvelous Suite', costDelta: +4500, rating: 4.9, type: 'Vibrant Luxury Suite' }
      ]
    },
    transport: {
      id: 'trans-prem-1',
      title: 'Premium / Business Class Flights with Fast-Track',
      provider: 'Vistara / Air India Business Priority',
      duration: '2h 45m fast connection',
      totalCost: 26500,
      badge: 'Business Class'
    },
    localTransit: {
      id: 'loc-prem-1',
      title: 'Luxury Innova Hycross / BMW with Dedicated Chauffeur',
      cost: 12000,
      details: 'Unrestricted travel, chilled mineral water, Wi-Fi on board, 24/7 on call.'
    },
    days: [
      {
        day: 1,
        date: 'Day 1',
        title: 'VIP Fast-track Arrival & Private Villa Check-in',
        estimatedSpend: 24000,
        timeline: [
          { time: '12:00 PM', type: 'transport', title: 'VIP Chauffeur Transfer in Luxury SUV', duration: '40 mins', cost: 0, description: 'Cold towels and champagne onboard.' },
          { time: '01:00 PM', type: 'accommodation', title: 'Private Butler Villa Check-in at Taj Exotica', duration: '2h', cost: 0, description: 'Personalized check-in directly inside your private villa.' },
          { time: '07:30 PM', type: 'food', title: 'Private Beach Cabana 7-Course Chef Dinner', duration: '3h', cost: 8500, description: 'Custom seafood tasting menu prepared live by the Executive Chef under the stars.' }
        ]
      },
      {
        day: 2,
        date: 'Day 2',
        title: '3-Hour Private Yacht Charter & Sunset Dolphins',
        estimatedSpend: 28000,
        timeline: [
          { time: '03:30 PM', type: 'activity', title: 'Private 42ft Catamaran Yacht Charter', duration: '3.5h', cost: 16000, description: 'Cruising the Arabian Sea with personal skipper, wine, and gourmet charcuterie board.' },
          { time: '08:30 PM', type: 'food', title: 'Dinner at Cavatina by Chef Avinash Martins', duration: '2.5h', cost: 6500, description: 'Modern reimagined Goan culinary gastronomy.' }
        ]
      },
      {
        day: 3,
        date: 'Day 3',
        title: 'Private Helicopter Coastal Tour & Jiva Spa Day',
        estimatedSpend: 25000,
        timeline: [
          { time: '11:00 AM', type: 'activity', title: 'Scenic Helicopter Coastline Flight', duration: '30 mins', cost: 9500, description: 'Breathtaking aerial views of Goa forts, beaches, and backwaters.' },
          { time: '03:00 PM', type: 'activity', title: 'Couple Signature Jiva Spa & Milk Bath', duration: '2.5h', cost: 7000, description: 'Holistic wellness treatment in private spa pavillion.' }
        ]
      },
      {
        day: 4,
        date: 'Day 4',
        title: 'Lazy In-Villa Floating Breakfast & Airport Escort',
        estimatedSpend: 19000,
        timeline: [
          { time: '09:30 AM', type: 'food', title: 'Floating Pool Breakfast in Private Plunge Pool', duration: '2h', cost: 2500, description: 'Tropical fruits, eggs benedict, and mimosa basket.' },
          { time: '02:00 PM', type: 'transport', title: 'VIP Airport Escort & Departure', duration: '1h', cost: 0, description: 'Direct lounge transfer and priority boarding.' }
        ]
      }
    ]
  }
};
