export function TypeButton({type,data}:{type:string,data:string}){
    return  <button
          className="h-full grow relative flex gap-[5rem] flex-col items-center text-white justify-center w-full  bg-cover bg-bottom rounded-[2.5rem] shadow-[0px_4px_50px_0px_rgba(0,0,0,0.50)] font-black "
          style={{ backgroundImage: `url(/assets/models/model-1.avif)` }}
        >
            <div className="absolute w-full h-full top-0 right-0 bg-[#0005]"></div>
            <div className="flex flex-col">

            <span className="z-50 text-[6.25rem]">{type}</span>
            <span className="z-50 text-[5rem]">{data}</span>
            </div>
            <div className="flex gap-8">
                <div className="bg-[#0009] text-white text-[4.5rem] px-12 py-6 rounded-2xl">A</div>
                <div className="bg-[#0009] text-white text-[4.5rem] px-12 py-6 rounded-2xl">B</div>
                <div className="bg-[#0009] text-white text-[4.5rem] px-12 py-6 rounded-2xl">C</div>
                <div className="bg-[#0009] text-white text-[4.5rem] px-12 py-6 rounded-2xl">D</div>
            </div>
            </button>
}