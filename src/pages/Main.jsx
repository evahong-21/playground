import React, { useState, useEffect } from "react";

const Main = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [imageUrl, setImageUrl] = useState("/sin.png"); // public 폴더 경로
  const [time, setTime] = useState(10);

  useEffect(() => {
    // 10초마다 점프 애니메이션
    const interval = setInterval(() => {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 1000);
    }, 10000);

    setTimeout(() => setTime(9), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => (time != 1 ? setTime(time - 1) : setTime(10)), 1000);
  }, [time]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-300 flex items-end justify-center relative overflow-hidden py-16">
      {/* 구름들 */}
      <div className="absolute top-10 left-10 w-20 h-12 bg-white rounded-full opacity-80" />
      <div className="absolute top-20 right-20 w-16 h-10 bg-white rounded-full opacity-70" />
      <div className="absolute top-16 left-1/3 w-24 h-14 bg-white rounded-full opacity-60" />

      {/* 짱구 캐릭터 */}
      <div
        className={`relative transition-all duration-1000 ease-in-out ${
          isJumping ? "transform -translate-y-32" : "transform translate-y-0"
        }`}
      >
        <img
          src={imageUrl}
          alt="짱구 픽셀 아트"
          className="w-40 h-40 pixelated"
          style={{
            imageRendering: "pixelated",
            imageRendering: "-moz-crisp-edges",
            imageRendering: "crisp-edges",
          }}
        />
      </div>

      {/* 점프 효과 */}
      {isJumping && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            {[0, 0.1, 0.2].map((delay, idx) => (
              <div
                key={idx}
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* 바닥 */}
      <div className="absolute bottom-0 w-full h-20 bg-green-400 border-t-4 border-green-600" />

      {/* 텍스트 */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-2xl font-bold text-white drop-shadow-lg">
          짱구가 {time}초마다 점프해요! 🎉
        </p>
        <p className="text-sm text-white drop-shadow-lg mt-2">
          {isJumping ? "점프 중! 🚀" : "다음 점프까지 기다려주세요..."}
        </p>
      </div>
    </div>
  );
};

export default Main;
