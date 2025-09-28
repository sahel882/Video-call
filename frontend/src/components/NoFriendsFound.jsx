const NoFriendsFound = () => {
  return (
    <div className="w-full flex justify-center items-center py-20">
      <div className="card bg-base-200 p-6 tracking-tight ml-[20px] sm:ml-[100px] lg:ml-[250px]">
        <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
        <p className="text-base-content opacity-70">
          Connect with language partners below to start practicing together!
        </p>
      </div>
    </div>
  );
};

export default NoFriendsFound;
