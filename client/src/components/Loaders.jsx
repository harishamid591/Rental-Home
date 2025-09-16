const Loader = ({ fullscreen = false }) => {
    return (
      <div
        className={`flex justify-center items-center ${
          fullscreen ? "fixed inset-0 bg-white z-50" : "h-40"
        }`}
      >
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  };
  
  export default Loader;