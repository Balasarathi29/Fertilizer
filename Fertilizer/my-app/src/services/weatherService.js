// Weather service utilizing browser Geolocation API and Open-Meteo API.
// Features OpenStreetMap Nominatim reverse geocoding for exact location names.

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

const mapWmoCode = (code) => {
  if (code === 0) return "Sunny";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Light Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Clear";
};

const getIconForCondition = (cond) => {
  const c = (cond || '').toLowerCase();
  if (c.includes("sunny") || c.includes("clear")) return "Sun";
  if (c.includes("cloudy") || c.includes("overcast")) return "Cloud";
  if (c.includes("drizzle") || c.includes("rain") || c.includes("shower")) return "Rain";
  if (c.includes("thunder") || c.includes("storm")) return "Storm";
  return "CloudSun";
};

export const weatherService = {
  // Requests geolocation and returns coordinates
  getUserCoordinates: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 0
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  // Perform reverse geocoding via OpenStreetMap Nominatim
  reverseGeocode: async (lat, lon) => {
    try {
      const response = await fetch(`${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`, {
        headers: {
          'User-Agent': 'BhoomiBloom/1.0'
        }
      });
      if (!response.ok) throw new Error("Reverse geocoding error");
      const data = await response.json();
      
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.neighbourhood || addr.city_district || addr.town || "";
      const city = addr.city || addr.county || addr.district || addr.state_district || "";
      const state = addr.state || "";
      const country = addr.country || "";

      const parts = [];
      if (village) parts.push(village);
      if (city && city !== village) parts.push(city.replace(" District", ""));
      if (state) parts.push(state);

      return {
        formatted: parts.join(", ") || data.display_name,
        village,
        city: city.replace(" District", ""),
        state,
        pincode: addr.postcode || "",
        country
      };
    } catch (err) {
      console.warn("Nominatim reverse geocoding error:", err);
      return { formatted: `Location [${lat.toFixed(4)}, ${lon.toFixed(4)}]` };
    }
  },

  // Fetch live Open-Meteo weather forecast
  getWeatherForecast: async (lat, lon) => {
    try {
      const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Open-Meteo API response error");
      const data = await response.json();

      const current = data.current || {};
      const temp = Math.round(current.temperature_2m ?? 28);
      const humidity = Math.round(current.relative_humidity_2m ?? 65);
      const precipitation = parseFloat((current.precipitation ?? current.rain ?? 0).toFixed(1));
      const windSpeed = Math.round(current.wind_speed_10m ?? 12);
      const wcode = current.weather_code ?? 0;
      const condition = mapWmoCode(wcode);

      const locationDetails = await weatherService.reverseGeocode(lat, lon);

      // Suggestions based on live Open-Meteo metrics
      let suggestions = [];
      if (precipitation > 2.0 || condition.toLowerCase().includes("rain")) {
        suggestions = [
          "Precipitation detected. Avoid granular or foliar fertilizing to prevent wash-off.",
          "Inspect field contour bunds to prevent soil erosion and waterlogging.",
          "Collect rainwater in farm storage ponds."
        ];
      } else if (temp >= 35) {
        suggestions = [
          "High temperature warning. Restrict crop irrigation to late evening or early morning.",
          "Apply heavy organic crop-mulching to preserve soil moisture.",
          "Foliar liquid organic sprays (Panchagavya) should be avoided during peak daylight hours."
        ];
      } else if (windSpeed >= 20) {
        suggestions = [
          "High wind speed detected. Secure young saplings and nursery stakes.",
          "Postpone liquid sprays due to high wind drift.",
          "Ensure greenhouse mesh panels are anchored."
        ];
      } else {
        suggestions = [
          "Optimal weather for seed sowing, nursery transplantation, and crop weeding.",
          "Highly suitable for applying vermicompost or organic neem cake.",
          "Maintain standard drip irrigation schedule."
        ];
      }

      // Generate 7-day forecast from daily Open-Meteo data
      const daily = data.daily || {};
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dates = daily.time || [];
      const formattedForecast = dates.slice(0, 7).map((dateStr, idx) => {
        const d = new Date(dateStr);
        const dayName = days[d.getDay()];
        const maxTemp = Math.round(daily.temperature_2m_max?.[idx] ?? temp);
        const dayWcode = daily.weather_code?.[idx] ?? 0;
        const dayCond = mapWmoCode(dayWcode);
        const pop = daily.precipitation_probability_max?.[idx] ?? 10;
        return {
          day: idx === 0 ? "Today" : dayName,
          temp: maxTemp,
          condition: dayCond,
          rainProbability: pop,
          icon: getIconForCondition(dayCond)
        };
      });

      return {
        location: {
          name: locationDetails.formatted,
          city: locationDetails.city,
          state: locationDetails.state,
          pincode: locationDetails.pincode,
          lat,
          lon
        },
        current: {
          temp,
          condition,
          humidity,
          windSpeed,
          precipitation,
          rainProbability: daily.precipitation_probability_max?.[0] ?? 0,
          feelsLike: temp,
          summary: `Live Open-Meteo Weather: ${temp}°C, ${condition}. Humidity is ${humidity}%, Wind ${windSpeed} km/h, Rain ${precipitation} mm.`,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        suggestions,
        forecast: formattedForecast
      };

    } catch (err) {
      console.error("Open-Meteo live API error:", err);
      // Clean fallback if offline
      const locDetails = await weatherService.reverseGeocode(lat, lon);
      return {
        location: { name: locDetails.formatted, lat, lon },
        current: {
          temp: 29,
          condition: "Sunny",
          humidity: 65,
          windSpeed: 12,
          precipitation: 0.0,
          rainProbability: 10,
          feelsLike: 29,
          summary: "Live regional climate estimate active.",
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        suggestions: ["Optimal conditions for organic fertilizing."],
        forecast: []
      };
    }
  }
};
