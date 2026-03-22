const API_BASE = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
    const res = await fetch(API_BASE + endpoint, {
        ...options,
        headers: { 'Content-Type': 'application/json', 'x-session-id': 'dev-test-seed-xyz' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

async function seed() {
    console.log('Seeding Test Intents...');
    
    // 1. Create Personas
    const p1 = await request('/persona', { method: 'POST', body: JSON.stringify({ name: 'Rohit (Test 1)' }) });
    const p2 = await request('/persona', { method: 'POST', body: JSON.stringify({ name: 'Aanya (Test 2)' }) });
    
    // 2. Intents in Delhi
    // Connaught Place to Haus Khas
    const i1 = {
        personaId: p1.id,
        rideDate: new Date().toISOString().split('T')[0],
        departureSlot: '09:00',
        pickupLat: 28.6304, pickupLon: 77.2177, pickupLabel: 'Connaught Place, New Delhi',
        dropoffLat: 28.5494, dropoffLon: 77.2001, dropoffLabel: 'Hauz Khas Village, New Delhi'
    };
    
    // India Gate to Saket
    const i2 = {
        personaId: p2.id,
        rideDate: new Date().toISOString().split('T')[0],
        departureSlot: '09:00',
        pickupLat: 28.6129, pickupLon: 77.2295, pickupLabel: 'India Gate, New Delhi',
        dropoffLat: 28.5245, dropoffLon: 77.2066, dropoffLabel: 'Saket, New Delhi'
    };

    await request('/intent', { method: 'POST', body: JSON.stringify(i1) });
    console.log('Created Intent for ' + p1.name);
    await request('/intent', { method: 'POST', body: JSON.stringify(i2) });
    console.log('Created Intent for ' + p2.name);

    console.log('--- SEEDING COMPLETE ---');
    console.log('Refresh your browser with session ID "dev-test-seed-xyz" via local storage, or just create matching personas manually!');
}

seed().catch(console.error);
