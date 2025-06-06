import Image from 'next/image';

export function SocialButtons() {
  return (
    <div className="flex  justify-center items-center gap-2 p-2 border rounded-sm  cursor-pointer hover:bg-slate-100 hover:transition-all hover:duration-500">
      
       <Image src={"/Google.svg"} alt="Google logo" width={20} height={20} />
        <span className="text-sm font-medium md:whitespace-nowrap">
          Sign up with google
        </span>

    </div>
  );
}
