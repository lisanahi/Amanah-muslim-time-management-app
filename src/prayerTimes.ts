export async function getPrayerTimes(
  date: string,
  city: string,
  country: string,
) {
  const respons = await fetch(
    `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3&latitudeAdjustmentMethod=2`,
  );

  if (!respons.ok) {
    throw new Error("Something went wrong");
  }

  const prayerData = await respons.json();
  const prayerTimes = prayerData.data.timings;

  return prayerTimes;
}

export type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
  Lastthird: string;
};

getPrayerTimes("14-10-2026", "New York", "United States")
  .then((result) => console.log(result))
  .catch((error) => console.log(error.message));
