import Link from "next/link";
import Image from "next/image";
import Logo from "./svgs/logo.svg";
import Title from "./svgs/title.svg";
import Bar from "./svgs/bar.svg";
import Arrow from "./svgs/arrow.svg";
import LogoSmall from "./svgs/logosmall.svg";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-y-5 pt-24 text-center max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-center gap-x-8 w-full">
        <div className="relative w-[200px] h-[200px]">
          <Image
            src={Logo}
            alt="Logo"
            fill
            priority
            className="object-contain"
          />
        </div>
        <div className="relative w-[400px] h-[100px]">
          <Image
            src={Title}
            alt="Title"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      <div className="text-center text-black text-4xl font-light font-logika">
        The omnibus for RNA interference research and development.
      </div>

      <div className="max-w-[1124px] text-center text-black text-[32px] font-normal font-logika">
        We have compiled over 500 academic papers from PubMed since 2017 to view the relationships between where research today is being done and the relevant populations affected by RNAi diseases and medications.
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="text-black text-2xl font-bold font-logika">
          Insights into the field
        </div>
        <div className="flex justify-center gap-6">
          <Link href="/visualizations" className="block">
            <div className="w-[300px] h-[300px] bg-[#E6EBFF] rounded-[20px] flex flex-col items-center justify-between p-6 hover:shadow-lg hover:scale-105 active:scale-95 transition-transform">
              <div className="text-[#2b4678] text-[32px] font-logika font-bold">
                Visualizations
              </div>
              <div className="relative w-full h-[180px]">
                <Image
                  src={Bar}
                  alt="Bar Chart"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="self-start w-12 h-12 relative">
                <Image
                  src={Arrow}
                  alt="Arrow Icon"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </Link>
          <Link href="/papers" className="block">
            <div className="w-[300px] h-[300px] bg-[#A66538] rounded-[20px] flex flex-col items-center justify-between p-6 hover:shadow-lg hover:scale-105 active:scale-95 transition-transform">
              <div className="text-white text-[32px] font-logika font-bold">
                Papers
              </div>
              <div className="relative w-[120px] h-[120px]">
                <Image
                  src={LogoSmall}
                  alt="Small Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <div className="self-start w-12 h-12 relative">
                <Image
                  src={Arrow}
                  alt="Arrow Icon"
                  fill
                  priority
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div>
          <span className="text-black text-xl font-normal font-logika">
            @2024 by Rebecca Combs and Chesney Birshing. View the GitHub project{" "}
          </span>
          <Link href="https://github.com" className="text-[#4186c7] text-xl font-normal font-logika underline">
            here
          </Link>
          <span className="text-black text-xl font-normal font-logika">.</span>
        </div>
      </div>
    </main>
  );
}