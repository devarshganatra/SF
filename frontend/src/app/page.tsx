import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Add Dashboard link */}
      <div className="flex justify-center items-center w-full h-screen">
        <Link
          href="/dashboard"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
        >
          Go to Dashboard
        </Link>
      </div>
    </>
  );
}
