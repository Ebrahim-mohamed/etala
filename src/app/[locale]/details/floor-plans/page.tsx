import { TypeButton } from "./TypeButton";

export default function FloorPlan() {
  return (
    <div className="h-full w-full py-[5rem] flex flex-col gap-[5rem]">
      <div className="flex gap-[4rem] flex-1 grow max-[500px]:flex-col">
        <TypeButton
          model="A"
          type="Model A"
          imageName="a"
          data="Building 3-6-9-12"
        />

        <TypeButton
          model="B"
          type="Model B"
          imageName="b"
          data="Building 16-17"
        />

        <TypeButton
          model="C"
          type="Model C"
          imageName="c"
          data="Building 13-14-15"
        />

        <TypeButton
          model="D"
          type="Model D"
          imageName="d"
          data="Building 1-2-4-5"
        />

        <TypeButton
          model="E"
          type="Model E"
          imageName="e"
          data="Building 7-8-10-11"
        />
      </div>
    </div>
  );
}
      // <div className="flex gap-[8rem] flex-1 grow max-[500px]:flex-col">
      //   <TypeComponent content="model-1" />
      //   <TypeComponent content="model-2" />
      // </div>
      // <div className="flex gap-[8rem] flex-1 grow max-[500px]:flex-col">
      //   <TypeComponent content="model-3" />
      //   <TypeComponent content="model-4" />
      // </div>