import { getPrayerTimes } from "./prayerTimes.ts";
import { useState } from "react";

type SetupProps = {
  onComplete: (prayerTimes: PrayerTimes) => void;
};

type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
  Lastthird: string;
};

function Setup({ onComplete }: SetupProps) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  function handleContinue() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    getPrayerTimes(formattedDate, city, country)
      .then((result) => {
        setPrayerTimes(result);
        onComplete(result);
      })
      .catch((error) => console.log(error.message));

    console.log(day, month, year);
  }

  return (
    <>
      <input
        type="text"
        placeholder="Enter your city"
        value={city}
        onChange={(event) => setCity(event.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your country"
        value={country}
        onChange={(event) => setCountry(event.target.value)}
      />
      <h1>Hello Time management</h1>
      <button onClick={handleContinue}>Continue</button>

      {prayerTimes !== null && (
        <>
          <p>Fajr: {prayerTimes.Fajr}</p>
          <p>Sunrise: {prayerTimes.Sunrise}</p>
          <p>Dhuhr: {prayerTimes.Dhuhr}</p>
          <p>Asr: {prayerTimes.Asr}</p>
          <p>Maghrib: {prayerTimes.Maghrib}</p>
          <p>Isha: {prayerTimes.Isha}</p>
          <p>Midnight: {prayerTimes.Midnight}</p>
          <p>Last third: {prayerTimes.Lastthird}</p>
        </>
      )}
    </>
  );
}

export default Setup;
