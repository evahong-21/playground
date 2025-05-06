import React, { useState, useEffect, useRef } from 'react';
import appleImg from './assets/apple.png';
import grapeImg from './assets/grape.png';
import peachImg from './assets/peach.png';

const fruitImages = {
  apple: appleImg,
  grape: grapeImg,
  peach: peachImg,
};

const getRandomNumber = () => Math.floor(Math.random() * 9) + 1;
const getRandomFruit = (fruitType) => fruitImages[fruitType];

const FruitMatchGame = () => {
  const [fruitType, setFruitType] = useState('apple');
  const [targetSum, setTargetSum] = useState(10);
  const [fruits, setFruits] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dragPreview, setDragPreview] = useState([]);
  const [score, setScore] = useState(0);
  const isDragging = useRef(false);

  const generateFruits = (type) => {
    const newFruits = Array.from({ length: 36 }, () => ({
      id: crypto.randomUUID(),
      number: getRandomNumber(),
      fruit: getRandomFruit(type),
      removed: false,
    }));
    setFruits(newFruits);
    setSelected([]);
    setDragPreview([]);
  };

  useEffect(() => {
    generateFruits(fruitType);
  }, [fruitType]);

  const handleMouseDown = () => {
    isDragging.current = true;
    setDragPreview([]);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    const sum = dragPreview
      .map((id) => fruits.find((f) => f.id === id)?.number || 0)
      .reduce((acc, val) => acc + val, 0);

    if (sum === targetSum) {
      setScore((prevScore) => prevScore + 1);
      setFruits((prevFruits) =>
        prevFruits.map((f) =>
          dragPreview.includes(f.id) ? { ...f, removed: true } : f
        )
      );
    }

    setSelected([]); // 초기화
    setDragPreview([]);
  };

  const handleMouseEnter = (id) => {
    if (isDragging.current) {
      setDragPreview((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  };

  return (
    <div
      className="p-4 max-w-md mx-auto select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <h1 className="text-2xl font-bold mb-4 text-center">과일 합 맞추기 게임</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <label>
          과일 선택:
          <select
            className="ml-2 border p-1"
            value={fruitType}
            onChange={(e) => setFruitType(e.target.value)}
          >
            <option value="apple">사과</option>
            <option value="grape">포도</option>
            <option value="peach">복숭아</option>
          </select>
        </label>

        <label>
          목표 합:
          <select
            className="ml-2 border p-1"
            value={targetSum}
            onChange={(e) => setTargetSum(parseInt(e.target.value))}
          >
            {[5, 10, 15, 20].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-6 gap-2 justify-center">
        {fruits.map((fruit) => (
          <div key={fruit.id} className="w-14 h-14 sm:w-16 sm:h-16">
            {fruit.removed ? (
              <div className="w-full h-full rounded-xl bg-transparent"></div>
            ) : (
              <button
                onMouseEnter={() => handleMouseEnter(fruit.id)}
                className={`relative w-full h-full flex items-center justify-center text-xl rounded-xl ${
                  dragPreview.includes(fruit.id)
                    ? 'bg-yellow-200 scale-105'
                    : 'bg-white'
                } transition-all duration-200`}
              >
                <img src={fruit.fruit} alt="fruit" className="absolute w-15" />
                <span className="z-10 text-md font-bold text-black">{fruit.number}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <button
          onClick={() => generateFruits(fruitType)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          새로고침
        </button>

        <div className="text-right font-bold text-lg">점수: {score}</div>
      </div>
    </div>
  );
};

export default FruitMatchGame;
