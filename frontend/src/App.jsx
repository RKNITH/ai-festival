import React, { useState } from 'react';
import { GiFireworkRocket } from 'react-icons/gi';

const App = () => {
  const [festival, setFestival] = useState('');
  const [festivalData, setFestivalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateFestival = async () => {
    if (!festival) {
      alert("Please enter a festival name!");
      return;
    }

    setIsLoading(true);
    setFestivalData(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/generate-festival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ festival }),
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      setFestivalData(data);
    } catch (error) {
      console.error("Failed to fetch festival details:", error);
      alert("Oops! Something went wrong while generating festival details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-800 to-black text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-5xl font-bold text-yellow-300 flex items-center justify-center gap-3">
            <GiFireworkRocket className="animate-bounce" />
            AI Festival Knowledge
          </h1>
          <p className="text-lg mt-2 text-gray-300">
            Enter any festival name to learn its meaning, rituals, story & more.
          </p>
        </header>

        <main>
          <div className="bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-yellow-400/30">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={festival}
                onChange={(e) => setFestival(e.target.value)}
                placeholder="Example: Diwali, Holi, Navratri"
                className="w-full p-4 rounded-xl bg-black/50 text-yellow-200 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleGenerateFestival}
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 text-xl font-bold bg-yellow-400 text-black py-4 rounded-xl hover:bg-yellow-500 transition-transform transform hover:scale-105 disabled:bg-gray-500"
            >
              {isLoading ? (
                <>
                  <span>Fetching details...</span>
                  <GiFireworkRocket className="animate-spin" />
                </>
              ) : (
                <>
                  <span>Generate Festival Info</span>
                  <GiFireworkRocket />
                </>
              )}
            </button>
          </div>

          {festivalData && (
            <div className="mt-8 bg-white/10 p-8 rounded-2xl shadow-2xl text-yellow-200 leading-relaxed space-y-4">
              <h2 className="text-3xl font-bold text-center mb-4 text-yellow-300">{festivalData["त्योहार"]}</h2>

              <p><span className="font-bold text-yellow-400">परिचय:</span> {festivalData["परिचय"]}</p>
              <p><span className="font-bold text-yellow-400">कारण:</span> {festivalData["मनाने_का_कारण"]}</p>
              <p><span className="font-bold text-yellow-400">विधि:</span> {festivalData["मनाने_की_विधि"]}</p>
              <p><span className="font-bold text-yellow-400">अनुष्ठान:</span> {festivalData["अनुष्ठान"]}</p>
              <p><span className="font-bold text-yellow-400">देवता:</span> {festivalData["पूजे_जाने_वाले_देवता"]}</p>
              <p><span className="font-bold text-yellow-400">मंत्र:</span> {festivalData["उपयोग_किए_जाने_वाले_मंत्र"]}</p>
              <p><span className="font-bold text-yellow-400">कहानी:</span> {festivalData["कहानी_के_पीछे"]}</p>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
