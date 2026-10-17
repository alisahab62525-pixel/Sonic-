import React, { useState, useEffect } from 'react';
import { X, Search, Globe, Clock, CloudRain, Wind, Droplets, MapPin, RefreshCw, Sun } from 'lucide-react';
import { WORLD_CITIES, WorldCity, fetchCityWeather, formatCityTime, getWeatherConditionInfo, fetchUserLocationWeather } from '../utils/weatherService';
import { WeatherData } from '../types';

interface WorldWeatherTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskSonicCity: (cityName: string) => void;
}

export const WorldWeatherTimeModal: React.FC<WorldWeatherTimeModalProps> = ({
  isOpen,
  onClose,
  onAskSonicCity,
}) => {
  const [cityDataList, setCityDataList] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());

  // Clock tick every second for live clocks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial load of featured world cities
  useEffect(() => {
    if (!isOpen) return;

    const loadWeather = async () => {
      setLoading(true);
      const initialCities = WORLD_CITIES.slice(0, 6);
      const results: WeatherData[] = [];
      for (const city of initialCities) {
        const w = await fetchCityWeather(city);
        results.push(w);
      }
      setCityDataList(results);
      setLoading(false);
    };

    loadWeather();
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchedCity = async (result: any) => {
    const newCity: WorldCity = {
      name: result.name,
      country: result.country || '',
      lat: result.latitude,
      lon: result.longitude,
      timezone: result.timezone || 'UTC',
    };
    const weather = await fetchCityWeather(newCity);
    setCityDataList((prev) => [weather, ...prev.filter((c) => c.city !== weather.city)]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const w = await fetchUserLocationWeather(pos.coords.latitude, pos.coords.longitude);
        setCityDataList((prev) => [w, ...prev]);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                World Time & Weather (Dunya ke Auqat o Mausam)
              </h3>
              <p className="text-xs text-white/50">
                Real-time Open-Meteo forecasts and live astronomical clocks for any city.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-white/10 bg-[#121224]/50 flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kisi bhi shehar ka naam likhein (e.g. Tokyo, London, Makkah, Toronto)..."
              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl pl-9 pr-20 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs rounded-lg font-medium transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          <button
            onClick={handleCurrentLocation}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-pink-400" />
            <span>Meri Location</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="p-3 bg-cyan-950/40 border-b border-cyan-500/20 max-h-40 overflow-y-auto">
            <p className="text-[11px] text-cyan-300 mb-2 font-mono">Daryaft kardah shehar (Select to view):</p>
            <div className="flex flex-wrap gap-2">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchedCity(r)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs text-white flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-cyan-300" />
                  <span>{r.name}, {r.country || ''}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && cityDataList.length === 0 ? (
            <div className="py-16 text-center text-white/50 flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
              <p className="text-sm">Mausam aur time update ho raha hai...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cityDataList.map((city, idx) => {
                const condition = getWeatherConditionInfo(city.weatherCode);
                const localClock = formatCityTime(city.timezone);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top City & Live Clock */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-base">{city.city}</h4>
                          <span className="text-[11px] text-white/50">{city.country || city.timezone}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-cyan-300 text-xs font-mono font-bold">
                            <Clock className="w-3 h-3" />
                            <span>{localClock}</span>
                          </div>
                          <span className="text-[10px] text-white/40">Live Time</span>
                        </div>
                      </div>

                      {/* Main Temperature & Condition */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{condition.icon}</span>
                          <div>
                            <span className="text-2xl font-black text-white">{city.temperature}°C</span>
                            <p className="text-[11px] text-white/70 leading-tight">{condition.label}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details (Humidity, Wind) */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/60 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-cyan-400" />
                          <span>Nami: {city.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="w-3 h-3 text-cyan-400" />
                          <span>Hawa: {city.windSpeed} km/h</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {city.cached ? '● Cached' : '● Live Stream'}
                      </span>
                      <button
                        onClick={() => {
                          onAskSonicCity(city.city);
                          onClose();
                        }}
                        className="text-xs text-cyan-300 hover:text-white transition-colors"
                      >
                        Sonic se poocho →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
