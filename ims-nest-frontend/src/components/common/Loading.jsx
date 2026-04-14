const Loading = () => {
  return (
    /* inset-0 + absolute ensures it covers only the parent container */
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px] rounded-[2.5rem]">
      <div className="flex flex-col items-center gap-4">
        {/* The Bouncing Dots Container */}
        <div className="flex items-center gap-2">
          {/* We use animate-bounce for the 'ball' effect and specific colors */}
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" />
        </div>
        
        {/* Transparent Text */}
        <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
};

export default Loading;