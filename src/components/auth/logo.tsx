import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      {/* PNG Version - with proper sizing */}
      <div className="hidden md:block relative w-32 h-20 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Artisan Bakery Logo"
          fill
          priority
          // width={100}
          //     height={100}
          sizes="(max-width: 768px) 100vw, 128px"
          className="object-contain"
        />
      </div>

      {/* <div className="hidden md:block w-10 h-10">
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M256 32C150 32 64 118 64 224v192h384V224c0-106-86-192-192-192z" 
            fill="#f8d377" 
            stroke="#e3b04b" 
            strokeWidth="12"
          />
          <path 
            d="M128 224c0-70.7 57.3-128 128-128s128 57.3 128 128" 
            fill="none" 
            stroke="#e3b04b" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
          <circle cx="256" cy="160" r="24" fill="#e3b04b" />
          <circle cx="192" cy="192" r="24" fill="#e3b04b" />
          <circle cx="320" cy="192" r="24" fill="#e3b04b" />
          <path 
            d="M64 416h384" 
            stroke="#e3b04b" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
        </svg>
      </div> */}

      {/* <span className="text-2xl font-bold text-amber-900">
        Artisan Bake
      </span> */}
    </Link>
  );
}
