import { User } from 'lucide-react';
import Image from 'next/image';

export function SocialButtons() {
  return (
    <div className="flex  justify-center items-center gap-2 p-2">
      
       <Image src={"/Google.svg"} alt="Google logo" width={20} height={20} />
        <span className="sr-only md:not-sr-only text-sm font-medium md:whitespace-nowrap">
          Sign up with google
        </span>

    </div>
  );
}
