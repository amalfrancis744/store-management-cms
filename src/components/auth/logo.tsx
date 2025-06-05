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

      
    </Link>
  );
}
