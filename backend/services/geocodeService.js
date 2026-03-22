export class GeocodeService {
    async searchLocation(query, limit = 5) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&accept-language=en`;
        const response = await fetch(url, { headers: { 'User-Agent': `HitchPool-App/1.0 (${process.env.CONTACT_EMAIL || ''})` } });
        
        if (!response.ok) throw new Error('Nominatim rejected search request.');
        const data = await response.json();
        
        return data.map(item => ({
            label: item.display_name.split(',').slice(0, 3).join(','),
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
        }));
    }

    async reverseGeocode(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
        const response = await fetch(url, { headers: { 'User-Agent': `HitchPool-App/1.0 (${process.env.CONTACT_EMAIL || ''})` } });
        
        if (!response.ok) throw new Error('Nominatim rejected reverse request.');
        const data = await response.json();
        return data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : 'Unknown Location';
    }
}

export default new GeocodeService();
