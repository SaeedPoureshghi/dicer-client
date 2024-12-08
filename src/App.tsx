import { useEffect, useState } from "react";
import Dice from "react-dice-roll";
import axios, { AxiosError } from "axios";

function App() {
  const API_URL = import.meta.env.VITE_SERVER_URL;

  const [game, setGame] = useState<IGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roll, setRoll] = useState<Roll>(undefined);
  const [series, setSeries] = useState<Roll[]>([]);
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [Reset, setReset] = useState<boolean>(false);

  async function getRandomNumber() {
    try {
      const new_roll = await axios.get(`${API_URL}/roll?id=${game?.id}`);

      setRoll(new_roll.data.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errmsg = error.response?.data.message;
        setError(errmsg || error.message);
      }
    }
  }

  function updateSeries(value: Roll) {
    setSeries([...series, value]);
    getRandomNumber();
  }

  function checkPriority() {
    if (!game) return;
    if (series.length < game?.numbers.length) return;

    if (game) {
      const isSamePriority =
        series.length === game.numbers.length &&
        series.every((num, index) => num === game.numbers[index]);
      if (!isSamePriority) {
        setIsDisabled(true);
        setTimeout(() => {
          setSeries([]);
          setIsDisabled(false);
        }, 1000);
      } else {
        setScore(score + 100);
      }
      setIsPriority(isSamePriority);
    }
  }

  useEffect(() => {
    if (!game) return;

    console.log(series);

    if (series.length > game?.numbers.length) {
      setSeries(series.slice(1));
    }

    // check if the series is the same as the game numbers add score for each match +4
    series.forEach((num, index) => {
      if (num === game.numbers[index]) {
        setScore(score + 10);
      }
    });

    checkPriority();
  }, [series]);

  useEffect(() => {
    if (game) {
      getRandomNumber();
    }
  }, [game]);

  useEffect(() => {
    async function getGameData() {
      try {
        const new_game = await axios.get(`${API_URL}/start?dim=3`);
        setGame(new_game.data.data);
        setRoll(undefined);
        setSeries([]);
        setIsPriority(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          const errmsg = error.response?.data.message;
          setError(errmsg || error.message);
        }
      }
    }
    getGameData();
  }, [Reset]);

  if (error) {
    return <div>{error}</div>;
  }

  if (game)
    return (
      <div className="main">
        <div className="score">
          <div>Score: {score}</div>
          <button onClick={() => setReset(!Reset)}>Reset</button>
        </div>
        <div className="numbers">
          {game.numbers.map((number, index) => {
            if (series[index] === number) {
              return (
                <div
                  className="number green"
                  key={index}
                  style={{ color: "green" }}
                >
                  {number}
                </div>
              );
            }
            return (
              <div className="number" key={index}>
                {number}
              </div>
            );
          })}
        </div>
        <div className="results">
          {game.numbers.map((num, index) => {
            if (series[index] === undefined) {
              return (
                <div className="number bounce" key={index}>
                  ?
                </div>
              );
            } else {
              return (
                <div className="number" key={index}>
                  {series[index]}
                </div>
              );
            }
          })}
        </div>
          <div className="dice">

        <Dice
          faces={['http://localhost:5173/assets/5.png']}
          disabled={isDisabled}
          size={150}
          cheatValue={roll}
          onRoll={(value) => updateSeries(value)}
          />
        {isPriority && (
          <div>Rolls are in the same priority as game numbers!</div>
        )}
        </div>
      </div>
    );

  return <div>Loading...</div>;
}

export default App;
