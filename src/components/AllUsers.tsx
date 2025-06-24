import { Link } from "react-router-dom";
import { useUser } from "../context/UserContextFolder/useUser";

export default function AllUsers() {
  const { users } = useUser();

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* <h3 className="text-lg font-bold text-gray-800 p-4 border-b shadow-sm sticky top-0 z-10">
        All Users
      </h3> */}

      <div className="flex-1 mt-4 px-4 pb-6 overflow-y-auto scrollbar-hide">
        <ul className="space-y-3">
          {users.map((user) => (
            <Link key={user.id} to={`/profile/${user.id}`}>
              <li className="flex items-start gap-4 p-3 rounded-xl bg-white shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-400 text-white font-bold text-xl flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-800 text-base truncate">
                    {user.username}
                  </span>
                  <p className="text-gray-500 text-sm italic truncate">
                    {user.username}
                  </p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
