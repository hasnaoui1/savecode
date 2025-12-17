

const Home = () => {
  

  return (
    <>
      <div className="min-h-screen bg-[#0e0e10] flex flex-col justify-center items-center px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-10">
      
          <div>
            <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight">
              Welcome To <br /> SaveCode
            </h1>
            <p className="text-gray-400 mt-4 text-lg">
              Store, compile, and edit code snippets with other developers on
              SaveCode
            </p>

            <div className="flex mt-6 max-w-md">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-4 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ml-1.5">
                Sign Up
              </button>
            </div>
          </div>

       
          <div className="flex justify-center md:justify-end">
            <img
              src="/logo.png"
              alt="CodeCatch Logo"
              className="w-160 h-160 object-contain"
            />
          </div>
        </div>

        <div className="w-full border-t border-gray-800 mt-20"></div>
      </div>
    </>
  );
};

export default Home;
